import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../../src/config/env.js";

interface BulkManifestItem {
  filePath: string;
  animeId: string;
  episodeNumber: number;
  title?: string;
}

const API_BASE = `http://localhost:${env.PORT}${env.API_PREFIX}`;

async function computeSha256(filePath: string): Promise<string> {
  const hash = crypto.createHash("sha256");
  const stream = fsSync.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function uploadDirectly(uploadUrl: string, filePath: string) {
  const stat = await fs.stat(filePath);
  const stream = fsSync.createReadStream(filePath);

  const res = await fetch(uploadUrl, {
    method: "PUT",
    // @ts-ignore
    body: stream,
    duplex: "half",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": stat.size.toString(),
    },
  });

  if (!res.ok) {
    throw new Error(`Upload to storage failed with status ${res.status}`);
  }
}

async function parseCsvManifest(csvPath: string): Promise<BulkManifestItem[]> {
  const content = await fs.readFile(csvPath, "utf8");
  const lines = content.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const items: BulkManifestItem[] = [];

  // Expected headers: filePath,animeId,episodeNumber,title
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((s) => s.trim());
    if (parts.length >= 3) {
      items.push({
        filePath: parts[0],
        animeId: parts[1],
        episodeNumber: Number(parts[2]),
        title: parts[3] || `Episode ${parts[2]}`,
      });
    }
  }

  return items;
}

async function scanDirectory(dirPath: string): Promise<BulkManifestItem[]> {
  const files = await fs.readdir(dirPath);
  const items: BulkManifestItem[] = [];

  const videoRegex = /^([a-zA-Z0-9-_]+)[-_](?:ep|episode)?[-_]?(\d+)\.(mp4|mkv|mov)$/i;

  for (const file of files) {
    const match = file.match(videoRegex);
    if (match) {
      const animeId = match[1].toLowerCase();
      const episodeNumber = parseInt(match[2], 10);
      items.push({
        filePath: path.join(dirPath, file),
        animeId,
        episodeNumber,
        title: `Episode ${episodeNumber}`,
      });
    }
  }

  return items;
}

export async function runBulkUpload(args: string[]) {
  console.log("🚀 YOZORO Bulk Upload CLI");
  console.log("==========================================");

  let targetDir = "";
  let manifestPath = "";
  let adminToken = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dir" && args[i + 1]) targetDir = args[++i];
    if (args[i] === "--manifest" && args[i + 1]) manifestPath = args[++i];
    if (args[i] === "--token" && args[i + 1]) adminToken = args[++i];
  }

  if (!targetDir && !manifestPath) {
    console.log("Usage:");
    console.log("  tsx video-tools/bulk-upload/cli.ts --dir <folder> [--token <admin-token>]");
    console.log("  tsx video-tools/bulk-upload/cli.ts --manifest <manifest.csv> [--token <admin-token>]");
    return;
  }

  // If token is missing, attempt admin login
  if (!adminToken) {
    console.log("🔑 Authenticating as admin...");
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@yozoro.moe", password: "AdminPassword123!" }),
    });

    if (!loginRes.ok) {
      console.error("❌ Failed to authenticate. Please provide a valid admin token via --token.");
      return;
    }
    const data = (await loginRes.json()) as any;
    adminToken = data.token;
    console.log("✅ Admin authentication successful.");
  }

  let items: BulkManifestItem[] = [];
  if (manifestPath) {
    console.log(`📄 Reading manifest: ${manifestPath}`);
    items = await parseCsvManifest(manifestPath);
  } else if (targetDir) {
    console.log(`📁 Scanning directory: ${targetDir}`);
    items = await scanDirectory(targetDir);
  }

  console.log(`📋 Found ${items.length} video item(s) to process.\n`);

  let successCount = 0;
  let failCount = 0;

  for (const item of items) {
    console.log(`▶ Processing: ${path.basename(item.filePath)} -> ${item.animeId} Ep.${item.episodeNumber}`);

    try {
      const stat = await fs.stat(item.filePath);
      const checksum = await computeSha256(item.filePath);

      // 1. Initiate upload
      const initRes = await fetch(`${API_BASE}/uploads/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          animeId: item.animeId,
          episodeNumber: item.episodeNumber,
          originalFilename: path.basename(item.filePath),
          fileSize: stat.size,
          title: item.title,
        }),
      });

      if (!initRes.ok) {
        throw new Error(`Failed to initiate upload: ${await initRes.text()}`);
      }
      const initData = (await initRes.json()) as any;

      // 2. Upload video bytes to storage
      console.log(`   ⬆ Uploading (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
      await uploadDirectly(initData.uploadUrl, item.filePath);

      // 3. Complete upload
      const compRes = await fetch(`${API_BASE}/uploads/${initData.uploadId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!compRes.ok) {
        throw new Error(`Failed to verify upload: ${await compRes.text()}`);
      }

      const compData = (await compRes.json()) as any;
      console.log(`   ✅ Queued for transcoding (Job ID: ${compData.job.id})\n`);
      successCount++;
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err.message}\n`);
      failCount++;
    }
  }

  console.log("==========================================");
  console.log(`🎉 Finished: ${successCount} succeeded, ${failCount} failed.`);
}

if (process.argv[1]?.endsWith("cli.ts") || process.argv[1]?.endsWith("cli.js")) {
  runBulkUpload(process.argv.slice(2)).catch(console.error);
}
