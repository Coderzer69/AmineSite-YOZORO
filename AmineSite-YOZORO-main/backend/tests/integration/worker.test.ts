import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { db } from "../../src/config/db.js";
import { env } from "../../src/config/env.js";
import { JobStatus, UploadStatus } from "@prisma/client";

describe("Worker & Job Management API", () => {
  const app = createApp();

  it("POST /api/v1/worker/jobs/claim without X-Worker-Key should return 401", async () => {
    const res = await request(app).post("/api/v1/worker/jobs/claim");
    expect(res.status).toBe(401);
  });

  it("POST /api/v1/worker/jobs/claim with valid key should claim queued job atomically", async () => {
    // 1. Create a dummy queued job
    const anime = await db.anime.findFirst();
    const episode = await db.episode.findFirst({ where: { animeId: anime!.id } });

    const uploadAsset = await db.uploadAsset.create({
      data: {
        episodeId: episode!.id,
        gcsObjectName: `staging/${anime!.id}/test_raw.mp4`,
        originalFilename: "test_raw.mp4",
        status: UploadStatus.VERIFIED,
      },
    });

    const job = await db.transcodeJob.create({
      data: {
        uploadAssetId: uploadAsset.id,
        episodeId: episode!.id,
        status: JobStatus.QUEUED,
      },
    });

    // 2. Worker claims job
    const claimRes = await request(app)
      .post("/api/v1/worker/jobs/claim")
      .set("X-Worker-Key", env.WORKER_API_KEY)
      .send({ workerId: "test-worker-unit-1" });

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.success).toBe(true);
    expect(claimRes.body.job.id).toBe(job.id);
    expect(claimRes.body.job.animeId).toBe(anime!.id);

    // 3. Worker updates progress
    const progRes = await request(app)
      .post(`/api/v1/worker/jobs/${job.id}/progress`)
      .set("X-Worker-Key", env.WORKER_API_KEY)
      .send({ percent: 50 });

    expect(progRes.status).toBe(200);
    expect(progRes.body.progressPercent).toBe(50);

    // 4. Worker completes job
    const compRes = await request(app)
      .post(`/api/v1/worker/jobs/${job.id}/complete`)
      .set("X-Worker-Key", env.WORKER_API_KEY)
      .send({
        masterPlaylistKey: `media/${anime!.id}/ep_${episode!.number}/master.m3u8`,
        durationSeconds: 1440,
        resolution: "1080p",
        bitrate: 2500000,
        videoCodec: "h264",
        audioCodec: "aac",
      });

    expect(compRes.status).toBe(200);
    expect(compRes.body.success).toBe(true);
    expect(compRes.body.job.status).toBe(JobStatus.READY);
    expect(compRes.body.asset).toHaveProperty("masterPlaylistKey");
  });
});

