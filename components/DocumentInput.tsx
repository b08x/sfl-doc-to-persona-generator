
import React, { useState, useCallback, useRef } from 'react';
import { parseFile } from '../services/fileParser';
import { FileUploadIcon } from './icons/FileUploadIcon';
import { TxtIcon } from './icons/TxtIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface DocumentInputProps {
    onAnalyze: (text: string) => void;
    isLoading: boolean;
}

type FileType = 'text' | null;

export const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze, isLoading }) => {
    const [extractedText, setExtractedText] = useState<string>('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileType, setFileType] = useState<FileType>(null);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileType = (file: File): FileType => {
        if (file.type === "text/plain" || file.name.endsWith('.txt') || file.type === "text/markdown" || file.name.endsWith('.md')) return 'text';
        return null;
    }

    const handleFile = useCallback(async (file: File | null) => {
        if (!file) return;

        const type = getFileType(file);
        if (!type) {
            setError("Unsupported file type. Please use .txt or .md files.");
            return;
        }

        setIsParsing(true);
        setError(null);
        setFileName(file.name);
        setFileType(type);
        setExtractedText('');

        try {
            const text = await parseFile(file);
            setExtractedText(text);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred during file parsing.");
            setFileName(null);
            setFileType(null);
        } finally {
            setIsParsing(false);
        }
    }, []);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setExtractedText('');
        setFileName(null);
        setFileType(null);
        setError(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const FileTypeIcon = () => {
        if (fileType === 'text') return <TxtIcon />;
        return null;
    };

    return (
        <div className="bg-[#333e48] rounded-xl shadow-lg p-6 flex flex-col h-full min-h-[400px] lg:min-h-[600px]">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".txt,.md"
            />
            {!fileName && !isParsing && !error && (
                 <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col flex-grow items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-[#e2a32d] bg-[#212934]/50' : 'border-[#5c6f7e] hover:border-[#e2a32d]'}`}
                >
                    <FileUploadIcon />
                    <p className="mt-4 text-lg font-semibold text-gray-200">Drag & drop your document here</p>
                    <p className="text-[#95aac0]">or click to browse</p>
                    <p className="mt-2 text-xs text-[#95aac0]">Supports: TXT, MD</p>
                </div>
            )}
            
            {isParsing && (
                <div className="flex flex-col flex-grow items-center justify-center text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e2a32d] mb-4"></div>
                    <p className="text-lg font-semibold text-gray-200">Parsing "{fileName}"...</p>
                </div>
            )}

            {error && (
                <div className="flex flex-col flex-grow items-center justify-center text-center p-4 bg-red-600/20 border border-red-600 rounded-lg">
                    <XCircleIcon className="w-12 h-12 text-red-300 mb-4"/>
                    <p className="text-lg font-semibold text-gray-200">File Error</p>
                    <p className="text-red-300 mt-2">{error}</p>
                    <button onClick={handleRemoveFile} className="mt-4 px-4 py-2 bg-[#c36e26] text-white rounded-lg hover:bg-[#e2a32d]">
                        Try Again
                    </button>
                </div>
            )}

            {!isParsing && !error && fileName && (
                <div className="flex flex-col flex-grow items-center justify-center text-center">
                    <div className="flex items-center justify-center text-6xl">
                        <FileTypeIcon/>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-gray-200 truncate max-w-full px-4">{fileName}</p>
                    <p className="mt-1 text-sm text-green-400">File ready for analysis.</p>
                     <button onClick={handleRemoveFile} className="mt-4 text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                        <XCircleIcon className="w-4 h-4"/> Remove File
                    </button>
                </div>
            )}
            
            <div className="flex justify-end items-center mt-4 pt-4 border-t border-[#5c6f7e]">
                 <button
                    onClick={() => onAnalyze(extractedText)}
                    disabled={isLoading || isParsing || !extractedText}
                    className="px-6 py-3 bg-[#c36e26] text-white font-semibold rounded-lg shadow-md hover:bg-[#e2a32d] disabled:bg-[#5c6f7e] disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center w-36"
                >
                    {isLoading ? (
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        'Analyze'
                    )}
                </button>
            </div>
        </div>
    );
};