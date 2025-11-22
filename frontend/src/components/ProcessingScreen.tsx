import React from 'react';

interface ProcessingScreenProps {
    progress: number;
    logs: string[];
    isProcessing: boolean;
    processingTime: number;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ progress, isProcessing, processingTime }) => {
    // Format time as MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <div className="mb-8 relative">
                <div className="w-24 h-24 relative">
                    <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                    <div
                        className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"
                        style={{ animationDuration: '1s' }}
                    ></div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
                {isProcessing ? 'Processing Video...' : 'Uploading Video...'}
            </h2>
            <p className="text-gray-400 mb-2">
                {isProcessing ? 'Analyzing audio and trimming silence' : 'Please wait while your video uploads'}
            </p>

            {/* Timer Display */}
            <div className="text-2xl font-mono text-orange-500 mb-10">
                {formatTime(processingTime)}
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 w-full max-w-lg">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-orange-500 font-mono font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default ProcessingScreen;
