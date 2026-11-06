import crypto from "crypto";
import argon2 from "argon2";
import { env } from "../config/env.js";

// Argon2id Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// Session Tokens (Cryptographically random tokens)
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Invitation Codes (e.g. YOZORO-XXXX-XXXX)
export function generateInvitationCode(): string {
  const segment1 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const segment2 = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `YOZORO-${segment1}-${segment2}`;
}

// HMAC Streaming Tokens
export interface StreamingTokenPayload {
  userId: string;
  animeId: string;
  episodeNumber: number;
  exp: number; // Unix timestamp in seconds
}

export function signStreamingToken(payload: StreamingTokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", env.STREAMING_TOKEN_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifyStreamingToken(token: string): StreamingTokenPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", env.STREAMING_TOKEN_SECRET)
      .update(data)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as StreamingTokenPayload;
    if (Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

