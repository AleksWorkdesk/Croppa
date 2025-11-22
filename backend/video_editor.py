import ffmpeg
import os
import sys
import re
import subprocess
import shutil

class VideoEditor:
    def __init__(self):
        # Try to find FFmpeg in the following order:
        # 1. PyInstaller bundle (sys._MEIPASS/bin)
        # 2. In a 'bin' folder next to the executable/script
        # 3. In the current working directory
        # 4. System PATH
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Check if running in PyInstaller bundle
        if getattr(sys, 'frozen', False):
            # Running in PyInstaller bundle
            bundle_dir = sys._MEIPASS
            possible_paths = [
                os.path.join(bundle_dir, "bin", "ffmpeg.exe"),
                os.path.join(bundle_dir, "ffmpeg.exe"),
            ]
        else:
            # Running as normal Python script
            possible_paths = [
                os.path.join(base_dir, "bin", "ffmpeg.exe"),
                os.path.join(base_dir, "ffmpeg.exe"),
            ]
        
        # Always check system PATH as fallback
        possible_paths.append("ffmpeg")
        
        self.ffmpeg_bin = None
        self.ffprobe_bin = None
        
        for path in possible_paths:
            if path == "ffmpeg":
                # Check if ffmpeg is in PATH
                if shutil.which("ffmpeg"):
                    self.ffmpeg_bin = "ffmpeg"
                    self.ffprobe_bin = "ffprobe"
                    break
            elif os.path.exists(path):
                self.ffmpeg_bin = path
                self.ffprobe_bin = path.replace("ffmpeg.exe", "ffprobe.exe")
                break
                
        if not self.ffmpeg_bin:
            print("Warning: FFmpeg not found in local paths or system PATH")
            # Fallback to 'ffmpeg' and hope for the best, or let it fail later
            self.ffmpeg_bin = "ffmpeg"
            self.ffprobe_bin = "ffprobe"
            
        print(f"Using FFmpeg binary: {self.ffmpeg_bin}")
    
    def get_duration(self, video_path):
        try:
            probe = ffmpeg.probe(video_path, cmd=self.ffprobe_bin)
            return float(probe['format']['duration'])
        except:
            return 0.0

    def extract_audio(self, video_path, audio_path):
        try:
            print(f"Extracting audio from {video_path} to {audio_path}")
            (
                ffmpeg
                .input(video_path)
                .output(audio_path, ac=1, ar=16000)
                .overwrite_output()
                .run(cmd=self.ffmpeg_bin, capture_stdout=True, capture_stderr=True)
            )
        except ffmpeg.Error as e:
            print(f"FFmpeg error: {e.stderr.decode()}")
            raise e

    def cut_video(self, video_path, output_path, segments, progress_callback=None,
                  batch_size=15, video_crf=18, video_cq=19, video_preset='p4', audio_bitrate=192):
        """
        Cuts video using Batched Filter Processing.
        Groups segments into batches and processes them with trim+concat filters.
        This ensures perfect sync (trim filter), avoids crashes (short cmds), 
        and reduces GPU spikes (fewer processes).
        """
        if not segments:
            shutil.copy2(video_path, output_path)
            return 0, 0

        original_duration = self.get_duration(video_path)
        
        # Check for GPU
        has_gpu = False
        try:
            result = subprocess.run([self.ffmpeg_bin, '-hide_banner', '-encoders'], capture_output=True, text=True)
            if 'h264_nvenc' in result.stdout:
                has_gpu = True
                print("NVIDIA GPU detected. Using h264_nvenc.")
        except:
            pass

        temp_dir = os.path.join(os.path.dirname(output_path), "temp_batches")
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        os.makedirs(temp_dir, exist_ok=True)

        try:
            # Group segments into batches
            batches = [segments[i:i + batch_size] for i in range(0, len(segments), batch_size)]
            batch_files = []
            
            total_batches = len(batches)
            print(f"Processing {len(segments)} segments in {total_batches} batches...")

            for i, batch in enumerate(batches):
                batch_filename = os.path.join(temp_dir, f"batch_{i:03d}.mp4")
                batch_files.append(batch_filename)
                
                print(f"Processing Batch {i+1}/{total_batches} ({len(batch)} segments)...")
                
                # Construct filter complex for this batch
                filter_complex = ""
                concat_inputs = ""
                
                for j, seg in enumerate(batch):
                    start = f"{seg['start']:.4f}"
                    end = f"{seg['end']:.4f}"
                    
                    # Video trim
                    filter_complex += f"[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{j}];"
                    
                    # Audio trim
                    filter_complex += f"[0:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[a{j}];"
                    
                    # Interleave inputs for concat: [v0][a0][v1][a1]...
                    concat_inputs += f"[v{j}][a{j}]"
                
                # Concat filter for this batch
                filter_complex += f"{concat_inputs}concat=n={len(batch)}:v=1:a=1[outv][outa]"
                
                cmd = [
                    self.ffmpeg_bin,
                    '-y',
                    '-i', video_path,
                    '-filter_complex', filter_complex,
                    '-map', '[outv]',
                    '-map', '[outa]'
                ]
                
                # Encoding settings (configurable)
                if has_gpu:
                    cmd.extend(['-c:v', 'h264_nvenc', '-preset', video_preset, '-rc', 'vbr_hq', '-cq', str(video_cq), '-b:v', '0'])
                else:
                    cmd.extend(['-c:v', 'libx264', '-preset', 'medium', '-crf', str(video_crf)])
                
                cmd.extend(['-c:a', 'aac', '-b:a', f'{audio_bitrate}k'])
                cmd.append(batch_filename)
                
                # Run batch
                process = subprocess.run(cmd, capture_output=True, text=True)
                if process.returncode != 0:
                    raise Exception(f"Batch {i} failed: {process.stderr}")
                
                # Update progress
                if progress_callback:
                    percent = int(((i + 1) / total_batches) * 90) # 0-90% for batches
                    progress_callback(percent)

            # Final Concat of batches
            print("Concatenating batches...")
            concat_list_path = os.path.join(temp_dir, "concat_list.txt")
            with open(concat_list_path, 'w') as f:
                for bf in batch_files:
                    # Use absolute path and convert to forward slashes
                    abs_path = os.path.abspath(bf).replace('\\', '/')
                    f.write(f"file '{abs_path}'\n")
            
            cmd = [
                self.ffmpeg_bin,
                '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_list_path,
                '-c', 'copy', # Stream copy for instant merge
                output_path
            ]
            
            # Run final concat with error capturing
            process = subprocess.run(cmd, capture_output=True, text=True)
            if process.returncode != 0:
                raise Exception(f"Final concat failed: {process.stderr}")
            
            if progress_callback:
                progress_callback(100)

            final_duration = self.get_duration(output_path)
            return original_duration, final_duration

        except Exception as e:
            print(f"Error in cut_video: {e}")
            raise e
        finally:
            # Safe cleanup
            try:
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
            except Exception as cleanup_error:
                print(f"Warning: Failed to clean up temp directory: {cleanup_error}")
