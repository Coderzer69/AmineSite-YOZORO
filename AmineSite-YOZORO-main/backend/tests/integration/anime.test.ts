import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Anime Catalogue & Discovery API", () => {
  const app = createApp();

  it("GET /api/v1/anime/spotlight should return top 5 anime", async () => {
    const res = await request(app).get("/api/v1/anime/spotlight");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(5);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("title");
    expect(res.body[0]).toHaveProperty("rating");
    expect(res.body[0]).toHaveProperty("genres");
  });

  it("GET /api/v1/anime/genres should return list of genres", async () => {
    const res = await request(app).get("/api/v1/anime/genres");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toContain("Action");
    expect(res.body).toContain("Fantasy");
  });

  it("GET /api/v1/anime/ashen-lantern should return anime details", async () => {
    const res = await request(app).get("/api/v1/anime/ashen-lantern");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("ashen-lantern");
    expect(res.body.title).toBe("Ashen Lantern");
    expect(res.body.rating).toBe(9.1);
  });

  it("GET /api/v1/anime/non-existent-anime should return 404", async () => {
    const res = await request(app).get("/api/v1/anime/non-existent-anime");
    expect(res.status).toBe(404);
  });

  it("GET /api/v1/anime/ashen-lantern/episodes should return episode list", async () => {
    const res = await request(app).get("/api/v1/anime/ashen-lantern/episodes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("number", 1);
  });

  it("GET /api/v1/anime/search?q=lantern should return matching anime", async () => {
    const res = await request(app).get("/api/v1/anime/search?q=lantern");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title.toLowerCase()).toContain("lantern");
  });

  it("GET /api/v1/anime/browse?genre=Fantasy&page=1 should return paginated BrowseResult", async () => {
    const res = await request(app).get("/api/v1/anime/browse?genre=Fantasy&page=1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("pages");
    expect(res.body).toHaveProperty("page", 1);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("GET /api/v1/anime/schedule should return day-mapped schedule", async () => {
    const res = await request(app).get("/api/v1/anime/schedule");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("Mon");
    expect(res.body).toHaveProperty("Sun");
  });
});

