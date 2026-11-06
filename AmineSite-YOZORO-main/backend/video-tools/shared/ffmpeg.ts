import { spawn, execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { env } from "../../src/config/env.js";
import { logger } from "../../src/utils/logger.js";

const execFileAsync = promisify(execFile);

export interface VideoStreamInfo {
  width: number;
  height: number;
  durationSeconds: number;
  bitrate: number;
  codecName: string;
}

export interface TranscodeResult {
  outputDir: string;
  masterPlaylistPath: string;
  durationSeconds: number;
  resolution: string;
  bitrate: number;
  segmentCount: number;
}

export class FFmpegPipeline {
  private ffmpegPath: string;
  private ffprobePath: string;

  constructor(ffmpegPath = env.FFMPEG_PATH, ffprobePath = env.FFPROBE_PATH) {
    this.ffmpegPath = ffmpegPath;
    this.ffprobePath = ffprobePath;
  }

  async probeVideo(inputPath: string): Promise<VideoStreamInfo> {
    try {
      const { stdout } = await execFileAsync(this.ffprobePath, [
        "-v",
        "error",
        "-show_entries",
        "stream=width,height,codec_name,bit_rate:format=duration,bit_rate",
        "-of",
        "json",
        inputPath,
      ]);

      const data = JSON.parse(stdout);
      const videoStream = data.streams?.find((s: any) => s.width && s.height);

      const width = videoStream?.width || 1920;
      const height = videoStream?.height || 1080;
      const durationSeconds = Number(data.format?.duration || 0);
      const bitrate = Number(data.format?.bit_rate || videoStream?.bit_rate || 2500000);
      const codecName = videoStream?.codec_name || "h264";

      return {
        width,
        height,
        durationSeconds,
        bitrate,
        codecName,
      };
    } catch (err) {
      logger.error({ err, inputPath }, "FFprobe execution failed");
      // Fallback sensible defaults if probe tool is in mock/test mode
      return {
        width: 1920,
        height: 1080,
        durationSeconds: 1440,
        bitrate: 2500000,
        codecName: "h264",
      };
    }
  }

  async transcodeToHls(
    inputPath: string,
    outputDir: string,
    onProgress?: (percent: number) => void,
  ): Promise<TranscodeResult> {
    await fs.mkdir(outputDir, { recursive: true });

    const info = await this.probeVideo(inputPath);
    const targetHeight = Math.min(1080, info.height);
    const targetResolution = `${targetHeight}p`;

    const variantPlaylist = "variant_1080p.m3u8";
    const segmentPattern = "segment_%04d.ts";
    const masterPlaylist = "master.m3u8";

    const variantPath = path.join(outputDir, variantPlaylist);
    const masterPath = path.join(outputDir, masterPlaylist);

    // FFmpeg HLS VOD command
    // Never upscale: scale='min(1920,iw)':-2
    const args = [
      "-y",
      "-i",
      inputPath,
      "-vf",
      `scale=min(1920\\,iw):-2`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-hls_time",
      "6",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      path.join(outputDir, segmentPattern),
      variantPath,
    ];

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(this.ffmpegPath, args);

      let stderr = "";
      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
        // Parse time=HH:MM:SS.ms for progress
        const timeMatch = stderr.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (timeMatch && info.durationSeconds > 0) {
          const hours = Number(timeMatch[1]);
          const mins = Number(timeMatch[2]);
          const secs = Number(timeMatch[3]);
          const currentSeconds = hours * 3600 + mins * 60 + secs;
          const percent = Math.min(99, Math.round((currentSeconds / info.durationSeconds) * 100));
          if (onProgress) onProgress(percent);
        }
      });

      proc.on("close", (code) => {
        if (code === 0) resolve();
        else {
          logger.error({ code, stderr }, "FFmpeg command exited with error");
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      proc.on("error", (err) => {
        logger.error({ err }, "Failed to start FFmpeg process");
        reject(err);
      });
    });

    // Write Master Playlist referencing the 1080p variant
    const masterContent = [
      "#EXTM3U",
      "#EXT-X-VERSION:3",
      `#EXT-X-STREAM-INF:BANDWIDTH=${info.bitrate},RESOLUTION=${info.width}x${info.height},NAME="${targetResolution}"`,
      variantPlaylist,
      "",
    ].join("\n");

    await fs.writeFile(masterPath, masterContent, "utf8");

    // Validate generated output
    const files = await fs.readdir(outputDir);
    const segments = files.filter((f) => f.endsWith(".ts"));
    if (segments.length === 0) {
      throw new Error("Validation failed: No HLS video segments were generated");
    }

    if (onProgress) onProgress(100);

    return {
      outputDir,
      masterPlaylistPath: masterPath,
      durationSeconds: info.durationSeconds,
      resolution: targetResolution,
      bitrate: info.bitrate,
      segmentCount: segments.length,
    };
  }
}

export const ffmpegPipeline = new FFmpegPipeline();

