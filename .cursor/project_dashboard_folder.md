# MarkSlides 대시보드 개선 - 프로젝트 및 폴더 관리

## 개요

본 기술개발문서는 계층적 폴더 구조, 페이지네이션, 파일 불러오기 기능을 갖춘 향상된 MarkSlides 대시보드 구현을 다룹니다. 이 대시보드는 중첩 폴더를 지원하는 프로젝트 조직화와 프레젠테이션 프로젝트 관리를 위한 깔끔한 영어 전용 UI를 제공합니다.

## 현재 상태 분석

### 기존 대시보드 구조
- **위치**: `apps/web/app/slide-list/page.tsx`
- **컴포넌트**: `apps/web/components/pages/SlideListPage/`
- **데이터 소스**: 목 데이터 (`apps/web/lib/constants/mockData.ts`)
- **현재 기능**:
  - 프레젠테이션 슬라이드를 표시하는 그리드 레이아웃
  - 기본 슬라이드 미리보기 렌더링
  - 폴더 구조 및 조직화 기능 없음

### 현재 데이터 모델

```typescript
type Slide = {
    config: string;
    content: string;
};
```

## 요구사항

### 1. 폴더 구조 구현
- **계층적 폴더**: 폴더 안에 폴더가 가능한 중첩 구조 지원
- **프로젝트 조직화**: 드래그 앤 드롭으로 프로젝트를 폴더 간 이동
- **폴더 조작**: 폴더 생성, 이름 변경, 삭제
- **네비게이션**: 폴더 계층을 위한 빵 부스러기 네비게이션

### 2. 페이지네이션 시스템
- **페이지 크기**: 한 페이지에 최대 12개 항목 (폴더 + 프로젝트)
- **네비게이션**: 이전/다음 버튼과 페이지 인디케이터
- **정렬**: 폴더 우선, 그 다음 프로젝트 알파벳순
- **성능**: 필요 시 항목들을 온디맨드 로딩

### 3. 정렬 및 표시 순서
- **우선순위**: 폴더 > 프로젝트
- **알파벳 정렬**: 각 카테고리 내에서 알파벳순
- **시각적 구분**: 폴더와 프로젝트의 명확한 시각적 구분

### 4. 파일 불러오기 기능
- **파일 선택**: 마크다운 파일을 위한 네이티브 파일 입력
- **프로젝트 생성**: 불러온 파일로부터 자동으로 새 프로젝트 생성
- **검증**: 파일 형식 및 내용 유효성 확인
- **오류 처리**: 잘못된 파일에 대한 우아한 오류 메시지

### 5. UI 언어 요구사항
- **언어**: 모든 UI 요소는 영어로 표시
- **일관성**: 애플리케이션 전체에 걸쳐 영어 유지
- **접근성**: 적절한 영어 라벨 및 설명

## 백엔드 구현

### 데이터베이스 설계

#### 폴더 및 프로젝트 테이블 구조

```sql
-- 폴더 테이블
CREATE TABLE folders (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- 기존 Document 테이블 확장
ALTER TABLE documents ADD COLUMN folder_id VARCHAR(36) NULL;
ALTER TABLE documents ADD COLUMN last_opened_at TIMESTAMP NULL;
ALTER TABLE documents ADD FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL;
```

#### 인덱스 및 제약조건

```sql
-- 성능을 위한 인덱스
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_documents_folder ON documents(folder_id);
CREATE INDEX idx_documents_updated ON documents(updated_at DESC);
CREATE INDEX idx_documents_last_opened ON documents(last_opened_at DESC);
```

### API 설계

#### RESTful API 엔드포인트

```
GET    /api/dashboard/items?page=1&limit=12&folder_id=null&sort=name&order=asc
POST   /api/folders
PUT    /api/folders/{id}
DELETE /api/folders/{id}
POST   /api/documents/import
PUT    /api/documents/{id}/move
DELETE /api/documents/{id}
POST   /api/dashboard/upload
```

#### API 응답 형식

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "folder-123",
        "type": "folder",
        "name": "Presentations",
        "parentId": null,
        "children": ["doc-456", "folder-789"],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T14:45:00Z"
      },
      {
        "id": "doc-456",
        "type": "document",
        "title": "Q4 Report",
        "folderId": null,
        "slideConfig": {"marp": true, "theme": "default"},
        "content": "# Q4 Report\n\nContent here...",
        "createdAt": "2024-01-10T09:15:00Z",
        "updatedAt": "2024-01-18T16:20:00Z",
        "lastOpenedAt": "2024-01-22T11:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "totalPages": 4
    }
  }
}
```

### 서버 사이드 로직

#### 폴더 관리 서비스

```typescript
// services/folderService.ts
class FolderService {
    async createFolder(name: string, parentId?: string): Promise<Folder> {
        // 계층적 구조 검증 (순환 참조 방지)
        if (parentId) {
            await this.validateHierarchy(parentId);
        }

        const folder = await Folder.create({
            id: generateId(),
            name,
            parentId
        });

        return folder;
    }

    async moveFolder(folderId: string, newParentId?: string): Promise<void> {
        // 자기 자신으로의 이동 방지
        if (folderId === newParentId) {
            throw new Error('Cannot move folder to itself');
        }

        // 순환 참조 검증
        if (newParentId) {
            await this.validateHierarchy(newParentId, folderId);
        }

        await Folder.update(
            { parentId: newParentId, updatedAt: new Date() },
            { where: { id: folderId } }
        );
    }

    private async validateHierarchy(parentId: string, excludeId?: string): Promise<void> {
        const ancestors = await this.getAncestorIds(parentId);
        if (ancestors.includes(excludeId)) {
            throw new Error('Circular reference detected');
        }
    }
}
```

#### 파일 업로드 및 처리 서비스

```typescript
// services/fileService.ts
class FileService {
    async processMarkdownFile(file: File, folderId?: string): Promise<Document> {
        const content = await this.readFileContent(file);

        // 마크다운/Marp 파일 검증
        this.validateFileContent(content);

        // 제목 추출
        const title = this.extractTitle(content);

        // 설정 추출 (기존 slideConfig와 호환)
        const slideConfig = this.extractSlideConfig(content);

        return await Document.create({
            id: generateId(),
            title,
            folderId,
            slideConfig,
            content
        });
    }

    private validateFileContent(content: string): void {
        // .md 파일의 경우 marp 설정이 있을 수도 있고 없을 수도 있음
        // .marp 파일의 경우 반드시 marp 설정이 있어야 함
        const isMarpFile = content.includes('marp: true') || content.includes('marp:');
        if (!isMarpFile && !content.trim()) {
            throw new Error('File appears to be empty or invalid');
        }
    }

    private extractTitle(content: string): string {
        // 먼저 frontmatter에서 title 찾기
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
            if (titleMatch) {
                return titleMatch[1].trim();
            }
        }

        // frontmatter에 없으면 첫 번째 헤더에서 추출
        const headerMatch = content.match(/^#\s+(.+)$/m);
        return headerMatch ? headerMatch[1] : 'Untitled Presentation';
    }

    private extractSlideConfig(content: string): object {
        const configMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (configMatch) {
            try {
                // YAML 파싱 시뮬레이션 (실제로는 라이브러리 사용)
                const configLines = configMatch[1].split('\n');
                const config: any = {};

                configLines.forEach(line => {
                    const [key, ...valueParts] = line.split(':');
                    if (key && valueParts.length > 0) {
                        const value = valueParts.join(':').trim();
                        if (value === 'true') config[key.trim()] = true;
                        else if (value === 'false') config[key.trim()] = false;
                        else if (!isNaN(Number(value))) config[key.trim()] = Number(value);
                        else config[key.trim()] = value;
                    }
                });

                return config;
            } catch {
                // 파싱 실패 시 기본 설정
                return { marp: true, theme: 'default' };
            }
        }

        return { marp: true, theme: 'default' };
    }
}
```

## 프론트엔드 구현

### 간단한 컴포넌트 구조

#### 메인 대시보드 컴포넌트

```typescript
// components/Dashboard.tsx
function Dashboard() {
    const [currentFolder, setCurrentFolder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 폴더 및 프로젝트 목록 불러오기
    const loadItems = async (folderId = null) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/dashboard/items?folder_id=${folderId}`);
            const data = await response.json();
            setItems(data.items);
        } finally {
            setLoading(false);
        }
    };

    // 폴더 생성
    const createFolder = async (name) => {
        await fetch('/api/folders', {
            method: 'POST',
            body: JSON.stringify({ name, parentId: currentFolder })
        });
        loadItems(currentFolder);
    };

    // 파일 업로드 (.md, .marp 파일 지원)
    const uploadFile = async (file) => {
        // 파일 확장자 검증
        const allowedExtensions = ['.md', '.marp'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!allowedExtensions.includes(fileExtension)) {
            alert('Please select a .md or .marp file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderId', currentFolder || '');

        await fetch('/api/documents/import', {
            method: 'POST',
            body: formData
        });
        loadItems(currentFolder);
    };

    return (
        <div className="dashboard">
            <DashboardHeader
                onCreateFolder={createFolder}
                onUploadFile={uploadFile}
            />
            <Breadcrumb currentFolder={currentFolder} />
            <ItemGrid items={items} loading={loading} />
            <Pagination />
        </div>
    );
}
```

#### 폴더 및 프로젝트 아이템 컴포넌트

```typescript
// components/ItemCard.tsx
function ItemCard({ item, onDragStart, onDrop, onMove }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleClick = () => {
        if (item.type === 'folder') {
            onFolderOpen(item.id);
        } else {
            openDocument(item.id);
        }
    };

    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            id: item.id,
            type: item.type
        }));
        onDragStart?.(item);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (item.type === 'folder') {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (item.type !== 'folder') return;

        try {
            const draggedData = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (draggedData.id !== item.id) {
                onMove(draggedData.id, item.id);
            }
        } catch (error) {
            console.error('Failed to parse drag data:', error);
        }
    };

    return (
        <div
            className={`item-card ${isDragOver ? 'drag-over' : ''}`}
            onClick={handleClick}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {item.type === 'folder' ? (
                <FolderIcon />
            ) : (
                <DocumentIcon />
            )}
            <h3>{item.title || item.name}</h3>
            <div className="item-meta">
                {item.type === 'folder'
                    ? `${item.children?.length || 0} items`
                    : formatDate(item.updatedAt)
                }
            </div>
        </div>
    );
}
```

#### 데이터 구조

```typescript
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
    title: string;
    content: string;
    slideConfig: any; // JSON object
    folderId: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastOpenedAt?: Date;
}

// 대시보드 표시용 통합 타입
export type DashboardItemType = 'folder' | 'document';

export interface FolderItem {
    id: string;
    type: 'folder';
    name: string;
    parentId: string | null;
    children: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentItem {
    id: string;
    type: 'document';
    title: string;
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
    isLoading: boolean;
    error: string | null;
}
```

### Redux State Management

#### New Slice: `dashboardSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: initialDashboardState,
    reducers: {
        // Navigation
        setCurrentFolder: (state, action: PayloadAction<string | null>) => {
            state.currentFolderId = action.payload;
            state.currentPage = 1; // Reset to first page
        },

        // CRUD operations
        addFolder: (state, action: PayloadAction<Omit<FolderItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
            const id = generateId();
            const now = new Date();
            state.items[id] = {
                ...action.payload,
                id,
                createdAt: now,
                updatedAt: now,
            };
        },

        addDocument: (state, action: PayloadAction<Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
            const id = generateId();
            const now = new Date();
            state.items[id] = {
                ...action.payload,
                id,
                createdAt: now,
                updatedAt: now,
            };
        },

        updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<DashboardItem> }>) => {
            const { id, updates } = action.payload;
            if (state.items[id]) {
                state.items[id] = {
                    ...state.items[id],
                    ...updates,
                    updatedAt: new Date(),
                };
            }
        },

        deleteItem: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const item = state.items[id];

            if (item?.type === 'folder') {
                // Recursively delete all children
                const children = getAllChildren(state.items, id);
                children.forEach(childId => delete state.items[childId]);
            }

            delete state.items[id];
        },

        // Move operations (폴더와 문서 모두 이동 가능)
        moveItem: (state, action: PayloadAction<{ itemId: string; targetFolderId: string | null }>) => {
            const { itemId, targetFolderId } = action.payload;
            const item = state.items[itemId];

            if (item) {
                // Remove from old parent
                if (item.type === 'folder' && item.parentId) {
                    const oldParent = state.items[item.parentId] as FolderItem;
                    oldParent.children = oldParent.children.filter(id => id !== itemId);
                } else if (item.type === 'document' && item.folderId) {
                    // 기존 폴더에서 제거 (실제로는 API 호출로 처리)
                }

                // Update item location
                if (item.type === 'folder') {
                    (item as FolderItem).parentId = targetFolderId;
                } else {
                    (item as DocumentItem).folderId = targetFolderId;
                }

                // Add to new parent
                if (targetFolderId) {
                    const newParent = state.items[targetFolderId] as FolderItem;
                    newParent.children.push(itemId);
                }

                item.updatedAt = new Date();
            }
        },

        // 현재 경로 업데이트
        updateCurrentPath: (state, action: PayloadAction<Folder[]>) => {
            state.currentPath = action.payload;
        },

        // Pagination
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },

        // Sorting
        setSortOrder: (state, action: PayloadAction<{ order: DashboardState['sortOrder']; direction: DashboardState['sortDirection'] }>) => {
            state.sortOrder = action.payload.order;
            state.sortDirection = action.payload.direction;
        },

        // Loading states
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});
```

### Component Architecture

#### Updated Component Structure

```text
apps/web/components/pages/SlideListPage/
├── index.tsx (Main dashboard page)
├── DashboardHeader.tsx (Header with actions)
├── FolderBreadcrumb.tsx (Navigation breadcrumb)
├── ItemGrid.tsx (Grid container for folders/projects)
├── FolderItem.tsx (Folder card component)
├── ProjectItem.tsx (Project card component)
├── PaginationControls.tsx (Page navigation)
├── FileImportModal.tsx (File import dialog)
└── EmptyState.tsx (Empty folder/project state)
```

#### Key Components Implementation

**DashboardHeader.tsx**

```typescript
interface DashboardHeaderProps {
    currentFolder: FolderItem | null;
    onCreateFolder: () => void;
    onImportFile: () => void;
    onSortChange: (order: SortOption) => void;
}

function DashboardHeader({ currentFolder, onCreateFolder, onImportFile, onSortChange }: DashboardHeaderProps) {
    return (
        <div className="dashboard-header">
            <div className="header-actions">
                <button onClick={onCreateFolder}>
                    New Folder
                </button>
                <button onClick={onImportFile}>
                    Import File
                </button>
            </div>
            <div className="header-controls">
                <select onChange={(e) => onSortChange(e.target.value as SortOption)}>
                    <option value="name">Name</option>
                    <option value="created">Created Date</option>
                    <option value="updated">Updated Date</option>
                    <option value="lastOpened">Last Opened</option>
                </select>
            </div>
        </div>
    );
}
```

**FolderItem.tsx**

```typescript
interface FolderItemProps {
    folder: FolderItem;
    onClick: () => void;
    onRename: (newName: string) => void;
    onDelete: () => void;
    onDragStart: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
}

function FolderItem({ folder, onClick, onRename, onDelete, onDragStart, onDrop }: FolderItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(folder.name);

    const handleRename = () => {
        if (editName.trim() && editName !== folder.name) {
            onRename(editName.trim());
        }
        setIsEditing(false);
    };

    return (
        <div
            className="folder-item"
            draggable
            onDragStart={onDragStart}
            onDrop={onDrop}
            onClick={onClick}
        >
            <div className="folder-icon">
                📁
            </div>
            {isEditing ? (
                <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleRename}
                    onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                />
            ) : (
                <div className="folder-name" onDoubleClick={() => setIsEditing(true)}>
                    {folder.name}
                </div>
            )}
            <div className="folder-actions">
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                    Rename
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                    Delete
                </button>
            </div>
            <div className="folder-meta">
                {folder.children.length} items
            </div>
        </div>
    );
}
```

**PaginationControls.tsx**

```typescript
interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="pagination-controls">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </button>

            {getVisiblePages().map((page, index) => (
                <button
                    key={index}
                    className={page === currentPage ? 'active' : ''}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                >
                    {page}
                </button>
            ))}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
}
```

### File Import Implementation

#### FileImportModal.tsx

```typescript
interface FileImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

function FileImportModal({ isOpen, onClose, onImport }: FileImportModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
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

            // Extract title from first heading
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : selectedFile.name.replace(/\.(md|marp)$/i, '');

            // Extract config (frontmatter)
            const configMatch = content.match(/^---\n([\s\S]*?)\n---/);
            const config = configMatch ? configMatch[1] : 'marp: true\ntheme: default';

            const project = {
                name: title,
                folderId: null, // Import to root
                config,
                content,
                type: 'project' as const,
            };

            onImport(project);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import file');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Import Presentation File</h2>
                <p>Select a markdown (.md) or Marp (.marp) file to import as a new presentation document.</p>

                <div className="file-input-container">
                    <input
                        type="file"
                        accept=".md,.marp"
                        onChange={handleFileSelect}
                        disabled={isProcessing}
                    />
                    {selectedFile && (
                        <div className="file-info">
                            Selected: {selectedFile.name}
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="modal-actions">
                    <button onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!selectedFile || isProcessing}
                    >
                        {isProcessing ? 'Importing...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

### 유틸리티 및 헬퍼 함수

#### 폴더 계층 관리 유틸리티
- 폴더 내 항목 필터링 및 정렬
- 계층적 구조 검증 (순환 참조 방지)
- ID 생성 및 고유성 보장

#### 로컬 저장소 관리
- 대시보드 상태의 클라이언트 사이드 저장
- 데이터 직렬화 및 역직렬화
- 브라우저 저장소 크기 제한 처리

### UI 스타일링

#### 반응형 디자인
- 모바일 우선 접근 방식
- 그리드 레이아웃을 통한 적응형 카드 배치
- 터치 친화적 인터랙션 요소

#### 일관된 디자인 시스템
- 폴더와 프로젝트의 시각적 구분
- 호버 및 액티브 상태 표시
- 접근성을 위한 충분한 색상 대비

## 구현 계획

### 1단계: 백엔드 인프라 구축
1. 기존 Document 테이블에 folder_id, last_opened_at 컬럼 추가
2. 폴더 테이블 생성 및 관계 설정
3. API 엔드포인트 구현 (폴더 CRUD, 문서 이동, 파일 업로드)
4. 데이터 검증 및 보안 로직 구현

### 2단계: 프론트엔드 기본 기능
1. 대시보드 컴포넌트 구조 설계
2. 폴더 및 문서 표시 기능 구현
3. 현재 디렉토리 경로 표시 기능
4. 기본 CRUD 작업 (폴더 생성/삭제, 문서 불러오기)

### 3단계: 고급 기능 구현
1. 드래그 앤 드롭으로 폴더/문서 이동 기능
2. 페이지네이션 시스템 (12개 항목 per page)
3. 파일 업로드 (.md, .marp 확장자 지원)
4. 정렬 및 필터링 기능

### 4단계: 테스트 및 배포
1. 단위 테스트 및 통합 테스트
2. 사용자 경험 테스트 (드래그 앤 드롭, 파일 업로드)
3. 성능 최적화 및 배포

## 마이그레이션 전략

### 데이터 이전
- 기존 목 데이터를 새로운 구조로 변환하는 유틸리티 생성
- 기존 프로젝트를 루트 레벨 항목으로 보존
- 전환 과정에서 하위 호환성 유지

### 점진적 배포
- 새로운 대시보드를 위한 기능 플래그 구현
- 사용자가 새 인터페이스를 선택할 수 있도록 허용
- 기존 사용자들을 위한 마이그레이션 경로 제공

## 성능 고려사항

### 최적화 전략
- **가상 스크롤링**: 대용량 목록 (100개 이상 항목)에 적용
- **지연 로딩**: 항목 미리보기를 필요 시 로딩
- **디바운스 검색**: 대용량 데이터셋 필터링 시 적용
- **메모이제이션**: 고비용 계산 결과 캐싱

### 메모리 관리
- 썸네일 캐시 크기 제한
- 미사용 항목 정리 구현
- 리렌더링 최적화를 통한 성능 향상

## 결론

이 구현은 MarkSlides의 단순성과 성능 특성을 유지하면서 전문적인 프로젝트 관리 대시보드의 견고한 기반을 제공합니다. 기존 Document 테이블을 활용한 계층적 폴더 구조와 드래그 앤 드롭 기능을 통해 프레젠테이션 문서를 효율적으로 조직화하고 관리할 수 있습니다. .md와 .marp 파일 모두 지원하여 다양한 사용자 요구사항을 충족합니다.
