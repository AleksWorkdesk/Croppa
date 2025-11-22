"""
Build script to package the backend as a standalone executable using PyInstaller.
Run this before building the Electron app.
"""
import PyInstaller.__main__
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Check if FFmpeg binaries exist
ffmpeg_bin = os.path.join(script_dir, 'bin', 'ffmpeg.exe')
ffprobe_bin = os.path.join(script_dir, 'bin', 'ffprobe.exe')

if not os.path.exists(ffmpeg_bin):
    print("❌ Error: FFmpeg not found at", ffmpeg_bin)
    print("Please ensure backend/bin/ffmpeg.exe exists")
    exit(1)

PyInstaller.__main__.run([
    'app.py',
    '--name=croppa-backend',
    '--onedir',  # Changed from --onefile to --onedir for better file access
    '--console',
    '--hidden-import=uvicorn.logging',
    '--hidden-import=uvicorn.loops',
    '--hidden-import=uvicorn.loops.auto',
    '--hidden-import=uvicorn.protocols',
    '--hidden-import=uvicorn.protocols.http',
    '--hidden-import=uvicorn.protocols.http.auto',
    '--hidden-import=uvicorn.protocols.websockets',
    '--hidden-import=uvicorn.protocols.websockets.auto',
    '--hidden-import=uvicorn.lifespan',
    '--hidden-import=uvicorn.lifespan.on',
    f'--add-binary={ffmpeg_bin};bin',
    f'--add-binary={ffprobe_bin};bin',
    f'--distpath={os.path.join(script_dir, "dist")}',
    f'--workpath={os.path.join(script_dir, "build")}',
    f'--specpath={script_dir}',
])

print("\n✅ Backend executable built successfully!")
print(f"Location: {os.path.join(script_dir, 'dist', 'croppa-backend')}")
