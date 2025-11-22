import torch
import torchaudio
import numpy as np

class VADProcessor:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"VADProcessor initialized on device: {self.device}")

    def is_gpu_available(self):
        return torch.cuda.is_available()

    def get_speech_timestamps(self, audio_path, threshold=-40.0, min_silence_duration=0.5, padding=0.25):
        """
        Detects 'active' audio segments based on RMS energy threshold (dB) using PyTorch (GPU).
        """
        # Force soundfile backend for Windows compatibility
        try:
            if torchaudio.get_audio_backend() != 'soundfile':
                torchaudio.set_audio_backend("soundfile")
            wav, sr = torchaudio.load(audio_path)
        except:
            # Fallback: try loading with soundfile directly if torchaudio fails
            import soundfile as sf
            data, sr = sf.read(audio_path)
            wav = torch.from_numpy(data).float()
            if len(wav.shape) == 1:
                wav = wav.unsqueeze(0) # Add channel dim [1, samples]
            else:
                wav = wav.t() # [samples, channels] -> [channels, samples]
        
        # Move to GPU if available
        wav = wav.to(self.device)
        
        # Convert to mono if stereo (average channels)
        if wav.shape[0] > 1:
            wav = wav.mean(dim=0)
        else:
            wav = wav.squeeze()
            
        # Calculate window size (e.g. 10ms windows)
        window_size = int(0.01 * sr)
        
        # Pad wav to be divisible by window_size
        pad_length = window_size - (wav.shape[0] % window_size)
        if pad_length != window_size:
            wav = torch.nn.functional.pad(wav, (0, pad_length))
            
        # Reshape into windows: [num_windows, window_size]
        windows = wav.view(-1, window_size)
        
        # Calculate RMS: sqrt(mean(square(signal)))
        # square
        squared = windows.pow(2)
        # mean
        means = squared.mean(dim=1)
        # sqrt
        rms_values = torch.sqrt(means)
        
        # Convert to dB: 20 * log10(rms)
        # Avoid log(0)
        epsilon = 1e-10
        db_values = 20 * torch.log10(rms_values + epsilon)
        
        # Determine active windows
        # threshold is in dB (e.g. -40)
        is_active_tensor = db_values > threshold
        
        # Move result back to CPU for list processing
        is_active = is_active_tensor.cpu().numpy()
        
        # Convert window indices to time segments
        active_segments = []
        start_window = None
        
        for i, active in enumerate(is_active):
            if active:
                if start_window is None:
                    start_window = i
            else:
                if start_window is not None:
                    active_segments.append({
                        'start': start_window * 0.01,
                        'end': i * 0.01
                    })
                    start_window = None
                    
        if start_window is not None:
            active_segments.append({
                'start': start_window * 0.01,
                'end': len(is_active) * 0.01
            })
            
        # Merge segments
        if not active_segments:
            return []
            
        merged = []
        current = active_segments[0]
        
        for next_seg in active_segments[1:]:
            gap = next_seg['start'] - current['end']
            if gap < min_silence_duration:
                current['end'] = next_seg['end']
            else:
                merged.append(current)
                current = next_seg
        merged.append(current)
        
        # Apply padding
        final_segments = []
        duration = len(wav) / sr
        
        for seg in merged:
            start = max(0, seg['start'] - padding)
            end = min(duration, seg['end'] + padding)
            final_segments.append({'start': start, 'end': end})
            
        return final_segments
