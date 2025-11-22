import sys
import subprocess

print("=== Croppa Backend Diagnostic ===\n")

# Check Python version
print(f"[OK] Python version: {sys.version}")

# Check required packages
packages = ['fastapi', 'uvicorn', 'torch', 'torchaudio', 'ffmpeg']
print("\nChecking Python packages:")
for pkg in packages:
    try:
        __import__(pkg.replace('-', '_'))
        print(f"  [OK] {pkg} installed")
    except ImportError:
        print(f"  [MISSING] {pkg} NOT installed")

# Check FFmpeg
print("\nChecking FFmpeg:")
try:
    result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
    if result.returncode == 0:
        version_line = result.stdout.split('\n')[0]
        print(f"  [OK] FFmpeg found: {version_line}")
    else:
        print("  [ERROR] FFmpeg not working properly")
except FileNotFoundError:
    print("  [MISSING] FFmpeg NOT found in PATH")

print("\n=== Diagnostic Complete ===")
