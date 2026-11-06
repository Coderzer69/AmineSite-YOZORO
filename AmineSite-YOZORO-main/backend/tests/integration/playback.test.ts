import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Authorized Playback API", () => {
  const app = createApp();

  it("GET /api/v1/playback/ashen-lantern/1/manifest should return authorized manifest", async () => {
    const res = await request(app).get("/api/v1/playback/ashen-lantern/1/manifest");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("streamUrl");
    expect(res.body).toHaveProperty("servers");
    expect(res.body.streamUrl).toContain("/api/v1/playback/stream/");
    expect(res.body.streamUrl).toContain("/master.m3u8");
  });

  it("GET /api/v1/playback/stream/:token/master.m3u8 with valid token should return m3u8 playlist", async () => {
    // 1. Get manifest
    const manifestRes = await request(app).get("/api/v1/playback/ashen-lantern/1/manifest");
    const streamUrl = manifestRes.body.streamUrl;

    // 2. Fetch master playlist
    const res = await request(app).get(streamUrl);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/vnd.apple.mpegurl");
    expect(res.text).toContain("#EXTM3U");
  });

  it("GET /api/v1/playback/stream/INVALID_TOKEN/master.m3u8 should return 403 Forbidden", async () => {
    const res = await request(app).get("/api/v1/playback/stream/INVALID_TOKEN/master.m3u8");
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

