# BULK UPLOAD CLI GUIDE — YOZORO

The YOZORO Bulk Upload CLI automates uploading and indexing large video batches from local storage into the YOZORO platform.

---

## 1. Directory Scanning Mode

Place video files in a folder following standard naming conventions:
- `<animeId>_ep<number>.mp4`
- Example: `ashen-lantern_ep01.mp4`, `tidebound_ep02.mkv`

Run:
```powershell
Set-Location backend
npm run bulk-upload -- --dir "C:\AnimeRips\Fall2026"
```

The CLI will:
1. Log in with admin credentials.
2. Scan the directory.
3. Compute SHA-256 checksums.
4. Request signed upload URLs from the backend.
5. Upload files directly to the staging bucket.
6. Trigger backend verification and queue transcoding jobs.

---

## 2. CSV Manifest Mode

For complete control over titles and episode numbering, provide a CSV manifest file:

`manifest.csv`:
```csv
filePath,animeId,episodeNumber,title
C:\Rips\saffron_01.mp4,blade-of-saffron,1,The Red Knife
C:\Rips\saffron_02.mp4,blade-of-saffron,2,Ghost of the Tea House
```

Run:
```powershell
Set-Location backend
npm run bulk-upload -- --manifest "manifest.csv"
```

