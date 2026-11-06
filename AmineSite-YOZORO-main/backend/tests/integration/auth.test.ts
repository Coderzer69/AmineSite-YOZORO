import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { db } from "../../src/config/db.js";
import { generateInvitationCode } from "../../src/utils/crypto.js";

describe("Authentication & Session Integration", () => {
  const app = createApp();

  it("POST /api/v1/auth/login with valid admin credentials should return 200 and set-cookie", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin@yozoro.moe",
      password: "AdminPassword123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("email", "admin@yozoro.moe");
    expect(res.body.user).toHaveProperty("role", "ADMIN");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toContain("yozoro_session=");
  });

  it("POST /api/v1/auth/login with invalid password should return 401", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin@yozoro.moe",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/auth/register with valid invitation code should register user", async () => {
    const testUsername = `user_${Date.now()}`;
    const testEmail = `${testUsername}@test.com`;

    // Fetch admin user to create invitation
    const admin = await db.user.findFirst({ where: { role: "ADMIN" } });

    // Create a fresh unused invitation code
    const freshCode = generateInvitationCode();
    await db.invitation.create({
      data: {
        code: freshCode,
        createdById: admin!.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      username: testUsername,
      email: testEmail,
      password: "UserPassword123!",
      invitationCode: freshCode,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("username", testUsername);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /api/v1/auth/register with invalid invitation code should return 400", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      username: `invalid_${Date.now()}`,
      email: `invalid_${Date.now()}@test.com`,
      password: "UserPassword123!",
      invitationCode: "INVALID-CODE-9999",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/auth/me should return 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/auth/me should return user profile with valid session cookie", async () => {
    // 1. Log in
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "admin@yozoro.moe",
      password: "AdminPassword123!",
    });
    const cookie = loginRes.headers["set-cookie"];

    // 2. Fetch /me
    const meRes = await request(app).get("/api/v1/auth/me").set("Cookie", cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe("admin@yozoro.moe");
  });
});
