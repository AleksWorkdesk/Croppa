import React, { useState, useCallback } from 'react';

interface UploadScreenProps {
    onFileSelect: (file: File) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onFileSelect }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (isValidVideoFile(file)) {
                setSelectedFile(file);
            }
        }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (isValidVideoFile(file)) {
                setSelectedFile(file);
            }
        }
    }, []);

    const isValidVideoFile = (file: File): boolean => {
        const validExtensions = ['.mp4', '.mov', '.m4v', '.avi'];
        const fileName = file.name.toLowerCase();
        return validExtensions.some(ext => fileName.endsWith(ext));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleStartProcessing = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 text-white tracking-tight">
                    Croppa
                </h1>
                <p className="text-gray-400 text-lg font-light">
                    Automatically trim silent parts from your videos
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer
                        ${dragActive
                            ? 'border-orange-500 bg-orange-500/5'
                            : 'border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".mp4,.mov,.m4v,.avi"
                        onChange={handleChange}
                    />

                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center w-full h-full"
                    >
                        <div className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-colors duration-300 ${dragActive ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-800 text-gray-400 group-hover:text-white'}`}>
                            <svg
                                className="w-10 h-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>

                        <p className="text-xl mb-2 text-white font-medium">
                            {selectedFile ? selectedFile.name : 'Drop your video here'}
                        </p>
                        <p className="text-gray-500 mb-6">
                            or click to browse
                        </p>
                        <div className="flex gap-2">
                            {['MP4', 'MOV', 'M4V', 'AVI'].map(ext => (
                                <span key={ext} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500 font-mono border border-gray-700">
                                    {ext}
                                </span>
                            ))}
                        </div>
                    </label>
                </div>

                {selectedFile && (
                    <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-800 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">File Details</h3>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                                <div className="text-gray-500 text-xs mb-1">Name</div>
                                <div className="text-white font-mono text-sm truncate" title={selectedFile.name}>{selectedFile.name}</div>
                            </div>
                            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                                <div className="text-gray-500 text-xs mb-1">Size</div>
                                <div className="text-white font-mono text-sm">{formatFileSize(selectedFile.size)}</div>
                            </div>
                            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                                <div className="text-gray-500 text-xs mb-1">Type</div>
                                <div className="text-white font-mono text-sm">{selectedFile.type || 'video'}</div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartProcessing}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group"
                        >
                            <span>Start Processing</span>
                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadScreen;
