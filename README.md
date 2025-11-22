# Croppa

**Simple Video Silence Remover**

Automatically remove silent parts from your videos using intelligent audio detection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F.svg)](https://www.electronjs.org/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Development](#-development) • [Configuration](#-configuration)

---

## 📖 Overview

Croppa is a simple desktop application that intelligently trims silent portions from your videos. Perfect for content creators, educators and anyone who spends too much cutting out silent video segments and doesn't want to do that. This is a drag-n-drop, click Process, click Download app with a few settings to adjust the trimming.
<div align=center> 
<img width="414" height="147" alt="0" src="https://github.com/user-attachments/assets/9a621ac2-3bd6-4dc9-948f-1c7a88e4bb66" />
</div>

**Key Highlights:**
-  **Algorithm-Powered**: Uses RMS energy-based algorithm to accurately detect sounds (speech included) vs silence
-  **100% Offline**: All processing happens locally on your machine - no cloud uploads required
-  **GPU Accelerated**: Optional NVIDIA GPU support (h264_nvenc) for faster video encoding
-  **Beautiful UI**: Modern, intuitive dark mode interface built with React and Tailwind CSS
-  **Cross-Platform**: Built with Electron for Windows, macOS, and Linux support

<img width="1183" height="795" alt="1" src="https://github.com/user-attachments/assets/7dbe7c99-c4c9-4a6b-819b-72792d22dbfc" />
## ✨ Features

### Core Functionality
- **Silence Detection**: Algorithm detects and removes silent segments with high accuracy
- **Multiple Format Support**: Works with `.mp4`, `.mov`, `.m4v`, `.avi` and more
- **Customizable Settings**: Adjust silence threshold, minimum silence duration and padding
- **Project Export**: Export to video or Shotcut MLT format for further editing
- **File Management**: Built-in file browser and cleanup tools

### Advanced Options
- **GPU Acceleration**: Leverage NVIDIA CUDA for faster processing
- **Quality Control**: Configurable video encoding settings (CRF, preset, bitrate)
- **Real-time Progress**: Live progress tracking and detailed logs

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **Desktop Shell** | Electron 39 |
| **Backend** | Python 3.10+ + FastAPI |
| **Audio Processing** | PyTorch (GPU/CPU) |
| **Video Processing** | FFmpeg |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (3.10 or higher) - [Download](https://www.python.org/downloads/)
- **FFmpeg** - Must be installed and available in your system PATH
  - Windows: `winget install FFmpeg` or download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg` (Ubuntu/Debian)
<img width="1184" height="780" alt="5" src="https://github.com/user-attachments/assets/f1257487-4bb9-4916-98b4-f275c85fd527" />
<img width="1185" height="780" alt="4" src="https://github.com/user-attachments/assets/dc09625d-f18e-40fb-8109-6e4c3656dfa4" />

### Optional
- **CUDA Toolkit** (for GPU acceleration) - [Download](https://developer.nvidia.com/cuda-downloads)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AleksWorkdesk/Croppa.git
cd Croppa
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
pip install -r requirements.txt
```

> **Note**: If you want GPU acceleration, install PyTorch with CUDA support:
> ```bash
> pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
> ```

## 💻 Development

### Running in Development Mode

You'll need **three terminal windows** to run the full development stack:

#### Terminal 1: Vite Dev Server
```bash
cd frontend
npm run dev
```
This starts the React development server with hot module replacement.

#### Terminal 2: Python Backend
```bash
cd backend
python app.py
```
This starts the FastAPI server on `http://127.0.0.1:8000`.

#### Terminal 3: Electron App
```bash
cd frontend
npm run electron
```
This launches the Electron desktop application.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build frontend for production |
| `npm run electron` | Launch Electron in development mode |
| `npm run electron:build` | Build distributable Electron app |
| `npm run lint` | Run ESLint |

## 📦 Building for Production

### Build Desktop Application

```bash
cd frontend
npm run electron:build
```

This will:
1. Compile TypeScript and build the React app
2. Bundle the Python backend
3. Create a distributable package in `frontend/dist-electron/`

The output will be a platform-specific installer:
- **Windows**: `.exe` installer (NSIS)
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` or `.deb` package

## 📖 Usage

### Basic Workflow

1. **Launch Croppa** - Open the application
2. **Upload Video** - Drag and drop a video file or click to browse
3. **Configure Settings** (optional) - Adjust silence detection parameters in the settings panel, but defaults usually work fine
4. **Process** - Click "Start Processing" and wait for Croppa to crop your video
5. **Download** - Save your trimmed video and optional metadata/project files
<img width="1183" height="795" alt="1" src="https://github.com/user-attachments/assets/58b28181-6c5d-485d-b783-f760f999137b" />

### Settings Panel

Customize the silence detection behavior:

- **Silence Threshold (dB)**: Audio level below which is considered silence (default: -40 dB)
  - Lower values (e.g., -50) = more aggressive trimming
  - Higher values (e.g., -30) = keep more audio
- **Min Silence Duration (s)**: Minimum length of silence to remove (default: 0.5s)
- **Padding (s)**: Time to keep before/after speech segments (default: 0.25s)
- **Batch Size**: Number of audio chunks processed at once (affects speed/memory)
- **Video Quality**: CRF, preset, and bitrate settings for output video
<img width="1179" height="1039" alt="2" src="https://github.com/user-attachments/assets/d98fde06-9a7d-491b-a8b1-77aab311ac7c" />
<img width="1180" height="1041" alt="3" src="https://github.com/user-attachments/assets/6a7c0dce-e19f-4d6e-9fbf-f2cadbe8d025" />

### File Management

- **View Files**: Browse uploaded and processed videos
- **Delete Files**: Remove individual files or clear all files
- **Open Folders**: Quick access to uploads/outputs directories
- **Export Projects**: Export timeline to Shotcut MLT format for further editing (Make sure to not delete the video file uploaded to `.../uploads` in app)

## ⚙️ Configuration

### Default Settings

```python
{
  "silence_threshold": -40.0,    # dB
  "min_silence_duration": 0.5,   # seconds
  "padding": 0.25,                # seconds
  "batch_size": 15,               # chunks
  "video_crf": 18,                # quality (lower = better)
  "video_preset": "p4",           # encoding speed
  "audio_bitrate": 192            # kbps
}
```

### Advanced Configuration

Edit `backend/app.py` to modify:
- Upload file size limits
- Supported video formats
- Output directory paths
- Server host/port settings

## 📁 Project Structure

```
croppa/
├── backend/
│   ├── app.py                  # FastAPI server & API endpoints
│   ├── vad_processor.py        # Silero VAD integration
│   ├── video_editor.py         # FFmpeg video processing
│   ├── project_exporter.py     # Project file generation
│   ├── shotcut_exporter.py     # Shotcut MLT export
│   ├── build_backend.py        # PyInstaller build script
│   ├── check_dependencies.py   # Dependency checker
│   ├── requirements.txt        # Python dependencies
│   ├── uploads/                # Uploaded videos
│   ├── outputs/                # Processed videos
│   └── temp/                   # Temporary files
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ProcessingStatus.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── FileManager.tsx
│   │   ├── App.tsx             # Main application
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Tailwind styles
│   ├── main.cjs                # Electron main process
│   ├── preload.cjs             # Electron preload script
│   ├── package.json            # Dependencies & build config
│   └── vite.config.ts          # Vite configuration
├── electron/
│   ├── main.js                 # Electron main process (dev)
│   └── preload.js              # Preload script (dev)
├── ffmpeg/                     # FFmpeg binaries (bundled)
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

**FFmpeg not found**
```
Error: FFmpeg not found in PATH
```
**Solution**: Install FFmpeg and ensure it's in your system PATH. Test with `ffmpeg -version`.

---

**Python backend won't start**
```
ModuleNotFoundError: No module named 'torch'
```
**Solution**: Install all Python dependencies: `pip install -r requirements.txt`

---

**CUDA/GPU errors**
```
RuntimeError: CUDA out of memory
```
**Solution**: Reduce batch size in settings or install CPU-only PyTorch:
```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
```

---

**Electron app won't launch**
```
Error: Cannot find module 'electron'
```
**Solution**: Reinstall frontend dependencies: `cd frontend && npm install`

---

**Video processing fails**
```
Error: Invalid video format
```
**Solution**: Ensure your video is in a supported format (.mp4, .mov, .m4v, .avi). Try re-encoding with FFmpeg.

### Getting Help

If you encounter issues not listed here:
1. Check the application logs in the UI
2. Look for error messages in the terminal/console
3. Open an issue on GitHub with detailed error information

## 🤝 Contributing

Contributions are super welcome! 

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Aleks**

