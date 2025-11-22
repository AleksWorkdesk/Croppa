import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SettingsPanelProps {
    settings: ProcessingSettings;
    onSettingsChange: (settings: ProcessingSettings) => void;
    onClose: () => void;
}

export interface ProcessingSettings {
    // VAD Settings
    silenceThreshold: number;
    minSilenceDuration: number;
    padding: number;

    // Video Encoding Settings
    batchSize: number;
    videoCRF: number;      // For CPU encoding (lower = better quality, 0-51)
    videoCQ: number;       // For GPU encoding (lower = better quality, 0-51)
    videoPreset: string;   // GPU preset (p1-p7)
    audioBitrate: number;  // In kbps
}

interface FileInfo {
    name: string;
    size: number;
    type: 'upload' | 'output';
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onClose }) => {
    const [files, setFiles] = useState<{ uploads: FileInfo[], outputs: FileInfo[], total_size: number }>({
        uploads: [],
        outputs: [],
        total_size: 0
    });
    const [refreshing, setRefreshing] = useState(false);

    const handleChange = (key: keyof ProcessingSettings, value: number | string) => {
        onSettingsChange({
            ...settings,
            [key]: value
        });
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const loadFiles = async () => {
        setRefreshing(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/files');
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to load files:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const deleteFile = async (fileType: string, filename: string) => {
        if (!confirm(`Delete ${filename}?`)) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/files/${fileType}/${filename}`);
            loadFiles();
        } catch (error: any) {
            console.error('Failed to delete file:', error);
            const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
            alert(`Failed to delete file: ${errorMsg}`);
        }
    };

    const deleteAllFiles = async (fileType: string) => {
        let filesToDelete: FileInfo[] = [];
        let message = '';

        if (fileType === 'all') {
            filesToDelete = [...files.uploads, ...files.outputs];
            message = `Delete ALL ${filesToDelete.length} files (uploads and outputs)?`;
        } else if (fileType === 'upload') {
            filesToDelete = files.uploads;
            message = `Delete all ${filesToDelete.length} uploaded files?`;
        } else if (fileType === 'output') {
            filesToDelete = files.outputs;
            message = `Delete all ${filesToDelete.length} processed files?`;
        }

        if (filesToDelete.length === 0) {
            alert('No files to delete');
            return;
        }

        if (!confirm(message)) return;

        try {
            let successCount = 0;
            let failCount = 0;

            console.log(`Starting sequential deletion of ${filesToDelete.length} files...`);

            for (const file of filesToDelete) {
                try {
                    await axios.delete(`http://127.0.0.1:8000/files/${file.type}/${file.name}`);
                    successCount++;
                    console.log(`Deleted: ${file.name}`);
                } catch (error: any) {
                    failCount++;
                    console.error(`Failed to delete ${file.name}:`, error);
                }
            }

            const resultMessage = failCount > 0
                ? `Deleted ${successCount} files. ${failCount} failed.`
                : `Successfully deleted ${successCount} files!`;

            alert(resultMessage);
            loadFiles();
        } catch (error: any) {
            console.error('Failed to delete files:', error);
            alert('An error occurred during deletion');
        }
    };

    const openFolder = async (folderType: string) => {
        try {
            await axios.get(`http://127.0.0.1:8000/files/open-folder/${folderType}`);
        } catch (error) {
            console.error('Failed to open folder:', error);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">Processing Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* VAD Settings */}
                    <div className="border-b border-gray-800 pb-6">
                        <h3 className="text-xl font-semibold text-orange-500 mb-4">Voice Activity Detection</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Silence Threshold (dB)
                                    <span className="text-gray-500 ml-2">Current: {settings.silenceThreshold}</span>
                                </label>
                                <input
                                    type="range"
                                    min="-80"
                                    max="-2"
                                    step="1"
                                    value={settings.silenceThreshold}
                                    onChange={(e) => handleChange('silenceThreshold', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Lower values detect quieter sounds as speech. Recommended: -50 to -30
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Minimum Silence Duration (seconds)
                                    <span className="text-gray-500 ml-2">Current: {settings.minSilenceDuration}s</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="2.0"
                                    step="0.1"
                                    value={settings.minSilenceDuration}
                                    onChange={(e) => handleChange('minSilenceDuration', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Only cut silence longer than this duration. Recommended: 0.3 to 0.7
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Padding (seconds)
                                    <span className="text-gray-500 ml-2">Current: {settings.padding}s</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.0"
                                    max="1.0"
                                    step="0.05"
                                    value={settings.padding}
                                    onChange={(e) => handleChange('padding', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Extra time to keep before/after speech. Recommended: 0.1 to 0.3
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Video Encoding Settings */}
                    <div className="border-b border-gray-800 pb-6">
                        <h3 className="text-xl font-semibold text-orange-500 mb-4">Video Encoding</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Batch Size
                                    <span className="text-gray-500 ml-2">Current: {settings.batchSize}</span>
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    step="5"
                                    value={settings.batchSize}
                                    onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Segments per batch. Higher = faster but more GPU spikes. Recommended: 10-20
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    CPU Quality (CRF)
                                    <span className="text-gray-500 ml-2">Current: {settings.videoCRF}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="51"
                                    step="1"
                                    value={settings.videoCRF}
                                    onChange={(e) => handleChange('videoCRF', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Lower = better quality, larger file. Recommended: 18-23
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    GPU Quality (CQ)
                                    <span className="text-gray-500 ml-2">Current: {settings.videoCQ}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="51"
                                    step="1"
                                    value={settings.videoCQ}
                                    onChange={(e) => handleChange('videoCQ', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Lower = better quality, larger file. Recommended: 19-23
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    GPU Preset
                                    <span className="text-gray-500 ml-2">Current: {settings.videoPreset}</span>
                                </label>
                                <select
                                    value={settings.videoPreset}
                                    onChange={(e) => handleChange('videoPreset', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                                >
                                    <option value="p1">P1 - Fastest (lowest quality)</option>
                                    <option value="p2">P2 - Very Fast</option>
                                    <option value="p3">P3 - Fast</option>
                                    <option value="p4">P4 - Balanced (Recommended)</option>
                                    <option value="p5">P5 - Slow</option>
                                    <option value="p6">P6 - Very Slow</option>
                                    <option value="p7">P7 - Slowest (best quality)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Higher preset = better quality but slower encoding
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Audio Bitrate (kbps)
                                    <span className="text-gray-500 ml-2">Current: {settings.audioBitrate}</span>
                                </label>
                                <input
                                    type="range"
                                    min="96"
                                    max="320"
                                    step="32"
                                    value={settings.audioBitrate}
                                    onChange={(e) => handleChange('audioBitrate', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Higher = better audio quality. Recommended: 192
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* File Management */}
                    <div className="border-b border-gray-800 pb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-orange-500">File Management</h3>
                            <button
                                onClick={loadFiles}
                                disabled={refreshing}
                                className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                {refreshing ? 'Refreshing...' : '🔄 Refresh'}
                            </button>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                            <div className="text-sm text-gray-300 mb-2">
                                Total Storage: <span className="text-orange-500 font-semibold">{formatBytes(files.total_size)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                                Uploads: {files.uploads.length} files • Outputs: {files.outputs.length} files
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Uploads Section */}
                            <div className="bg-gray-800/30 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-300">Uploaded Videos</span>
                                    <button
                                        onClick={() => openFolder('upload')}
                                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                    >
                                        📁 Open Folder
                                    </button>
                                </div>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {files.uploads.length === 0 ? (
                                        <div className="text-xs text-gray-500 italic">No uploaded files</div>
                                    ) : (
                                        files.uploads.map((file) => (
                                            <div key={file.name} className="flex justify-between items-center text-xs bg-gray-900/50 px-2 py-1 rounded">
                                                <span className="text-gray-400 truncate flex-1">{file.name}</span>
                                                <span className="text-gray-500 mx-2">{formatBytes(file.size)}</span>
                                                <button
                                                    onClick={() => deleteFile('upload', file.name)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {files.uploads.length > 0 && (
                                    <button
                                        onClick={() => deleteAllFiles('upload')}
                                        className="mt-2 w-full text-xs px-2 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                                    >
                                        Delete All Uploads
                                    </button>
                                )}
                            </div>

                            {/* Outputs Section */}
                            <div className="bg-gray-800/30 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-300">Processed Videos</span>
                                    <button
                                        onClick={() => openFolder('output')}
                                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                    >
                                        📁 Open Folder
                                    </button>
                                </div>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {files.outputs.length === 0 ? (
                                        <div className="text-xs text-gray-500 italic">No processed files</div>
                                    ) : (
                                        files.outputs.map((file) => (
                                            <div key={file.name} className="flex justify-between items-center text-xs bg-gray-900/50 px-2 py-1 rounded">
                                                <span className="text-gray-400 truncate flex-1">{file.name}</span>
                                                <span className="text-gray-500 mx-2">{formatBytes(file.size)}</span>
                                                <button
                                                    onClick={() => deleteFile('output', file.name)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {files.outputs.length > 0 && (
                                    <button
                                        onClick={() => deleteAllFiles('output')}
                                        className="mt-2 w-full text-xs px-2 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                                    >
                                        Delete All Outputs
                                    </button>
                                )}
                            </div>

                            {/* Delete All Button */}
                            {(files.uploads.length > 0 || files.outputs.length > 0) && (
                                <button
                                    onClick={() => deleteAllFiles('all')}
                                    className="w-full text-sm px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors font-medium"
                                >
                                    🗑️ Delete All Files
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
