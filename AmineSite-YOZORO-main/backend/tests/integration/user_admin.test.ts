import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("User & Admin APIs Integration", () => {
  const app = createApp();

  let adminCookie: any;

  it("Log in as admin", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@yozoro.moe",
      password: "AdminPassword123!",
    });
    expect(loginRes.status).toBe(200);
    adminCookie = loginRes.headers["set-cookie"];
  });

  it("POST /api/v1/user/watchlist/ashen-lantern should add anime to watchlist", async () => {
    const res = await request(app)
      .post("/api/v1/user/watchlist/ashen-lantern")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(201);
    expect(res.body.inWatchlist).toBe(true);
  });

  it("GET /api/v1/user/watchlist should list user's watchlist", async () => {
    const res = await request(app).get("/api/v1/user/watchlist").set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: any) => a.id === "ashen-lantern")).toBe(true);
  });

  it("POST /api/v1/user/progress should record episode playback progress", async () => {
    const res = await request(app)
      .post("/api/v1/user/progress")
      .set("Cookie", adminCookie)
      .send({
        animeId: "ashen-lantern",
        episodeNumber: 1,
        positionSeconds: 360,
        durationSeconds: 1440,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.progress.positionSeconds).toBe(360);
  });

  it("GET /api/v1/admin/stats should return dashboard statistics", async () => {
    const res = await request(app).get("/api/v1/admin/stats").set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toHaveProperty("totalUsers");
    expect(res.body.stats).toHaveProperty("totalAnime");
    expect(res.body.stats).toHaveProperty("totalEpisodes");
  });

  it("POST /api/v1/admin/invitations should create new invitation", async () => {
    const res = await request(app)
      .post("/api/v1/admin/invitations")
      .set("Cookie", adminCookie)
      .send({ daysValid: 14 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.invitation).toHaveProperty("code");
    expect(res.body.invitation.code).toContain("YOZORO-");
  });
});
