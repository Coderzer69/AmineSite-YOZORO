import { env } from "../config/env.js";
import type { StorageAdapter } from "./storage.interface.js";
import { GoogleCloudStorageAdapter } from "./gcs.storage.js";
import { LocalStorageAdapter } from "./local.storage.js";
import { logger } from "../utils/logger.js";

export function createStorage(): StorageAdapter {
  if (env.STORAGE_DRIVER === "gcs") {
    logger.info("📦 Storage configured for Google Cloud Storage");
    return new GoogleCloudStorageAdapter();
  }
  logger.info("📁 Storage configured for Local File System");
  return new LocalStorageAdapter();
}

export const storage = createStorage();

