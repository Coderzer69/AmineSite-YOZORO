# VIDEO WORKER SETUP GUIDE — YOZORO

This guide details how to configure, run, and scale the local video transcoding worker.

---

## 1. Prerequisites

1. **FFmpeg & FFprobe:**
   - Must be installed on the worker host and available in system `PATH` (or configured via `FFMPEG_PATH` and `FFPROBE_PATH` in `.env`).
   - On Windows:
     ```powershell
     winget install Gyan.FFmpeg
     ```
   - On Ubuntu / Debian:
     ```bash
     sudo apt-get update && sudo apt-get install -y ffmpeg
     ```

2. **Node.js:**
   - Node.js v20+ LTS or v22+.

---

## 2. Worker Configuration

Configure `backend/.env`:
```env
WORKER_API_KEY=your-secure-worker-api-key
PORT=4000
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
```

---

## 3. Running the Worker

From `backend/`:

```powershell
# Start worker in development / foreground mode
npm run worker
```

### Running with PM2 (Recommended for Production Background Execution)

```bash
npm install -g pm2
pm2 start video-tools/worker/worker.ts --name yozoro-worker --interpreter tsx
pm2 logs yozoro-worker
```

