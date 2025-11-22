# Croppa - Build & Distribution Guide

This guide explains how to build and package the Croppa video editing application for distribution.

---

## 📋 Prerequisites

Before building, ensure you have:

- ✅ **Node.js** (v16 or higher)
- ✅ **Python** (3.10 or higher)
- ✅ **FFmpeg** (installed and in PATH)
- ✅ **All dependencies installed** (see below)

---

## 🔧 Initial Setup

### 1. Install Frontend Dependencies

```powershell
cd frontend
npm install
```

### 2. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 3. Verify FFmpeg

```powershell
ffmpeg -version
```

If FFmpeg is not found, download it from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

---

## 🏗️ Building the Application

### Option 1: Development Build (Quick Test)

This creates a build for testing without packaging:

```powershell
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist
```

### Option 2: Production Build (Electron Package)

This creates a distributable Windows executable:

```powershell
cd frontend
npm run build
npm run electron-build
```

**Output Location:**
- The `.exe` installer will be in: `frontend/dist-electron/`
- Look for files like: `Croppa Setup 1.0.0.exe`

---

## 📦 Build Configuration

### Electron Builder Settings

The build is configured in `frontend/package.json` under the `"build"` section:

```json
{
  "build": {
    "appId": "com.croppa.app",
    "productName": "Croppa",
    "directories": {
      "output": "dist-electron"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.png"
    },
    "files": [
      "dist/**/*",
      "electron.js",
      "preload.js",
      "../backend/**/*"
    ]
  }
}
```

### Customization Options

You can customize the build by editing `package.json`:

- **App Name**: Change `"productName"`
- **App ID**: Change `"appId"`
- **Icon**: Replace `assets/icon.png` with your own icon (256x256 PNG)
- **Installer Type**: Change `"target"` (nsis, portable, zip, etc.)

---

## 🎯 Build Scripts Reference

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build frontend for production |
| `npm run electron` | Run Electron app in development |
| `npm run electron-build` | Build distributable Electron app |

### Backend Scripts

The backend is bundled with the Electron app and starts automatically.

---

## 📁 Distribution Package Contents

The built application includes:

```
Croppa/
├── Croppa.exe                 # Main executable
├── resources/
│   ├── app.asar              # Packaged frontend
│   └── backend/              # Python backend
│       ├── app.py
│       ├── vad_processor.py
│       ├── video_editor.py
│       └── requirements.txt
├── ffmpeg.exe                # FFmpeg binary (if bundled)
└── [other Electron files]
```

---

## 🚀 Deployment Checklist

Before distributing your build:

- [ ] Test the built `.exe` on a clean Windows machine
- [ ] Verify FFmpeg is accessible (bundled or in PATH)
- [ ] Test video processing with various file formats
- [ ] Check file management features work correctly
- [ ] Verify settings persistence
- [ ] Test on different Windows versions (10, 11)
- [ ] Create user documentation (README, usage guide)

---

## 🔍 Bundling FFmpeg (Optional)

To include FFmpeg with your distribution:

### Method 1: Manual Bundling

1. Download FFmpeg Windows build (static)
2. Extract `ffmpeg.exe` to `frontend/resources/`
3. Update `package.json` build files:

```json
"files": [
  "dist/**/*",
  "electron.js",
  "preload.js",
  "../backend/**/*",
  "resources/ffmpeg.exe"
]
```

4. Update backend to use bundled FFmpeg:

```python
# In video_editor.py
import os
import sys

# Get FFmpeg path
if getattr(sys, 'frozen', False):
    # Running as bundled app
    ffmpeg_path = os.path.join(sys._MEIPASS, 'ffmpeg.exe')
else:
    # Running in development
    ffmpeg_path = 'ffmpeg'  # Use system FFmpeg
```

### Method 2: User Installation

Alternatively, document that users need to install FFmpeg separately:

1. Create an installer script that checks for FFmpeg
2. Provide download link in README
3. Show error message if FFmpeg not found

---

## 🐛 Troubleshooting Build Issues

### Issue: "Module not found" errors

**Solution:**
```powershell
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Issue: Python dependencies missing in build

**Solution:**
Ensure `backend/requirements.txt` is included in the build files.

### Issue: Backend not starting in built app

**Solution:**
Check that Python is bundled or available on target system. Consider using PyInstaller to create standalone Python executable:

```powershell
cd backend
pip install pyinstaller
pyinstaller --onefile app.py
```

Then include the generated `dist/app.exe` instead of Python scripts.

### Issue: Large file size

**Solution:**
- Remove unnecessary dependencies
- Use `electron-builder` compression
- Don't bundle FFmpeg (require user installation)

---

## 📊 Build Size Optimization

To reduce the final package size:

1. **Remove dev dependencies:**
   ```powershell
   npm prune --production
   ```

2. **Compress with electron-builder:**
   ```json
   "build": {
     "compression": "maximum"
   }
   ```

3. **Exclude unnecessary files:**
   ```json
   "files": [
     "!**/*.map",
     "!**/*.md",
     "!**/test/**"
   ]
   ```

---

## 🔐 Code Signing (Optional)

For production distribution, consider code signing:

1. Obtain a code signing certificate
2. Configure in `package.json`:

```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "your-password"
}
```

---

## 📝 Creating an Installer

The default NSIS installer includes:

- ✅ Desktop shortcut creation
- ✅ Start menu entry
- ✅ Uninstaller
- ✅ File associations (optional)

To customize the installer, create `build/installer.nsh`:

```nsis
!macro customInstall
  ; Custom installation steps
!macroend
```

---

## 🎁 Distribution Methods

### Method 1: Direct Download

1. Upload `.exe` to your website/GitHub releases
2. Users download and run the installer
3. Provide SHA256 checksum for verification

### Method 2: Microsoft Store

1. Package as MSIX
2. Submit to Microsoft Partner Center
3. Requires developer account ($19/year)

### Method 3: Portable Version

Build a portable version (no installation required):

```json
"win": {
  "target": ["nsis", "portable"]
}
```

---

## 📖 Post-Build Documentation

Create these files for users:

1. **README.md** - Overview and features
2. **INSTALL.md** - Installation instructions
3. **USER_GUIDE.md** - How to use the app
4. **CHANGELOG.md** - Version history
5. **LICENSE** - Software license

---

## 🔄 Auto-Updates (Advanced)

To enable automatic updates:

1. Set up update server
2. Configure in `package.json`:

```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "croppa"
  }
}
```

3. Use `electron-updater` in your app

---

## ✅ Final Steps

After building:

1. **Test thoroughly** on multiple machines
2. **Create release notes** documenting features and fixes
3. **Generate checksums** for security verification
4. **Upload to distribution platform**
5. **Announce release** to users

---

## 📞 Support

For build issues:
- Check the [Electron Builder docs](https://www.electron.build/)
- Review the [Vite build guide](https://vitejs.dev/guide/build.html)
- Check console output for specific errors

---

**Happy Building! 🚀**
