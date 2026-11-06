import { db } from "../config/db.js";
import { storage } from "../storage/index.js";
import { env } from "../config/env.js";
import { signStreamingToken, verifyStreamingToken } from "../utils/crypto.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export class ManifestService {
  async getPlaybackManifest(params: {
    animeId: string;
    episodeNumber: number;
    userId?: string;
  }) {
    const episode = await db.episode.findUnique({
      where: {
        animeId_number: {
          animeId: params.animeId,
          number: params.episodeNumber,
        },
      },
      include: {
        anime: true,
        videoAsset: true,
        subtitles: true,
      },
    });

    if (!episode) throw new NotFoundError("Episode not found");
    if (!episode.isPublished) throw new ForbiddenError("Episode is not published yet");

    // Generate signed HMAC token valid for STREAMING_TOKEN_TTL_SECONDS
    const exp = Math.floor(Date.now() / 1000) + env.STREAMING_TOKEN_TTL_SECONDS;
    const token = signStreamingToken({
      userId: params.userId || "anonymous",
      animeId: params.animeId,
      episodeNumber: params.episodeNumber,
      exp,
    });

    const streamUrl = `${env.API_PREFIX}/playback/stream/${token}/master.m3u8`;

    return {
      animeId: episode.animeId,
      episodeNumber: episode.number,
      title: episode.title,
      streamUrl,
      subtitles: episode.subtitles.map((s) => ({
        id: s.id,
        language: s.language,
        label: s.label,
        url: `${env.API_PREFIX}/playback/subtitles/${s.id}`,
        isDefault: s.isDefault,
      })),
      servers: [
        "Server 1 (YOZORO High-Speed)",
        "Server 2 (Backup Edge)",
        "Server 3 (Direct CDN)",
      ],
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  }

  async getSecuredMasterPlaylist(token: string): Promise<string> {
    const payload = verifyStreamingToken(token);
    if (!payload) throw new ForbiddenError("Invalid or expired streaming token");

    const mediaPrefix = `media/${payload.animeId}/ep_${payload.episodeNumber}`;
    const masterKey = `${mediaPrefix}/master.m3u8`;

    // If in local mode or GCS, verify or fetch playlist content
    const metadata = await storage.verifyObject(env.GCS_MEDIA_BUCKET, masterKey);
    if (!metadata) {
      // In case video asset was registered with demo artwork/stream fallback
      return [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        `#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1920x1080,NAME="1080p"`,
        `variant_1080p.m3u8`,
        "",
      ].join("\n");
    }

    // In local storage, read file directly
    if (env.STORAGE_DRIVER === "local") {
      const fs = await import("fs/promises");
      const path = await import("path");
      const fullPath = path.join(path.resolve(env.LOCAL_STORAGE_PATH), env.GCS_MEDIA_BUCKET, masterKey);
      return fs.readFile(fullPath, "utf8");
    }

    // GCS: fetch via signed download
    const signedUrl = await storage.getSignedDownloadUrl(env.GCS_MEDIA_BUCKET, masterKey, 60);
    const res = await fetch(signedUrl);
    return res.text();
  }

  async getSecuredVariantPlaylist(token: string, variantName: string): Promise<string> {
    const payload = verifyStreamingToken(token);
    if (!payload) throw new ForbiddenError("Invalid or expired streaming token");

    // Sanitize variant name
    if (!/^[a-zA-Z0-9_-]+\.m3u8$/.test(variantName)) {
      throw new ForbiddenError("Invalid variant playlist name");
    }

    const mediaPrefix = `media/${payload.animeId}/ep_${payload.episodeNumber}`;
    const variantKey = `${mediaPrefix}/${variantName}`;

    let content = "";
    if (env.STORAGE_DRIVER === "local") {
      const fs = await import("fs/promises");
      const path = await import("path");
      const fullPath = path.join(path.resolve(env.LOCAL_STORAGE_PATH), env.GCS_MEDIA_BUCKET, variantKey);
      try {
        content = await fs.readFile(fullPath, "utf8");
      } catch {
        content = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:6\n#EXTINF:6.0,\nsegment_0000.ts\n#EXT-X-ENDLIST\n";
      }
    } else {
      const signedUrl = await storage.getSignedDownloadUrl(env.GCS_MEDIA_BUCKET, variantKey, 60);
      const res = await fetch(signedUrl);
      content = await res.text();
    }

    // Rewrite segments in the playlist to pass through the tokenized endpoint
    // e.g. segment_0001.ts -> segment_0001.ts (relative to current path in browser)
    return content;
  }

  async authorizeSegmentAccess(token: string, segmentFilename: string): Promise<string | { localPath: string }> {
    const payload = verifyStreamingToken(token);
    if (!payload) throw new ForbiddenError("Invalid or expired streaming token");

    // Prevent Path Traversal
    if (!/^[a-zA-Z0-9_-]+\.ts$/.test(segmentFilename)) {
      throw new ForbiddenError("Malformed segment file name");
    }

    const mediaPrefix = `media/${payload.animeId}/ep_${payload.episodeNumber}`;
    const segmentKey = `${mediaPrefix}/${segmentFilename}`;

    if (env.STORAGE_DRIVER === "gcs") {
      // Generate short-lived signed GCS URL (60 seconds)
      return storage.getSignedDownloadUrl(env.GCS_MEDIA_BUCKET, segmentKey, 60);
    }

    // Local mode
    const path = await import("path");
    const localPath = path.join(path.resolve(env.LOCAL_STORAGE_PATH), env.GCS_MEDIA_BUCKET, segmentKey);
    return { localPath };
  }
}

export const manifestService = new ManifestService();

