import { useState, useEffect } from 'react';
import axios from 'axios';
import UploadScreen from './components/UploadScreen';
import ProcessingScreen from './components/ProcessingScreen';
import FinishScreen from './components/FinishScreen';
import SettingsPanel from './components/SettingsPanel';
import type { ProcessingSettings } from './components/SettingsPanel';

interface ProcessingResult {
  output_file: string;
  segments: any[];
  original_duration: number;
  final_duration: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<'upload' | 'processing' | 'finish'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [originalDuration, setOriginalDuration] = useState<number>(0);
  const [finalDuration, setFinalDuration] = useState<number>(0);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [estimatedProgress, setEstimatedProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ProcessingSettings>({
    silenceThreshold: -40,
    minSilenceDuration: 0.5,
    padding: 0.25,
    batchSize: 15,
    videoCRF: 18,
    videoCQ: 19,
    videoPreset: 'p4',
    audioBitrate: 192
  });

  // Poll for progress when processing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing) {
      console.log('Starting progress polling...');
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://127.0.0.1:8000/progress');
          if (!res.ok) {
            console.error('Progress fetch failed:', res.status, res.statusText);
            return;
          }
          const data = await res.json();
          console.log('Progress update received:', data.progress, '%');
          // Progress is now estimated based on time, not polled
        } catch (e) {
          console.error("Error polling progress:", e);
        }
      }, 500);
    } else {
      console.log('Progress polling stopped');
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log('Progress polling interval cleared');
      }
    };
  }, [isProcessing]);

  // Poll for logs when processing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://127.0.0.1:8000/logs');
          if (res.ok) {
            const data = await res.json();
            setLogs(data.logs);
          }
        } catch (e) {
          console.error("Error polling logs:", e);
        }
      }, 500);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isProcessing]);

  // Timer for processing duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing && processingStartTime) {
      interval = setInterval(() => {
        setProcessingTime(Date.now() - processingStartTime);
      }, 100); // Update every 100ms
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isProcessing, processingStartTime]);

  // Smart progress estimation for processing phase
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing && processingStartTime) {
      setEstimatedProgress(0);

      interval = setInterval(() => {
        const elapsed = Date.now() - processingStartTime;
        const seconds = elapsed / 1000;

        // Smart progress curve:
        // - Fast initial progress (0-50% in first 10 seconds)
        // - Slower middle progress (50-80% in next 20 seconds)
        // - Very slow final progress (80-95% in next 30 seconds)
        // - Asymptotically approaches 100% but never reaches it until done

        let progress;
        if (seconds < 10) {
          // 0-10s: 0-50%
          progress = (seconds / 10) * 50;
        } else if (seconds < 30) {
          // 10-30s: 50-80%
          progress = 50 + ((seconds - 10) / 20) * 30;
        } else if (seconds < 60) {
          // 30-60s: 80-90%
          progress = 80 + ((seconds - 30) / 30) * 10;
        } else {
          // 60s+: 90-95% (asymptotic)
          progress = 90 + (5 * (1 - Math.exp(-(seconds - 60) / 60)));
        }

        setEstimatedProgress(Math.min(Math.round(progress), 95));
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, processingStartTime]);

  const handleReset = () => {
    setCurrentScreen('upload');
    setUploadProgress(0);
    setIsProcessing(false);
    setLogs([]);
    setResult(null);
    setOriginalDuration(0);
    setFinalDuration(0);
    setProcessingStartTime(null);
    setProcessingTime(0);
  };

  const handleUpload = async (selectedFile: File) => {
    // Switch to processing screen immediately
    setCurrentScreen('processing');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://127.0.0.1:8000/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          handleProcessVideo(response.filename);
        } else {
          console.error('Upload failed');
          setLogs(prev => [...prev, 'Upload failed. Please try again.']);
        }
      };

      xhr.onerror = () => {
        console.error('Error uploading file:', xhr.statusText);
        setLogs(prev => [...prev, 'Upload failed. Network error or server issue.']);
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error setting up upload:', error);
      setLogs(prev => [...prev, 'Upload failed. An unexpected error occurred.']);
    }
  };

  const handleProcessVideo = async (filename: string) => {
    setIsProcessing(true);
    setProcessingStartTime(Date.now());  // Start timer
    setUploadProgress(0); // Reset to 0 for processing phase
    setLogs(['Starting processing...']);

    try {
      const response = await axios.post('http://127.0.0.1:8000/process', {
        filename: filename,
        silence_threshold: settings.silenceThreshold,
        min_silence_duration: settings.minSilenceDuration,
        padding: settings.padding,
        batch_size: settings.batchSize,
        video_crf: settings.videoCRF,
        video_cq: settings.videoCQ,
        video_preset: settings.videoPreset,
        audio_bitrate: settings.audioBitrate
      });

      setLogs(prev => [...prev, 'Processing complete!']);
      setResult(response.data);
      setOriginalDuration(response.data.original_duration || 0);
      setFinalDuration(response.data.final_duration || 0);
      setEstimatedProgress(100);

      // Wait a bit for final progress updates before stopping polling
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentScreen('finish');
      }, 1000);

    } catch (error: any) {
      console.error('Processing failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      setLogs(prev => [...prev, `Processing failed: ${errorMessage}`]);
      setIsProcessing(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (result) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/outputs/${result.output_file}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.output_file;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleDownloadMetadata = () => {
    if (result) {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = "metadata.json";
      document.body.appendChild(element);
      element.click();
    }
  };

  const handleExportProject = async () => {
    if (result) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/export-project', {
          filename: result.output_file.replace('processed_', ''), // Original filename
          segments: result.segments,
          format: 'mlt'  // Changed to Shotcut MLT format
        });

        // Trigger download
        const link = document.createElement('a');
        link.href = `http://127.0.0.1:8000${response.data.url}`;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export project');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {currentScreen === 'upload' && (
        <>
          <UploadScreen onFileSelect={handleUpload} />
          <button
            onClick={() => setShowSettings(true)}
            className="fixed bottom-8 right-8 p-4 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors shadow-lg"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </>
      )}
      {currentScreen === 'processing' && (
        <ProcessingScreen
          progress={isProcessing ? estimatedProgress : uploadProgress}
          logs={logs}
          isProcessing={isProcessing}
          processingTime={processingTime}
        />
      )}
      {currentScreen === 'finish' && result && (
        <FinishScreen
          result={result}
          originalDuration={originalDuration}
          finalDuration={finalDuration}
          onReset={handleReset}
          onDownload={handleDownloadVideo}
          onDownloadMetadata={handleDownloadMetadata}
          onExportProject={handleExportProject}
          processingTime={processingTime}
          logs={logs}
        />
      )}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
