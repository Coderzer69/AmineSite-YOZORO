import fs from "fs/promises";
import path from "path";
import os from "os";
import { ffmpegPipeline } from "../shared/ffmpeg.js";
import { storage } from "../../src/storage/index.js";
import { env } from "../../src/config/env.js";
import { logger } from "../../src/utils/logger.js";

const WORKER_ID = `worker-${os.hostname()}-${process.pid}`;
const API_BASE = `http://localhost:${env.PORT}${env.API_PREFIX}`;
const POLL_INTERVAL_MS = 5000;

let isRunning = true;

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Worker-Key": env.WORKER_API_KEY,
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}] ${endpoint}: ${errorText}`);
  }

  return res.json() as Promise<T>;
}

async function processJob(job: {
  id: string;
  uploadAssetId: string;
  episodeId: string;
  attempts: number;
  gcsObjectName: string;
  animeId: string;
  episodeNumber: number;
}) {
  logger.info({ jobId: job.id, animeId: job.animeId, episode: job.episodeNumber }, "Starting job transcoding");

  const tempDir = path.join(os.tmpdir(), "yozoro_transcode", job.id);
  const inputPath = path.join(tempDir, "input_source.mp4");
  const outputDir = path.join(tempDir, "hls_output");

  try {
    await fs.mkdir(tempDir, { recursive: true });

    // 1. Download source from staging
    logger.info({ gcsObjectName: job.gcsObjectName }, "Downloading source from staging");
    await storage.downloadFile(env.GCS_STAGING_BUCKET, job.gcsObjectName, inputPath);

    // 2. Transcode to HLS
    const result = await ffmpegPipeline.transcodeToHls(inputPath, outputDir, async (percent) => {
      logger.debug({ jobId: job.id, percent }, "Transcoding progress");
      await apiRequest(`/worker/jobs/${job.id}/progress`, {
        method: "POST",
        body: JSON.stringify({ percent }),
      }).catch(() => {});
    });

    // 3. Upload HLS files to Media bucket
    const mediaPrefix = `media/${job.animeId}/ep_${job.episodeNumber}`;
    const generatedFiles = await fs.readdir(outputDir);

    for (const fileName of generatedFiles) {
      const localFilePath = path.join(outputDir, fileName);
      const destinationObjectName = `${mediaPrefix}/${fileName}`;
      const contentType = fileName.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp2t";

      await storage.uploadFile(env.GCS_MEDIA_BUCKET, destinationObjectName, localFilePath, contentType);
    }

    const masterPlaylistKey = `${mediaPrefix}/master.m3u8`;

    // 4. Mark Complete
    await apiRequest(`/worker/jobs/${job.id}/complete`, {
      method: "POST",
      body: JSON.stringify({
        masterPlaylistKey,
        durationSeconds: result.durationSeconds,
        resolution: result.resolution,
        bitrate: result.bitrate,
        videoCodec: "h264",
        audioCodec: "aac",
      }),
    });

    logger.info({ jobId: job.id, masterPlaylistKey }, "Transcode job completed successfully");
  } catch (err: any) {
    logger.error({ err, jobId: job.id }, "Job processing failed");
    await apiRequest(`/worker/jobs/${job.id}/fail`, {
      method: "POST",
      body: JSON.stringify({ error: err?.message || "Unknown transcoding error" }),
    }).catch((e) => logger.error({ err: e }, "Failed to report job failure to backend"));
  } finally {
    // 5. Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function startWorker() {
  logger.info(`👷 YOZORO Local Video Worker starting (ID: ${WORKER_ID})...`);

  while (isRunning) {
    try {
      const response = await apiRequest<{
        success: boolean;
        job: {
          id: string;
          uploadAssetId: string;
          episodeId: string;
          attempts: number;
          gcsObjectName: string;
          animeId: string;
          episodeNumber: number;
        };
      }>("/worker/jobs/claim", {
        method: "POST",
        body: JSON.stringify({ workerId: WORKER_ID }),
      });

      if (response && response.job) {
        await processJob(response.job);
      } else {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    } catch (err: any) {
      logger.warn({ message: err?.message }, "Worker poll cycle encountered error, retrying...");
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }
}

// If executed directly
if (process.argv[1]?.endsWith("worker.ts") || process.argv[1]?.endsWith("worker.js")) {
  startWorker().catch((e) => {
    logger.error({ err: e }, "Worker fatal error");
    process.exit(1);
  });
}

process.on("SIGINT", () => {
  isRunning = false;
  logger.info("Worker shutting down gracefully");
});

