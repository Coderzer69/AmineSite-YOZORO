import { db } from "../config/db.js";
import { storage } from "../storage/index.js";
import { env } from "../config/env.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";
import { UploadStatus, JobStatus } from "@prisma/client";

export class UploadService {
  async initiateUpload(params: {
    animeId: string;
    episodeNumber: number;
    originalFilename: string;
    fileSize?: number;
    title?: string;
  }) {
    const anime = await db.anime.findUnique({
      where: { id: params.animeId },
    });
    if (!anime) throw new NotFoundError("Anime not found");

    // Ensure episode record exists or create draft episode
    let episode = await db.episode.findUnique({
      where: {
        animeId_number: {
          animeId: params.animeId,
          number: params.episodeNumber,
        },
      },
    });

    if (!episode) {
      episode = await db.episode.create({
        data: {
          animeId: params.animeId,
          number: params.episodeNumber,
          title: params.title || `Episode ${params.episodeNumber}`,
          duration: anime.duration,
          isPublished: false,
        },
      });
    }

    const cleanFilename = params.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const gcsObjectName = `staging/${anime.id}/ep_${params.episodeNumber}_${Date.now()}_${cleanFilename}`;

    const uploadAsset = await db.uploadAsset.create({
      data: {
        episodeId: episode.id,
        gcsObjectName,
        originalFilename: params.originalFilename,
        fileSize: BigInt(params.fileSize || 0),
        status: UploadStatus.INITIALIZED,
      },
    });

    const { uploadUrl } = await storage.initiateResumableUpload(
      env.GCS_STAGING_BUCKET,
      gcsObjectName,
      "video/mp4",
      {
        animeId: anime.id,
        episodeId: episode.id,
        uploadAssetId: uploadAsset.id,
      },
    );

    return {
      uploadId: uploadAsset.id,
      uploadUrl,
      gcsObjectName,
      episodeId: episode.id,
    };
  }

  async completeUpload(uploadId: string) {
    const asset = await db.uploadAsset.findUnique({
      where: { id: uploadId },
      include: { episode: true },
    });
    if (!asset) throw new NotFoundError("Upload asset not found");

    // Verify in storage
    const metadata = await storage.verifyObject(env.GCS_STAGING_BUCKET, asset.gcsObjectName);
    if (!metadata || metadata.size === 0) {
      await db.uploadAsset.update({
        where: { id: uploadId },
        data: { status: UploadStatus.FAILED },
      });
      throw new BadRequestError("Uploaded file not found or empty in storage bucket");
    }

    const updatedAsset = await db.uploadAsset.update({
      where: { id: uploadId },
      data: {
        status: UploadStatus.VERIFIED,
        fileSize: BigInt(metadata.size),
      },
    });

    // Create Transcode Job
    const job = await db.transcodeJob.create({
      data: {
        uploadAssetId: updatedAsset.id,
        episodeId: updatedAsset.episodeId,
        status: JobStatus.QUEUED,
        maxAttempts: 3,
      },
    });

    return { asset: updatedAsset, job };
  }

  async getUploadStatus(uploadId: string) {
    const asset = await db.uploadAsset.findUnique({
      where: { id: uploadId },
      include: {
        transcodeJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!asset) throw new NotFoundError("Upload asset not found");

    return {
      uploadId: asset.id,
      status: asset.status,
      fileSize: asset.fileSize.toString(),
      job: asset.transcodeJobs[0] || null,
    };
  }
}

export const uploadService = new UploadService();

