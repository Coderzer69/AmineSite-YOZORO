import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Upload Workflow API", () => {
  const app = createApp();

  let adminCookie: any;

  it("Authenticate as admin", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@yozoro.moe",
      password: "AdminPassword123!",
    });
    expect(loginRes.status).toBe(200);
    adminCookie = loginRes.headers["set-cookie"];
  });

  it("POST /api/v1/uploads/initiate should require admin auth", async () => {
    const res = await request(app).post("/api/v1/uploads/initiate").send({
      animeId: "ashen-lantern",
      episodeNumber: 4,
      originalFilename: "ashen_lantern_ep4.mp4",
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/v1/uploads/initiate with admin session should create upload record and return upload URL", async () => {
    const res = await request(app)
      .post("/api/v1/uploads/initiate")
      .set("Cookie", adminCookie)
      .send({
        animeId: "ashen-lantern",
        episodeNumber: 4,
        originalFilename: "ashen_lantern_ep4.mp4",
        fileSize: 1024000,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("uploadId");
    expect(res.body).toHaveProperty("uploadUrl");
    expect(res.body).toHaveProperty("gcsObjectName");
  });
});
