import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:3001,http://localhost:3002")
    .transform((val) => val.split(",").map((s) => s.trim())),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/yozoro?schema=public"),
  SESSION_SECRET: z.string().min(16).default("super-secret-random-key-at-least-32-chars-long-yozoro"),
  SESSION_TTL_HOURS: z.coerce.number().default(72),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  STORAGE_DRIVER: z.enum(["local", "gcs"]).default("local"),
  LOCAL_STORAGE_PATH: z.string().default("./storage_data"),
  GCS_PROJECT_ID: z.string().default("yozoro-cloud-project"),
  GCS_STAGING_BUCKET: z.string().default("yozoro-staging"),
  GCS_MEDIA_BUCKET: z.string().default("yozoro-media"),
  WORKER_API_KEY: z.string().min(8).default("worker-secure-shared-key-for-transcoder"),
  FFMPEG_PATH: z.string().default("ffmpeg"),
  FFPROBE_PATH: z.string().default("ffprobe"),
  STREAMING_TOKEN_SECRET: z.string().min(16).default("streaming-hmac-secret-at-least-32-chars"),
  STREAMING_TOKEN_TTL_SECONDS: z.coerce.number().default(7200),
  ANILIST_API_URL: z.string().url().default("https://graphql.anilist.co"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment configuration");
  }
  return result.data;
}

export const env = parseEnv();

