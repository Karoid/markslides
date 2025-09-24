'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
    fetchDashboardItems,
    createFolder,
    setCurrentFolder,
    updateCurrentPath,
    restoreFromLocalStorage,
    moveItem,
    setSortOrder,
    createDocument,
    importDocument,
    deleteItem,
} from '@/redux/slices/dashboardSlice';
import type { DashboardItem, Folder } from '@/lib/types/dashboard';

// 컴포넌트 임포트
import DashboardHeader from './DashboardHeader';
import FolderBreadcrumb from './FolderBreadcrumb';
import ItemGrid from './ItemGrid';
import PaginationControls from './PaginationControls';
import FileImportModal from './FileImportModal';

function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const {
        items,
        currentFolderId,
        currentPath,
        currentPage,
        itemsPerPage,
        sortOrder,
        sortDirection,
        totalItems,
        totalPages,
        isLoading,
        error,
    } = useSelector((state: RootState) => state.dashboard);

    const [isFileImportOpen, setIsFileImportOpen] = useState(false);

    // 초기 로컬 스토리지 복원
    useEffect(() => {
        dispatch(restoreFromLocalStorage());
    }, [dispatch]);

    // 데이터 로드 (폴더/페이지/정렬 변경 시)
    useEffect(() => {
        dispatch(fetchDashboardItems({
            folderId: currentFolderId,
            page: currentPage,
            limit: itemsPerPage,
            sort: sortOrder,
            order: sortDirection,
        }));
    }, [dispatch, currentFolderId, currentPage, sortOrder, sortDirection]);

    // 현재 경로 계산
    useEffect(() => {
        const calculateCurrentPath = (folderId: string | null): Folder[] => {
            if (!folderId) return [];

            const path: Folder[] = [];
            let currentId = folderId;

            while (currentId) {
                const folder = items[currentId];
                if (folder && folder.type === 'folder') {
                    path.unshift(folder as Folder);
                    currentId = folder.parentId;
                } else {
                    break;
                }
            }

            return path;
        };

        const newPath = calculateCurrentPath(currentFolderId);
        dispatch(updateCurrentPath(newPath));
    }, [currentFolderId, items, dispatch]);

    // 현재 폴더의 아이템들을 가져옴 (API에서 받아온 아이템들)
    const getCurrentItems = (): DashboardItem[] => {
        const allItems = Object.values(items) as DashboardItem[];
        return allItems.filter(item => {
            if (item.type === 'folder') {
                return (item as any).parentId === currentFolderId;
            } else {
                return (item as any).folderId === currentFolderId;
            }
        });
    };

    const currentItems = getCurrentItems();
    // API에서 받아온 totalPages를 사용 (Redux 상태)
    const paginatedItems = currentItems;

    // 이벤트 핸들러
    const handleCreateFolder = async (name: string) => {
        try {
            await dispatch(createFolder({
                name,
                parentId: currentFolderId || undefined,
            })).unwrap();

            // 새로고침
            dispatch(fetchDashboardItems({
                folderId: currentFolderId,
                page: currentPage,
                limit: itemsPerPage,
                sort: sortOrder,
                order: sortDirection,
            }));
        } catch (error) {
            console.error('Failed to create folder:', error);
            alert('Failed to create folder');
        }
    };

    const handleCreateDocument = async (name: string) => {
        try {
            await dispatch(createDocument({
                name,
                folderId: currentFolderId || undefined,
            })).unwrap();

            // 새로고침
            dispatch(fetchDashboardItems({
                folderId: currentFolderId,
                page: currentPage,
                limit: itemsPerPage,
                sort: sortOrder,
                order: sortDirection,
            }));
        } catch (error) {
            console.error('Failed to create document:', error);
            alert('Failed to create document');
        }
    };

    const handleFolderNavigate = (folderId: string | null) => {
        dispatch(setCurrentFolder(folderId));
    };

    const handleItemClick = (item: DashboardItem) => {
        if (item.type === 'folder') {
            handleFolderNavigate(item.id);
        } else {
            // 문서 열기 - 에디터 페이지로 이동
            router.push(`/documents/${item.id}/editor`);
        }
    };

    const handleItemDragStart = (item: DashboardItem) => {
        // 드래그 시작 시 처리 (필요시)
    };

    const handleItemMove = async (itemId: string, targetFolderId: string) => {
        try {
            await dispatch(moveItem({ itemId, targetFolderId })).unwrap();

            // 현재 폴더의 아이템들 새로고침
            dispatch(fetchDashboardItems({
                folderId: currentFolderId,
                page: currentPage,
                limit: itemsPerPage,
                sort: sortOrder,
                order: sortDirection,
            }));
        } catch (error) {
            console.error('Failed to move item:', error);
            alert('Failed to move item');
        }
    };

    const handleItemDelete = async (item: DashboardItem) => {
        try {
            await dispatch(deleteItem({
                itemId: item.id,
                itemType: item.type
            })).unwrap();

            // 현재 폴더의 아이템들 새로고침
            dispatch(fetchDashboardItems({
                folderId: currentFolderId,
                page: currentPage,
                limit: itemsPerPage,
                sort: sortOrder,
                order: sortDirection,
            }));
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item');
        }
    };

    const handleFileImport = async (file: File, folderId?: string | null) => {
        try {
            await dispatch(importDocument({
                file,
                folderId: folderId || null,
            })).unwrap();

            // 새로고침
            dispatch(fetchDashboardItems({
                folderId: currentFolderId,
                page: currentPage,
                limit: itemsPerPage,
                sort: sortOrder,
                order: sortDirection,
            }));

            setIsFileImportOpen(false);
        } catch (error) {
            console.error('Failed to import document:', error);
            alert('Failed to import document');
        }
    };

    const handleFileImportClose = () => {
        setIsFileImportOpen(false);
    };

    const handleSortChange = (order: 'name' | 'created' | 'updated' | 'lastOpened', direction: 'asc' | 'desc') => {
        dispatch(setSortOrder({ order, direction }));
        // setSortOrder 액션에서 currentPage를 1로 리셋하고, useEffect에서 자동으로 fetchDashboardItems 호출됨
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader
                currentFolder={currentFolderId ? items[currentFolderId] as any : null}
                onCreateFolder={handleCreateFolder}
                onCreateDocument={handleCreateDocument}
                onImportFile={() => setIsFileImportOpen(true)}
                sortOrder={sortOrder}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
            />

            <FolderBreadcrumb
                currentPath={currentPath}
                onNavigate={handleFolderNavigate}
            />

            <div className="dashboard-content">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <ItemGrid
                    items={paginatedItems}
                    loading={isLoading}
                    onItemClick={handleItemClick}
                    onItemDragStart={handleItemDragStart}
                    onItemMove={handleItemMove}
                    onItemDelete={handleItemDelete}
                />

                {totalPages > 1 && (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            dispatch(fetchDashboardItems({
                                folderId: currentFolderId,
                                page,
                                limit: itemsPerPage,
                                sort: sortOrder,
                                order: sortDirection,
                            }));
                        }}
                    />
                )}
            </div>

            <FileImportModal
                isOpen={isFileImportOpen}
                onClose={handleFileImportClose}
                currentFolderId={currentFolderId}
                onImport={handleFileImport}
            />
        </div>
    );
}

export default Dashboard;