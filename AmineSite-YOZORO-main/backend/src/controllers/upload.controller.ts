import type { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import { uploadService } from "../services/upload.service.js";
import { env } from "../config/env.js";

export class UploadController {
  async initiate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { animeId, episodeNumber, originalFilename, fileSize, title } = req.body;
      const result = await uploadService.initiateUpload({
        animeId,
        episodeNumber: Number(episodeNumber),
        originalFilename,
        fileSize: fileSize ? Number(fileSize) : undefined,
        title,
      });

      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uploadId } = req.params;
      const result = await uploadService.completeUpload(uploadId);
      res.json({
        success: true,
        asset: {
          ...result.asset,
          fileSize: result.asset.fileSize.toString(),
        },
        job: result.job,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uploadId } = req.params;
      const status = await uploadService.getUploadStatus(uploadId);
      res.json({
        success: true,
        ...status,
      });
    } catch (err) {
      next(err);
    }
  }

  // Receiver for local storage direct upload testing
  async handleLocalDirectUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bucketName, objectName } = req.params;
      const safePath = path.normalize(decodeURIComponent(objectName)).replace(/^(\.\.(\/|\\|$))+/, "");
      const fullPath = path.join(path.resolve(env.LOCAL_STORAGE_PATH), bucketName, safePath);

      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(fullPath, buffer);
        res.status(200).json({ success: true, size: buffer.length });
      });
      req.on("error", (err) => next(err));
    } catch (err) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();

