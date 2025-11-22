import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from video_editor import VideoEditor
from vad_processor import VADProcessor
from project_exporter import ProjectExporter
from shotcut_exporter import ShotcutExporter
import uuid
import sys

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
TEMP_DIR = "temp"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

print("=" * 60)
print("BACKEND VERSION: 2024-11-21-v2 (File Management Fixed)")
print("=" * 60)



# Mount static files for outputs
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# Initialize processors
vad_processor = VADProcessor()
video_editor = VideoEditor()
project_exporter = ProjectExporter()
shotcut_exporter = ShotcutExporter()

# Global progress state
processing_progress = 0
processing_logs = []

def update_progress_callback(percent):
    global processing_progress
    processing_progress = percent

def add_log(message: str):
    global processing_logs
    processing_logs.append(message)
    print(message)
    sys.stdout.flush()

class ProcessRequest(BaseModel):
    filename: str
    silence_threshold: float = -40.0
    min_silence_duration: float = 0.5
    padding: float = 0.25
    # Encoding settings
    batch_size: int = 15
    video_crf: int = 18
    video_cq: int = 19
    video_preset: str = 'p4'
    audio_bitrate: int = 192

@app.get("/status")
def get_status():
    return {"status": "running", "gpu_available": vad_processor.is_gpu_available()}

@app.get("/progress")
async def get_progress():
    global processing_progress
    return {"progress": processing_progress}

@app.get("/logs")
async def get_logs():
    global processing_logs
    return {"logs": processing_logs}

@app.get("/files")
async def list_files():
    """List all stored files (uploads and outputs)"""
    try:
        uploads = []
        outputs = []
        
        # List upload files
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                filepath = os.path.join(UPLOAD_DIR, filename)
                if os.path.isfile(filepath):
                    uploads.append({
                        "name": filename,
                        "size": os.path.getsize(filepath),
                        "type": "upload"
                    })
        
        # List output files
        if os.path.exists(OUTPUT_DIR):
            for filename in os.listdir(OUTPUT_DIR):
                filepath = os.path.join(OUTPUT_DIR, filename)
                if os.path.isfile(filepath):
                    outputs.append({
                        "name": filename,
                        "size": os.path.getsize(filepath),
                        "type": "output"
                    })
        
        return {
            "uploads": uploads,
            "outputs": outputs,
            "total_size": sum(f["size"] for f in uploads + outputs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/files/{file_type}/{filename}")
async def delete_file(file_type: str, filename: str):
    """Delete a specific file"""
    try:
        if file_type == "upload":
            filepath = os.path.join(UPLOAD_DIR, filename)
        elif file_type == "output":
            filepath = os.path.join(OUTPUT_DIR, filename)
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        if os.path.exists(filepath):
            os.remove(filepath)
            return {"message": f"Deleted {filename}"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/files/all/{file_type}")
async def delete_all_files(file_type: str):
    """Delete all files of a specific type"""
    print(f"!!! FUNCTION CALLED: delete_all_files with file_type='{file_type}'")
    try:
        print(f"=== DELETE ALL FILES ===")
        print(f"Received file_type: '{file_type}'")
        print(f"Type: {type(file_type)}")
        print(f"Length: {len(file_type)}")
        print(f"Repr: {repr(file_type)}")
        
        deleted_count = 0
        
        if file_type == "all":
            # Delete both uploads and outputs
            for dir_path in [UPLOAD_DIR, OUTPUT_DIR]:
                if os.path.exists(dir_path):
                    for filename in os.listdir(dir_path):
                        filepath = os.path.join(dir_path, filename)
                        if os.path.isfile(filepath):
                            try:
                                os.remove(filepath)
                                deleted_count += 1
                                print(f"Deleted: {filepath}")
                            except Exception as file_error:
                                print(f"Failed to delete {filepath}: {file_error}")
        elif file_type == "upload":
            directory = UPLOAD_DIR
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    filepath = os.path.join(directory, filename)
                    if os.path.isfile(filepath):
                        try:
                            os.remove(filepath)
                            deleted_count += 1
                            print(f"Deleted: {filepath}")
                        except Exception as file_error:
                            print(f"Failed to delete {filepath}: {file_error}")
        elif file_type == "output":
            directory = OUTPUT_DIR
            if os.path.exists(directory):
                for filename in os.listdir(directory):
                    filepath = os.path.join(directory, filename)
                    if os.path.isfile(filepath):
                        try:
                            os.remove(filepath)
                            deleted_count += 1
                            print(f"Deleted: {filepath}")
                        except Exception as file_error:
                            print(f"Failed to delete {filepath}: {file_error}")
        else:
            print(f"ERROR: Invalid file_type received: '{file_type}'")
            print(f"Expected: 'all', 'upload', or 'output'")
            raise HTTPException(status_code=400, detail=f"Invalid file type: '{file_type}'")
        
        print(f"Total deleted: {deleted_count} files")
        return {"message": f"Deleted {deleted_count} files"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in delete_all_files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files/open-folder/{folder_type}")
async def open_folder(folder_type: str):
    """Open folder in file explorer"""
    try:
        import subprocess
        
        if folder_type == "upload":
            folder_path = os.path.abspath(UPLOAD_DIR)
        elif folder_type == "output":
            folder_path = os.path.abspath(OUTPUT_DIR)
        else:
            raise HTTPException(status_code=400, detail="Invalid folder type")
        
        # Open folder in Windows Explorer
        subprocess.Popen(f'explorer "{folder_path}"')
        return {"message": f"Opened {folder_type} folder"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        extension = os.path.splitext(file.filename)[1]
        safe_filename = f"{file_id}{extension}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"filename": safe_filename, "original_name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process")
async def process_video(request: ProcessRequest):
    global processing_progress, processing_logs
    processing_progress = 0
    processing_logs = []  # Clear logs for new processing
    
    input_path = os.path.join(UPLOAD_DIR, request.filename)
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    # Check if FFmpeg is available
    if not shutil.which(video_editor.ffmpeg_bin) and not os.path.exists(video_editor.ffmpeg_bin):
        raise HTTPException(status_code=500, detail="FFmpeg not found. Please install FFmpeg and add it to your system PATH.")
    
    try:
        add_log("Starting video processing...")
        add_log(f"Input file: {request.filename}")
        
        # 1. Extract Audio
        add_log("[Step 1/3] Extracting audio...")
        audio_path = os.path.join(TEMP_DIR, f"{request.filename}.wav")
        video_editor.extract_audio(input_path, audio_path)
        processing_progress = 10
        add_log(f"Audio extracted (Progress: {processing_progress}%)")
        
        # 2. Detect Silence
        add_log("[Step 2/3] Detecting speech with VAD...")
        speech_timestamps = vad_processor.get_speech_timestamps(
            audio_path, 
            threshold=request.silence_threshold,
            min_silence_duration=request.min_silence_duration,
            padding=request.padding
        )
        add_log(f"Detected {len(speech_timestamps)} speech segments")
        processing_progress = 20
        add_log(f"VAD complete (Progress: {processing_progress}%)")
        
        # 3. Cut Video
        add_log("[Step 3/3] Cutting and encoding video...")
        output_filename = f"processed_{request.filename}"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        # Pass callback to cut_video
        # We map the remaining 80% (20-100) to the cut progress
        def mapped_callback(p):
            global processing_progress
            processing_progress = 20 + int(p * 0.8)
            add_log(f"Encoding progress: {int(p)}%")
            
        original_duration, final_duration = video_editor.cut_video(
            input_path, 
            output_path, 
            speech_timestamps,
            progress_callback=mapped_callback,
            batch_size=request.batch_size,
            video_crf=request.video_crf,
            video_cq=request.video_cq,
            video_preset=request.video_preset,
            audio_bitrate=request.audio_bitrate
        )
        
        processing_progress = 100
        
        # 4. Cleanup
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
        print("\n=== Processing complete ===\n")
        return {
            "output_file": output_filename,
            "segments": speech_timestamps,
            "original_duration": original_duration,
            "final_duration": final_duration
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class ExportRequest(BaseModel):
    filename: str
    segments: list
    format: str = "mlt"  # Changed default to Shotcut MLT

@app.post("/export-project")
async def export_project(request: ExportRequest):
    """Export project as Shotcut MLT XML"""
    try:
        if request.format == "mlt":
            # Get absolute path to the uploaded video
            video_path = os.path.join(UPLOAD_DIR, request.filename)
            content = shotcut_exporter.generate_mlt(video_path, request.segments)
            
            # Save to temp file
            output_filename = f"{os.path.splitext(request.filename)[0]}.mlt"
            output_path = os.path.join(OUTPUT_DIR, output_filename)
            
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(content)
                
            return {"filename": output_filename, "url": f"/outputs/{output_filename}"}
        elif request.format == "edl":
            content = project_exporter.generate_edl(request.filename, request.segments)
            output_filename = f"{os.path.splitext(request.filename)[0]}.edl"
            output_path = os.path.join(OUTPUT_DIR, output_filename)
            with open(output_path, "w") as f:
                f.write(content)
            return {"filename": output_filename, "url": f"/outputs/{output_filename}"}
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
