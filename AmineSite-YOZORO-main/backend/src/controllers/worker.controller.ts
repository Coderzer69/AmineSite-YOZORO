import type { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.service.js";

export class WorkerController {
  async claim(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerId = String(req.body.workerId || `worker-${process.pid}`);
      const job = await jobService.claimNextJob(workerId);
      if (!job) {
        res.status(204).send(); // No content / No jobs currently queued
        return;
      }

      res.json({
        success: true,
        job: {
          id: job.id,
          uploadAssetId: job.uploadAssetId,
          episodeId: job.episodeId,
          attempts: job.attempts,
          gcsObjectName: job.uploadAsset?.gcsObjectName,
          animeId: job.episode.animeId,
          episodeNumber: job.episode.number,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async progress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const { percent } = req.body;
      const job = await jobService.updateJobProgress(jobId, Number(percent));
      res.json({ success: true, progressPercent: job.progressPercent });
    } catch (err) {
      next(err);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const { masterPlaylistKey, durationSeconds, resolution, bitrate, videoCodec, audioCodec } = req.body;

      const result = await jobService.completeJob(jobId, {
        masterPlaylistKey,
        durationSeconds: Number(durationSeconds),
        resolution: String(resolution),
        bitrate: Number(bitrate),
        videoCodec,
        audioCodec,
      });

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async fail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const { error } = req.body;
      const job = await jobService.failJob(jobId, String(error || "Unknown worker error"));
      res.json({ success: true, status: job.status });
    } catch (err) {
      next(err);
    }
  }
}

export const workerController = new WorkerController();

