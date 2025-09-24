'use client';

import { useState, useEffect } from 'react';
import SlidePreview from '@/components/fragments/SlidePreview';
import type { DashboardItem, FolderItem } from '@/lib/types/dashboard';

interface ItemCardProps {
    item: DashboardItem;
    onClick: () => void;
    onDragStart?: (item: DashboardItem) => void;
    onMove?: (itemId: string, targetFolderId: string) => void;
    onDelete?: (item: DashboardItem) => void;
}

function ItemCard({ item, onClick, onDragStart, onMove, onDelete }: ItemCardProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            id: item.id,
            type: item.type
        }));
        onDragStart?.(item);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (item.type === 'folder') {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (item.type !== 'folder') return;

        try {
            const draggedData = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (draggedData.id !== item.id) {
                onMove?.(draggedData.id, item.id);
            }
        } catch (error) {
            console.error('Failed to parse drag data:', error);
        }
    };

    const getItemIcon = () => {
        if (item.type === 'folder') {
            return '📁';
        } else {
            return '📄';
        }
    };

    const getItemMeta = () => {
        if (item.type === 'folder') {
            const folder = item as FolderItem;
            const count = folder.childrenCount ?? 0;
            return `${count} items`;
        } else {
            const doc = item as any;
            if (doc.lastOpenedAt) {
                return `Opened ${new Date(doc.lastOpenedAt).toLocaleDateString()}`;
            } else {
                return `Created ${new Date(doc.createdAt).toLocaleDateString()}`;
            }
        }
    };

    return (
        <div
            className={`item-card ${isDragOver ? 'drag-over' : ''}`}
            onClick={onClick}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}
            aria-label={`${item.type === 'folder' ? 'Folder' : 'Document'}: ${item.type === 'folder' ? item.name : (item as any).title}`}
        >
            {/* 슬라이드 미리보기 (문서만) */}
            {item.type === 'document' && (
                <div className="slide-preview-container">
                    <SlidePreview
                        content={(item as any).content || ''}
                        slideConfig={(item as any).slideConfig || {}}
                        width="100%"
                        height="100%"
                    />
                </div>
            )}

            {/* 폴더 아이콘 */}
            {item.type === 'folder' && (
                <div className="item-icon">
                    {getItemIcon()}
                </div>
            )}

            <div className="item-info">
                <h3 className="item-title">
                    {item.name}
                </h3>
                <div className="item-meta">
                    {getItemMeta()}
                </div>
            </div>

            {/* 액션 메뉴 (폴더와 문서 모두) */}
            <div className="item-actions">
                <button
                    className="action-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    aria-label={`${item.type === 'folder' ? 'Folder' : 'Document'} actions`}
                >
                    ⋯
                </button>

                {showMenu && (
                    <div className="action-menu">
                        <button
                            className="action-menu-item delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                const itemType = item.type === 'folder' ? '폴더' : '문서';
                                if (window.confirm(`"${item.name}" ${itemType}를 삭제하시겠습니까?`)) {
                                    onDelete?.(item);
                                    setShowMenu(false);
                                }
                            }}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ItemCard;
