'use client';

import { useState } from 'react';
import type { DocumentItem } from '@/lib/types/dashboard';

interface FileImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFolderId?: string | null;
    onImport: (files: File[], folderId?: string | null) => void;
}

function FileImportModal({ isOpen, onClose, currentFolderId, onImport }: FileImportModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const validateFiles = (files: File[]): { validFiles: File[], invalidFiles: string[] } => {
        const allowedExtensions = ['.md', '.marp'];
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        files.forEach(file => {
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            if (allowedExtensions.includes(fileExtension)) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        return { validFiles, invalidFiles };
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            const { validFiles, invalidFiles } = validateFiles(files);

            if (invalidFiles.length > 0) {
                setError(`Invalid file types: ${invalidFiles.join(', ')}. Only .md and .marp files are supported.`);
                return;
            }

            setSelectedFiles(prev => [...prev, ...validFiles]);
            setError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const { validFiles, invalidFiles } = validateFiles(files);

            if (invalidFiles.length > 0) {
                setError(`Invalid file types: ${invalidFiles.join(', ')}. Only .md and .marp files are supported.`);
                return;
            }

            setSelectedFiles(prev => [...prev, ...validFiles]);
            setError(null);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setError(null);
    };

    const handleImport = async () => {
        if (selectedFiles.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            // 각 파일의 유효성 검증
            for (const file of selectedFiles) {
                const content = await file.text();

                // Basic validation - .md 파일은 marp 설정이 선택사항, .marp 파일은 필수
                const isMarpFile = file.name.toLowerCase().endsWith('.marp');
                if (isMarpFile && !content.includes('marp: true') && !content.includes('marp:')) {
                    throw new Error(`${file.name}: Marp files must contain valid marp configuration`);
                }
            }

            onImport(selectedFiles, currentFolderId);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import files');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setSelectedFiles([]);
        setError(null);
        setIsProcessing(false);
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        } else if (e.key === 'Enter' && selectedFiles.length > 0 && !isProcessing) {
            handleImport();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyPress}
            >
                <h2>Import Presentation Files</h2>
                <p>Select or drag & drop multiple markdown (.md) or Marp (.marp) files to import as new presentation documents.</p>

                <div
                    className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="file-input-container">
                        <input
                            id="file-input"
                            type="file"
                            accept=".md,.marp"
                            multiple
                            onChange={handleFileSelect}
                            disabled={isProcessing}
                            aria-describedby="file-help"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="file-input" className="file-input-label">
                            Choose files...
                        </label>
                        <p id="file-help" className="file-help-text">
                            Supported formats: .md, .marp (multiple files allowed)
                        </p>
                        <div className="drop-zone-text">
                            Or drag & drop files here
                        </div>
                    </div>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="selected-files-list">
                        <h3>Selected Files ({selectedFiles.length})</h3>
                        <ul className="files-list">
                            {selectedFiles.map((file, index) => (
                                <li key={index} className="file-item">
                                    <div className="file-info">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-file-btn"
                                        onClick={() => removeFile(index)}
                                        disabled={isProcessing}
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        onClick={handleClose}
                        className="btn-cancel"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={selectedFiles.length === 0 || isProcessing}
                        className="btn-primary"
                    >
                        {isProcessing ? `Importing ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}...` : `Import ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FileImportModal;
