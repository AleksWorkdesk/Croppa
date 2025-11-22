# File Management Feature

## ✨ New Features Added

### Settings Panel - File Management Section

The settings panel now includes a comprehensive file management system that allows you to:

1. **View Stored Files**
   - See all uploaded videos
   - See all processed output videos
   - View file sizes and total storage used

2. **Open Folders**
   - "Open Folder" buttons for uploads and outputs
   - Opens Windows Explorer directly to the folder

3. **Delete Files**
   - Delete individual files (click ✕ next to filename)
   - Delete all uploads
   - Delete all outputs
   - Delete ALL files (uploads + outputs) with one button

4. **Live Updates**
   - Auto-loads files when settings panel opens
   - Manual refresh button
   - Updates after deletions

## 🔧 Backend Endpoints

### GET `/files`
Lists all stored files with metadata:
```json
{
  "uploads": [
    {"name": "video.mp4", "size": 12345678, "type": "upload"}
  ],
  "outputs": [
    {"name": "video_processed.mp4", "size": 8765432, "type": "output"}
  ],
  "total_size": 21111110
}
```

### DELETE `/files/{file_type}/{filename}`
Delete a specific file:
- `file_type`: "upload" or "output"
- `filename`: name of the file to delete

### DELETE `/files/all/{file_type}`
Delete all files of a type:
- `file_type`: "upload", "output", or "all"

### GET `/files/open-folder/{folder_type}`
Open folder in Windows Explorer:
- `folder_type`: "upload" or "output"

## 🎨 UI Features

### Storage Summary
- Shows total storage used
- Displays count of uploads and outputs
- Real-time file size formatting (Bytes, KB, MB, GB)

### File Lists
- Scrollable lists (max height to avoid overflow)
- Shows filename and size for each file
- Truncates long filenames
- Delete button (✕) for each file

### Confirmation Dialogs
- Confirms before deleting individual files
- Confirms before deleting all files
- Different messages for different delete actions

### Visual Design
- Matches dark theme
- Orange accent colors
- Smooth hover effects
- Disabled state for empty lists
- Custom scrollbar styling

## 📁 Folder Structure

```
backend/
├── uploads/          ← Original videos (managed by file system)
├── outputs/          ← Processed videos (managed by file system)
└── temp/             ← Auto-deleted temporary files
```

## 🚀 How to Use

1. **Open Settings**: Click the gear icon ⚙️ on the upload screen
2. **Scroll to File Management**: Third section in settings panel
3. **View Files**: See all stored files automatically
4. **Open Folder**: Click "📁 Open Folder" to browse in Explorer
5. **Delete Files**: 
   - Click ✕ next to a file to delete it
   - Click "Delete All" to remove all files in a category
   - Click "Delete All Files" to clear everything

## ⚠️ Important Notes

- **Confirmation Required**: All delete operations require confirmation
- **No Undo**: Deleted files cannot be recovered
- **Temp Files**: Temporary processing files are auto-deleted (not shown)
- **Windows Only**: Folder opening uses Windows Explorer

## 🔄 Auto-Refresh

Files are loaded:
- When settings panel opens
- After any delete operation
- When clicking the refresh button

## 💾 Storage Management Tips

**Regular Cleanup:**
- Delete uploads after successful processing
- Keep outputs only as long as needed
- Use "Delete All" for bulk cleanup

**Disk Space:**
- Check total storage regularly
- Processed files are usually smaller than uploads
- Temp files don't count (auto-deleted)

## 🎯 Next Steps

1. **Reload Frontend**: `Ctrl+R` to see changes
2. **Open Settings**: Click gear icon
3. **Test File Management**: Try viewing and deleting files
4. **Check Folders**: Use "Open Folder" to verify

Enjoy the new file management features! 🎉
