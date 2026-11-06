import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Health Check API", () => {
  const app = createApp();

  it("GET /health should return 200 and healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("service", "yozoro-backend");
  });

  it("GET /api/v1/health should return 200 and healthy status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("GET /api/v1 should return API directory", async () => {
    const res = await request(app).get("/api/v1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "YOZORO Streaming API");
    expect(res.body).toHaveProperty("version", "1.0.0");
  });
});
