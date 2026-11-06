import { db } from "../config/db.js";
import { JobStatus, VideoStatus } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

export class JobService {
  async claimNextJob(workerId: string) {
    return db.$transaction(async (tx) => {
      // Find oldest queued job or stale job locked over 30 mins ago
      const staleThreshold = new Date(Date.now() - 30 * 60 * 1000);

      const job = await tx.transcodeJob.findFirst({
        where: {
          OR: [
            { status: JobStatus.QUEUED },
            {
              status: JobStatus.PROCESSING,
              lockedAt: { lt: staleThreshold },
            },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          uploadAsset: true,
          episode: { include: { anime: true } },
        },
      });

      if (!job) return null;

      // Lock and claim
      const updated = await tx.transcodeJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.PROCESSING,
          workerId,
          lockedAt: new Date(),
          startedAt: job.startedAt || new Date(),
          attempts: { increment: 1 },
        },
        include: {
          uploadAsset: true,
          episode: { include: { anime: true } },
        },
      });

      return updated;
    });
  }

  async updateJobProgress(jobId: string, progressPercent: number) {
    return db.transcodeJob.update({
      where: { id: jobId },
      data: { progressPercent: Math.min(100, Math.max(0, progressPercent)) },
    });
  }

  async completeJob(
    jobId: string,
    data: {
      masterPlaylistKey: string;
      durationSeconds: number;
      resolution: string;
      bitrate: number;
      videoCodec?: string;
      audioCodec?: string;
    },
  ) {
    const job = await db.transcodeJob.findUnique({
      where: { id: jobId },
      include: { episode: true },
    });
    if (!job) throw new NotFoundError("Job not found");

    // Upsert VideoAsset
    const asset = await db.videoAsset.upsert({
      where: { episodeId: job.episodeId },
      update: {
        masterPlaylistKey: data.masterPlaylistKey,
        durationSeconds: data.durationSeconds,
        resolution: data.resolution,
        bitrate: data.bitrate,
        videoCodec: data.videoCodec || "h264",
        audioCodec: data.audioCodec || "aac",
        status: VideoStatus.READY,
      },
      create: {
        episodeId: job.episodeId,
        masterPlaylistKey: data.masterPlaylistKey,
        durationSeconds: data.durationSeconds,
        resolution: data.resolution,
        bitrate: data.bitrate,
        videoCodec: data.videoCodec || "h264",
        audioCodec: data.audioCodec || "aac",
        status: VideoStatus.READY,
      },
    });

    // Mark job READY
    const updatedJob = await db.transcodeJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.READY,
        progressPercent: 100,
        completedAt: new Date(),
      },
    });

    return { job: updatedJob, asset };
  }

  async failJob(jobId: string, errorMessage: string) {
    const job = await db.transcodeJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job not found");

    const willRetry = job.attempts < job.maxAttempts;

    return db.transcodeJob.update({
      where: { id: jobId },
      data: {
        status: willRetry ? JobStatus.QUEUED : JobStatus.FAILED,
        errorLog: `[${new Date().toISOString()}] Attempt ${job.attempts}: ${errorMessage}\n${job.errorLog || ""}`,
        workerId: null,
        lockedAt: null,
      },
    });
  }

  async retryJob(jobId: string) {
    const job = await db.transcodeJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job not found");

    return db.transcodeJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.QUEUED,
        attempts: 0,
        errorLog: `${job.errorLog || ""}\n[Admin Re-queued]`,
        workerId: null,
        lockedAt: null,
        progressPercent: 0,
      },
    });
  }
}

export const jobService = new JobService();

