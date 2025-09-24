'use client';

import { useState } from 'react';

interface DashboardHeaderProps {
    currentFolder: any; // FolderItem | null
    onCreateFolder: (name: string) => void;
    onCreateDocument: (name: string) => void;
    onImportFile: () => void;
    sortOrder: 'name' | 'created' | 'updated' | 'lastOpened';
    sortDirection: 'asc' | 'desc';
    onSortChange: (order: 'name' | 'created' | 'updated' | 'lastOpened', direction: 'asc' | 'desc') => void;
}

function DashboardHeader({ currentFolder, onCreateFolder, onCreateDocument, onImportFile, sortOrder, sortDirection, onSortChange }: DashboardHeaderProps) {
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [documentName, setDocumentName] = useState('');

    const handleCreateFolder = () => {
        if (folderName.trim()) {
            onCreateFolder(folderName.trim());
            setFolderName('');
            setIsCreateFolderOpen(false);
        }
    };

    const handleCreateDocument = () => {
        if (documentName.trim()) {
            onCreateDocument(documentName.trim());
            setDocumentName('');
            setIsCreateDocumentOpen(false);
        }
    };

    const handleFolderKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateFolder();
        } else if (e.key === 'Escape') {
            setIsCreateFolderOpen(false);
            setFolderName('');
        }
    };

    const handleDocumentKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateDocument();
        } else if (e.key === 'Escape') {
            setIsCreateDocumentOpen(false);
            setDocumentName('');
        }
    };

    return (
        <div className="dashboard-header">
            <div className="header-info">
                <h1>Dashboard</h1>
                {currentFolder && (
                    <p>Current folder: {currentFolder.name}</p>
                )}
            </div>

            <div className="header-actions">
                {/* 정렬 컨트롤 */}
                <div className="sort-controls">
                    <select
                        value={sortOrder}
                        onChange={(e) => onSortChange(e.target.value as any, sortDirection)}
                        className="sort-select"
                    >
                        <option value="name">이름</option>
                        <option value="created">생성일</option>
                        <option value="updated">수정일</option>
                        <option value="lastOpened">마지막 열림</option>
                    </select>

                    <button
                        onClick={() => onSortChange(sortOrder, sortDirection === 'asc' ? 'desc' : 'asc')}
                        className="sort-direction-btn"
                        title={sortDirection === 'asc' ? '오름차순' : '내림차순'}
                    >
                        {sortDirection === 'asc' ? '↑' : '↓'}
                    </button>
                </div>

                <button
                    onClick={() => setIsCreateDocumentOpen(true)}
                    className="btn-primary"
                >
                    New Document
                </button>

                <button
                    onClick={() => setIsCreateFolderOpen(true)}
                    className="btn-primary"
                >
                    New Folder
                </button>

                <button
                    onClick={onImportFile}
                    className="btn-secondary"
                >
                    Import File
                </button>
            </div>

            {/* 문서 생성 모달 */}
            {isCreateDocumentOpen && (
                <div className="modal-overlay" onClick={() => setIsCreateDocumentOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Document</h2>

                        <div className="form-group">
                            <label htmlFor="documentName">Document Name</label>
                            <input
                                id="documentName"
                                type="text"
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                                onKeyPress={handleDocumentKeyPress}
                                placeholder="Enter document name"
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setIsCreateDocumentOpen(false)}
                                className="btn-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDocument}
                                disabled={!documentName.trim()}
                                className="btn-primary"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 폴더 생성 모달 */}
            {isCreateFolderOpen && (
                <div className="modal-overlay" onClick={() => setIsCreateFolderOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Folder</h2>

                        <div className="form-group">
                            <label htmlFor="folderName">Folder Name</label>
                            <input
                                id="folderName"
                                type="text"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                onKeyPress={handleFolderKeyPress}
                                placeholder="Enter folder name"
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setIsCreateFolderOpen(false)}
                                className="btn-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                disabled={!folderName.trim()}
                                className="btn-primary"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardHeader;
