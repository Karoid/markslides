'use client';

import type { Folder } from '@/lib/types/dashboard';

interface FolderBreadcrumbProps {
    currentPath: Folder[];
    onNavigate: (folderId: string | null) => void;
}

function FolderBreadcrumb({ currentPath, onNavigate }: FolderBreadcrumbProps) {
    return (
        <nav className="folder-breadcrumb" aria-label="Folder navigation">
            <div className="breadcrumb-list">
                <button
                    onClick={() => onNavigate(null)}
                    className="breadcrumb-item breadcrumb-home"
                    aria-label="Go to root folder"
                >
                    📁 Home
                </button>

                {currentPath.map((folder, index) => (
                    <div key={folder.id} className="breadcrumb-segment">
                        <span className="breadcrumb-separator">/</span>
                        {index === currentPath.length - 1 ? (
                            <span className="breadcrumb-item breadcrumb-current">
                                {folder.name}
                            </span>
                        ) : (
                            <button
                                onClick={() => onNavigate(folder.id)}
                                className="breadcrumb-item"
                                aria-label={`Go to folder ${folder.name}`}
                            >
                                {folder.name}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
}

export default FolderBreadcrumb;
