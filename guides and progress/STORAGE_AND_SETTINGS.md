# Storage, Cleanup & Settings Explanation

## 📁 Storage & Memory Management

### File Locations

```
antigravity/
├── backend/
│   ├── uploads/          ← Original uploaded videos (INPUT)
│   ├── outputs/          ← Processed videos (OUTPUT - downloadable)
│   ├── temp/             ← Temporary processing files (AUTO-DELETED)
│   │   ├── *.wav         ← Extracted audio (deleted after processing)
│   │   └── batch_*/      ← Batch intermediate files (deleted after processing)
```

### Cleanup Mechanism

#### 1. **Temporary Audio Files** (`temp/*.wav`)
- **Created**: When audio is extracted from video
- **Deleted**: Immediately after processing completes
- **Location**: `backend/app.py` line 149-150
```python
if os.path.exists(audio_path):
    os.remove(audio_path)
```

#### 2. **Batch Processing Temp Directory** (`temp/batch_*`)
- **Created**: For each video processing job
- **Contains**: Intermediate batch files (e.g., `batch_0.mp4`, `batch_1.mp4`)
- **Deleted**: Automatically in `finally` block, even if processing fails
- **Location**: `backend/video_editor.py` lines 166-172
```python
finally:
    # Safe cleanup
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)  # Deletes entire directory
    except Exception as cleanup_error:
        print(f"Warning: Failed to clean up temp directory: {cleanup_error}")
```

#### 3. **Uploaded Videos** (`uploads/`)
- **Created**: When user uploads a video
- **Deleted**: ❌ **NOT automatically deleted**
- **Reason**: Allows re-processing with different settings
- **Manual Cleanup**: You need to manually delete old uploads

#### 4. **Output Videos** (`outputs/`)
- **Created**: Final processed videos
- **Deleted**: ❌ **NOT automatically deleted**
- **Reason**: User may want to download multiple times
- **Manual Cleanup**: You need to manually delete old outputs

### Memory Usage

- **RAM**: 
  - PyTorch VAD model: ~500MB
  - Audio processing: ~100MB per minute of video
  - **Total**: Usually 1-2GB during processing

- **Disk**:
  - **Temporary**: 2x video size (deleted after processing)
  - **Permanent**: Original + Processed video (not deleted)

### Recommended Cleanup Strategy

**Option 1: Manual Cleanup**
```powershell
# Delete old uploads
Remove-Item backend/uploads/* -Force

# Delete old outputs
Remove-Item backend/outputs/* -Force
```

**Option 2: Add Automatic Cleanup**
You could modify `app.py` to delete uploads after processing:
```python
# After line 150, add:
if os.path.exists(input_path):
    os.remove(input_path)  # Delete uploaded file after processing
```

---

## ⚙️ Settings Behavior Explained

### Why "Lower Settings" = "Larger Files"

**This is CORRECT behavior!** Here's why:

### Video Quality Settings (CRF/CQ)

**CRF (CPU) and CQ (GPU) work inversely:**

| Setting | Quality | File Size | Use Case |
|---------|---------|-----------|----------|
| **0-17** | Visually lossless | Very large | Archival, professional editing |
| **18-23** | High quality (Recommended) | Large | YouTube, general use |
| **24-28** | Good quality | Medium | Streaming, web |
| **29-51** | Low quality | Small | Low bandwidth, previews |

**Example:**
- CQ = 15 → Better quality → Larger file (e.g., 500MB)
- CQ = 28 → Lower quality → Smaller file (e.g., 100MB)

### Why This Happens

FFmpeg uses **constant quality** encoding:
- **Lower CQ** = "Keep more detail" = More bits needed = Larger file
- **Higher CQ** = "Compress more aggressively" = Less bits = Smaller file

### Audio Bitrate (Works Normally)

Audio bitrate works as expected:
- **Higher bitrate** (320kbps) = Better quality = Larger file
- **Lower bitrate** (96kbps) = Lower quality = Smaller file

---

## 🐛 Progress Bar Issue

### Current Status
- ✅ Progress updates in **backend console**
- ❌ Progress NOT updating in **UI**

### Diagnosis Steps

1. **Check if polling is working:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - You should see: `Progress poll: 32` every 500ms

2. **If you see the logs:**
   - Polling is working
   - State update might be blocked
   - Try adding `console.log('Setting progress:', data.progress)` before `setUploadProgress`

3. **If you DON'T see the logs:**
   - CORS issue or backend not responding
   - Check Network tab for failed requests

### Potential Fixes

**Fix 1: Force Re-render**
The issue might be that React isn't detecting the state change. Try this in `App.tsx`:

```typescript
setUploadProgress(prev => data.progress); // Force new reference
```

**Fix 2: Check if isProcessing is true**
Add this log:
```typescript
console.log('isProcessing:', isProcessing, 'Progress:', data.progress);
```

**Fix 3: Verify endpoint**
Test the endpoint manually:
```powershell
curl http://127.0.0.1:8000/progress
```

---

## 🔍 Verification Checklist

### Settings Working?
- [ ] Backend console shows correct settings values
- [ ] Lower CQ = Larger output file
- [ ] Higher CQ = Smaller output file
- [ ] Audio bitrate changes file size proportionally

### Cleanup Working?
- [ ] `temp/` directory is empty after processing
- [ ] No `*.wav` files in `temp/` after processing
- [ ] `uploads/` and `outputs/` still contain files (expected)

### Progress Bar?
- [ ] Backend console shows progress updates
- [ ] Browser console shows `Progress poll: X`
- [ ] UI progress bar updates (currently broken)

---

## 📊 File Size Expectations

For a 10-minute 1080p video:

| CQ Setting | Expected Output Size |
|------------|---------------------|
| CQ = 15 | ~800MB - 1.2GB |
| CQ = 19 (default) | ~400MB - 600MB |
| CQ = 23 | ~200MB - 300MB |
| CQ = 28 | ~100MB - 150MB |

**Note**: Actual size depends on content complexity (talking head vs action scenes).

---

## 🚀 Next Steps

1. **Reload frontend** with `Ctrl+R`
2. **Open DevTools** (F12) → Console tab
3. **Process a video** and watch for `Progress poll:` logs
4. **Report back** what you see in the console!
