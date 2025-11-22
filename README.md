# 🎬 Croppa

**AI-Powered Desktop Video Trimmer**

Automatically remove silent parts from your videos using intelligent audio energy detection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F.svg)](https://www.electronjs.org/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Development](#-development) • [Configuration](#-configuration)

---

## 📖 Overview

Croppa is a powerful desktop application that intelligently trims silent portions from videos using energy-based voice activity detection. Perfect for content creators, educators, and anyone who wants to streamline their video editing workflow by automatically removing dead air and silence.

**Key Highlights:**
- 🤖 **AI-Powered**: Uses RMS energy-based algorithm to accurately detect speech vs silence
- 💻 **100% Offline**: All processing happens locally on your machine - no cloud uploads required
- ⚡ **GPU Accelerated**: Optional NVIDIA GPU support (h264_nvenc) for faster video encoding
- 🎨 **Beautiful UI**: Modern, intuitive dark mode interface built with React and Tailwind CSS
- 📦 **Cross-Platform**: Built with Electron for Windows, macOS, and Linux support

## ✨ Features

### Core Functionality
- **Smart Silence Detection**: AI model detects and removes silent segments with high accuracy
- **Multiple Format Support**: Works with `.mp4`, `.mov`, `.m4v`, `.avi`, and more
- **Customizable Settings**: Adjust silence threshold, minimum silence duration, and padding
- **Batch Processing**: Process multiple videos efficiently
- **Project Export**: Export to Shotcut MLT format for further editing

### Advanced Options
- **GPU Acceleration**: Leverage NVIDIA CUDA for faster processing
- **Quality Control**: Configurable video encoding settings (CRF, preset, bitrate)
- **Real-time Progress**: Live progress tracking and detailed logs
- **File Management**: Built-in file browser and cleanup tools

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
3. **Configure Settings** (optional) - Adjust silence detection parameters in the settings panel
4. **Process** - Click "Start Processing" and wait for the AI to analyze your video
5. **Download** - Save your trimmed video and optional metadata/project files

### Settings Panel

Customize the silence detection behavior:

- **Silence Threshold (dB)**: Audio level below which is considered silence (default: -40 dB)
  - Lower values (e.g., -50) = more aggressive trimming
  - Higher values (e.g., -30) = keep more audio
- **Min Silence Duration (s)**: Minimum length of silence to remove (default: 0.5s)
- **Padding (s)**: Time to keep before/after speech segments (default: 0.25s)
- **Batch Size**: Number of audio chunks processed at once (affects speed/memory)
- **Video Quality**: CRF, preset, and bitrate settings for output video

### File Management

- **View Files**: Browse uploaded and processed videos
- **Delete Files**: Remove individual files or clear all files
- **Open Folders**: Quick access to uploads/outputs directories
- **Export Projects**: Export timeline to Shotcut MLT format for further editing

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

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PyTorch](https://pytorch.org/) - Audio processing and GPU acceleration
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [Electron](https://www.electronjs.org/) - Desktop application framework
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework

---

**Made with ❤️ by the Croppa Team**

[Report Bug](https://github.com/AleksWorkdesk/Croppa/issues) • [Request Feature](https://github.com/AleksWorkdesk/Croppa/issues)

