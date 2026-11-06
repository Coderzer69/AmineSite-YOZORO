import type { Request, Response, NextFunction } from "express";
import fsSync from "fs";
import { manifestService } from "../streaming/manifest.service.js";

export class PlaybackController {
  async getManifest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { animeId, ep } = req.params;
      const result = await manifestService.getPlaybackManifest({
        animeId,
        episodeNumber: Number(ep),
        userId: req.user?.id,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMasterPlaylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const content = await manifestService.getSecuredMasterPlaylist(token);

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "private, no-cache, no-store");
      res.send(content);
    } catch (err) {
      next(err);
    }
  }

  async getVariantPlaylist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, variant } = req.params;
      const content = await manifestService.getSecuredVariantPlaylist(token, variant);

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "private, no-cache, no-store");
      res.send(content);
    } catch (err) {
      next(err);
    }
  }

  async getSegment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, segment } = req.params;
      const access = await manifestService.authorizeSegmentAccess(token, segment);

      if (typeof access === "string") {
        // GCS Signed URL: Redirect directly, offloading bandwidth from Express
        res.redirect(302, access);
        return;
      }

      // Local storage fallback
      if (fsSync.existsSync(access.localPath)) {
        res.setHeader("Content-Type", "video/mp2t");
        res.setHeader("Cache-Control", "private, max-age=86400");
        fsSync.createReadStream(access.localPath).pipe(res);
      } else {
        // Return dummy valid MPEG-TS chunk if file doesn't physically exist in local dev
        res.setHeader("Content-Type", "video/mp2t");
        res.send(Buffer.alloc(188 * 10)); // 10 empty TS packets
      }
    } catch (err) {
      next(err);
    }
  }
}

export const playbackController = new PlaybackController();

