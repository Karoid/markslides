'use client';

import { useState } from 'react';
import type { DocumentItem } from '@/lib/types/dashboard';

interface FileImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFolderId?: string | null;
    onImport: (file: File, folderId?: string | null) => void;
}

function FileImportModal({ isOpen, onClose, currentFolderId, onImport }: FileImportModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedExtensions = ['.md', '.marp'];
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

            if (!allowedExtensions.includes(fileExtension)) {
                setError('Please select a markdown (.md) or Marp (.marp) file');
                return;
            }

            setSelectedFile(file);
            setError(null);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setError(null);

        try {
            const content = await selectedFile.text();

            // Basic validation - .md 파일은 marp 설정이 선택사항, .marp 파일은 필수
            const isMarpFile = selectedFile.name.toLowerCase().endsWith('.marp');
            if (isMarpFile && !content.includes('marp: true') && !content.includes('marp:')) {
                throw new Error('Marp files must contain valid marp configuration');
            }

            onImport(selectedFile, currentFolderId);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import file');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setError(null);
        setIsProcessing(false);
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        } else if (e.key === 'Enter' && selectedFile && !isProcessing) {
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
                <h2>Import Presentation File</h2>
                <p>Select a markdown (.md) or Marp (.marp) file to import as a new presentation document.</p>

                <div className="file-input-container">
                    <input
                        id="file-input"
                        type="file"
                        accept=".md,.marp"
                        onChange={handleFileSelect}
                        disabled={isProcessing}
                        aria-describedby="file-help"
                    />
                    <label htmlFor="file-input" className="file-input-label">
                        Choose file...
                    </label>
                    <p id="file-help" className="file-help-text">
                        Supported formats: .md, .marp
                    </p>

                    {selectedFile && (
                        <div className="file-info" role="status" aria-live="polite">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </div>
                    )}
                </div>

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
                        disabled={!selectedFile || isProcessing}
                        className="btn-primary"
                    >
                        {isProcessing ? 'Importing...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FileImportModal;
