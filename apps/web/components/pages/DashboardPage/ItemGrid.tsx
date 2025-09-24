'use client';

import type { DashboardItem } from '@/lib/types/dashboard';
import ItemCard from './ItemCard';

interface ItemGridProps {
    items: DashboardItem[];
    loading: boolean;
    onItemClick: (item: DashboardItem) => void;
    onItemDragStart?: (item: DashboardItem) => void;
    onItemMove?: (itemId: string, targetFolderId: string) => void;
    onItemDelete?: (item: DashboardItem) => void;
}

function ItemGrid({ items, loading, onItemClick, onItemDragStart, onItemMove, onItemDelete }: ItemGridProps) {
    if (loading) {
        return (
            <div className="item-grid loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="item-grid empty">
                <div className="empty-state">
                    <div className="empty-icon">📂</div>
                    <h3>No items found</h3>
                    <p>Create a folder or import a file to get started.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="item-grid">
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => onItemClick(item)}
                    onDragStart={onItemDragStart}
                    onMove={onItemMove}
                    onDelete={onItemDelete}
                />
            ))}
        </div>
    );
}

export default ItemGrid;
