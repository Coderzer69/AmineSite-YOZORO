import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import type { StorageAdapter, ObjectMetadata } from "./storage.interface.js";
import { env } from "../config/env.js";

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor(baseDir = env.LOCAL_STORAGE_PATH) {
    this.baseDir = path.resolve(baseDir);
    fsSync.mkdirSync(this.baseDir, { recursive: true });
  }

  private getFilePath(bucketName: string, objectName: string): string {
    // Sanitize path against directory traversal
    const safePath = path.normalize(objectName).replace(/^(\.\.(\/|\\|$))+/, "");
    return path.join(this.baseDir, bucketName, safePath);
  }

  async initiateResumableUpload(
    bucketName: string,
    objectName: string,
    _contentType: string,
    _metadata?: Record<string, string>,
  ): Promise<{ uploadUrl: string }> {
    const filePath = this.getFilePath(bucketName, objectName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Local dev upload URL points to the local express upload receiver
    const uploadUrl = `http://localhost:${env.PORT}${env.API_PREFIX}/uploads/direct-storage/${bucketName}/${encodeURIComponent(objectName)}`;
    return { uploadUrl };
  }

  async verifyObject(bucketName: string, objectName: string): Promise<ObjectMetadata | null> {
    try {
      const filePath = this.getFilePath(bucketName, objectName);
      const stat = await fs.stat(filePath);
      const content = await fs.readFile(filePath);
      const md5Hash = crypto.createHash("md5").update(content).digest("base64");

      return {
        size: stat.size,
        contentType: "application/octet-stream",
        md5Hash,
        updatedAt: stat.mtime,
      };
    } catch {
      return null;
    }
  }

  async getSignedDownloadUrl(
    bucketName: string,
    objectName: string,
    _expiresInSeconds: number,
  ): Promise<string> {
    return `http://localhost:${env.PORT}${env.API_PREFIX}/playback/storage-file/${bucketName}/${encodeURIComponent(objectName)}`;
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    localFilePath: string,
    _contentType: string,
  ): Promise<void> {
    const targetPath = this.getFilePath(bucketName, objectName);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(localFilePath, targetPath);
  }

  async downloadFile(
    bucketName: string,
    objectName: string,
    destinationPath: string,
  ): Promise<void> {
    const sourcePath = this.getFilePath(bucketName, objectName);
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    try {
      const filePath = this.getFilePath(bucketName, objectName);
      await fs.unlink(filePath);
    } catch {}
  }
}

