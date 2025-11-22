import React, { useState } from 'react';

interface FinishScreenProps {
    result: any;
    originalDuration: number;
    finalDuration: number;
    onReset: () => void;
    onDownload: () => void;
    onDownloadMetadata: () => void;
    onExportProject: () => void;
    processingTime: number;
    logs: string[];
}

const FinishScreen: React.FC<FinishScreenProps> = ({
    result,
    originalDuration,
    finalDuration,
    onReset,
    onDownload,
    onDownloadMetadata,
    onExportProject,
    processingTime,
    logs,
}) => {
    const [showLogModal, setShowLogModal] = useState(false);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return h > 0 ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatProcessingTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <div className="mb-8 relative">
                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-5xl shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Processing Complete</h2>
            <p className="text-gray-400 mb-2">Your video has been successfully trimmed</p>
            <p className="text-sm text-gray-500 mb-8">Completed in {formatProcessingTime(processingTime)}</p>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 w-full max-w-lg mb-8">
                <h3 className="text-orange-500 font-semibold text-left mb-4 uppercase text-sm tracking-wider">Summary</h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                        <div className="text-gray-400 text-xs mb-1">Original Duration</div>
                        <div className="text-white font-mono font-bold text-lg">{formatTime(originalDuration)}</div>
                    </div>
                    <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                        <div className="text-gray-400 text-xs mb-1">Final Duration</div>
                        <div className="text-orange-500 font-mono font-bold text-lg">{formatTime(finalDuration)}</div>
                    </div>
                    <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                        <div className="text-gray-400 text-xs mb-1">Cuts Made</div>
                        <div className="text-white font-mono font-bold text-lg">{result.segments.length}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onDownload}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Video (.mp4)
                    </button>

                    <button
                        onClick={onExportProject}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        📋 Export to Shotcut (.mlt)
                    </button>

                    <button
                        onClick={onDownloadMetadata}
                        className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-200 flex items-center justify-center gap-1 py-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download metadata (.json)
                    </button>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <button
                    onClick={onReset}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 py-2"
                >
                    Process Another Video
                </button>
                <span className="text-gray-700">|</span>
                <button
                    onClick={() => setShowLogModal(true)}
                    className="text-gray-600 hover:text-gray-400 transition-colors duration-200 text-xs flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Log
                </button>
            </div>

            {/* Log Modal */}
            {showLogModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8" onClick={() => setShowLogModal(false)}>
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-orange-500 font-semibold uppercase text-sm tracking-wider">Processing Log</h3>
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-black/50 rounded-lg p-4 overflow-y-auto font-mono text-xs space-y-1 border border-gray-800 flex-1">
                            {logs.length === 0 ? (
                                <p className="text-gray-600 italic">No logs available</p>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="text-gray-300">
                                        <span className="text-orange-500 mr-2">›</span>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinishScreen;
