// 기존 Prisma 스키마와 호환되는 타입 정의
export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Document {
    id: string;
    name: string;
    content: string;
    slideConfig: any; // JSON object
    folderId: string | null;
    lastOpenedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// 대시보드 표시용 통합 타입
export type DashboardItemType = 'folder' | 'document';

export interface FolderItem {
    id: string;
    type: 'folder';
    name: string;
    parentId: string | null;
    childrenCount?: number; // 폴더 내 아이템 총 개수
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentItem {
    id: string;
    type: 'document';
    name: string;
    folderId: string | null;
    slideConfig: any;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    lastOpenedAt?: Date;
}

export type DashboardItem = FolderItem | DocumentItem;

// 대시보드 상태 관리
export interface DashboardState {
    items: Record<string, DashboardItem>;
    currentFolderId: string | null;
    currentPath: Folder[]; // 현재 경로 표시용
    currentPage: number;
    itemsPerPage: 12;
    sortOrder: 'name' | 'created' | 'updated' | 'lastOpened';
    sortDirection: 'asc' | 'desc';
    totalItems: number; // 전체 아이템 수
    totalPages: number; // 전체 페이지 수
    isLoading: boolean;
    error: string | null;
}

// API 응답 타입
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// 폼 데이터 타입
export interface CreateFolderRequest {
    name: string;
    parentId?: string;
}

export interface MoveItemRequest {
    itemId: string;
    targetFolderId: string | null;
}

export interface FileUploadRequest {
    file: File;
    folderId?: string;
}

// 컴포넌트 Props 타입
export interface DashboardProps {
    className?: string;
}

export interface ItemCardProps {
    item: DashboardItem;
    onClick: () => void;
    onDragStart?: (item: DashboardItem) => void;
    onMove?: (itemId: string, targetFolderId: string) => void;
}

export interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export interface FolderBreadcrumbProps {
    currentPath: Folder[];
    onNavigate: (folderId: string | null) => void;
}

export interface FileImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFolderId?: string | null;
    onImport: (document: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}
