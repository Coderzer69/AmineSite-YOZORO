import { Storage } from "@google-cloud/storage";
import type { StorageAdapter, ObjectMetadata } from "./storage.interface.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export class GoogleCloudStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor() {
    this.storage = new Storage({
      projectId: env.GCS_PROJECT_ID,
    });
  }

  async initiateResumableUpload(
    bucketName: string,
    objectName: string,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<{ uploadUrl: string }> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(objectName);

    const [uploadUrl] = await file.createResumableUpload({
      metadata: {
        contentType,
        metadata,
      },
      origin: "*",
    });

    return { uploadUrl };
  }

  async verifyObject(bucketName: string, objectName: string): Promise<ObjectMetadata | null> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (!exists) return null;

      const [metadata] = await file.getMetadata();
      return {
        size: Number(metadata.size || 0),
        contentType: metadata.contentType || "application/octet-stream",
        md5Hash: metadata.md5Hash,
        crc32c: metadata.crc32c,
        updatedAt: new Date(metadata.updated || Date.now()),
      };
    } catch (err) {
      logger.error({ err, bucketName, objectName }, "Failed to verify GCS object");
      return null;
    }
  }

  async getSignedDownloadUrl(
    bucketName: string,
    objectName: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(objectName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + expiresInSeconds * 1000,
    });

    return url;
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    localFilePath: string,
    contentType: string,
  ): Promise<void> {
    const bucket = this.storage.bucket(bucketName);
    await bucket.upload(localFilePath, {
      destination: objectName,
      contentType,
      resumable: false,
    });
  }

  async downloadFile(
    bucketName: string,
    objectName: string,
    destinationPath: string,
  ): Promise<void> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(objectName);
    await file.download({ destination: destinationPath });
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.delete({ ignoreNotFound: true });
    } catch (err) {
      logger.warn({ err, bucketName, objectName }, "Failed to delete GCS object");
    }
  }
}

