# Bug Fixes Summary

## ✅ Fixed Issues

### 1. **JSON Download Button** 
- Changed from large gray button to small, subtle text link
- Now appears below the main download button in a low-key gray color
- Maintains functionality while being less prominent

### 2. **Progress Bar** 
- **Root Cause**: Progress wasn't being reset to 0 when processing started
- **Fix**: Added `setUploadProgress(0)` at the start of `handleProcessVideo`
- **Result**: Progress bar now correctly shows:
  - 0% → Upload starts
  - 0-100% → Upload progress
  - 0% → Processing starts (resets)
  - 0-10% → Audio extraction
  - 10-20% → Speech detection
  - 20-100% → Video processing

### 3. **Settings Verification**
- **Added Debug Logging**: Backend now prints all settings when processing starts
- **Settings Flow**: Frontend → Backend → FFmpeg
  - Silence threshold, min silence duration, padding → VAD
  - Batch size, CRF, CQ, preset, audio bitrate → Video encoding

## 🔍 How to Verify

### Test Progress Bar:
1. Restart backend: `taskkill /F /IM python.exe` then `cd backend && python app.py`
2. Reload frontend: Press `Ctrl+R` in Electron
3. Upload a video and watch the progress bar
4. It should start at 0% and gradually increase

### Test Settings:
1. Open settings (gear icon)
2. Change batch size to 10
3. Change video CQ to 25
4. Apply and process a video
5. Check backend console - you should see:
```
=== Settings ===
Silence Threshold: -40.0 dB
Min Silence Duration: 0.5s
Padding: 0.25s
Batch Size: 10
Video CRF: 18
Video CQ: 25
Video Preset: p4
Audio Bitrate: 192k
```

### Test JSON Button:
1. Process a video
2. On finish screen, you'll see:
   - Large orange "Download Video (.mp4)" button
   - Small gray "Download metadata (.json)" text link below it

## 📝 Technical Details

### Progress Bar Fix
**File**: `frontend/src/App.tsx`
```typescript
const handleProcessVideo = async (filename: string) => {
  setIsProcessing(true);
  setUploadProgress(0); // ← Added this line
  setLogs(['Starting processing...']);
  // ...
}
```

### Settings Logging
**File**: `backend/app.py`
```python
print(f"\n=== Settings ===")
print(f"Batch Size: {request.batch_size}")
print(f"Video CQ: {request.video_cq}")
# ... etc
```

### JSON Button
**File**: `frontend/src/components/FinishScreen.tsx`
```typescript
<button
  onClick={onDownloadMetadata}
  className="text-gray-500 hover:text-gray-300 text-sm ..."
>
  Download metadata (.json)
</button>
```

---

**Status**: All three issues should now be resolved. Please restart both backend and frontend to test!
