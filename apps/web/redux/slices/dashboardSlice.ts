import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AsyncThunk } from '@reduxjs/toolkit';
import type {
    DashboardState,
    DashboardItem,
    FolderItem,
    DocumentItem,
    Folder,
    PaginatedResponse,
    ApiResponse,
} from '@/lib/types/dashboard';

// 초기 상태
const initialState: DashboardState = {
    items: {},
    currentFolderId: null,
    currentPath: [],
    currentPage: 1,
    itemsPerPage: 12,
    sortOrder: 'name',
    sortDirection: 'asc',
    totalItems: 0,
    totalPages: 1,
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchDashboardItems: AsyncThunk<
    { data: PaginatedResponse<DashboardItem>; folderId: string | null },
    {
        folderId?: string | null;
        page?: number;
        limit?: number;
        sort?: 'name' | 'created' | 'updated' | 'lastOpened';
        order?: 'asc' | 'desc';
    },
    {}
> = createAsyncThunk(
    'dashboard/fetchItems',
    async ({
        folderId,
        page,
        limit,
        sort,
        order,
    }) => {
        const params = new URLSearchParams({
            page: (page || 1).toString(),
            limit: (limit || 12).toString(),
            sort: sort || 'name',
            order: order || 'asc',
        });

        if (folderId !== undefined) {
            params.append('folder_id', folderId || '');
        }

        const response = await fetch(`/api/dashboard/items?${params}`);
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard items');
        }

        const apiResponse: ApiResponse<PaginatedResponse<DashboardItem>> = await response.json();
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'Failed to fetch dashboard items');
        }

        return { data: apiResponse.data, folderId: folderId || null };
    }
);

export const createFolder: AsyncThunk<
    FolderItem,
    { name: string; parentId?: string },
    {}
> = createAsyncThunk(
    'dashboard/createFolder',
    async ({ name, parentId }) => {
        const response = await fetch('/api/folders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, parentId }),
        });

        if (!response.ok) {
            throw new Error('Failed to create folder');
        }

        const apiResponse: ApiResponse<FolderItem> = await response.json();
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'Failed to create folder');
        }

        return apiResponse.data;
    }
);

export const moveItem: AsyncThunk<
    { itemId: string; targetFolderId: string | null },
    { itemId: string; targetFolderId: string | null },
    {}
> = createAsyncThunk(
    'dashboard/moveItem',
    async ({ itemId, targetFolderId }) => {
        const response = await fetch(`/api/dashboard/move`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemId, targetFolderId }),
        });

        if (!response.ok) {
            throw new Error('Failed to move item');
        }

        const apiResponse: ApiResponse<any> = await response.json();
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'Failed to move item');
        }

        // API에서 data를 반환하지 않으므로 입력받은 값 그대로 반환
        return { itemId, targetFolderId };
    }
);

export const createDocument = createAsyncThunk<
    DocumentItem,
    { name: string; folderId?: string | null },
    {}
>(
    'dashboard/createDocument',
    async ({ name, folderId }) => {
        const response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                content: '',
                slideConfig: {},
                folderId: folderId || null,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create document');
        }

        const apiResponse: ApiResponse<DocumentItem> = await response.json();
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'Failed to create document');
        }

        return apiResponse.data;
    }
);

export const importDocument: AsyncThunk<
    DocumentItem,
    { file: File; folderId?: string | null },
    {}
> = createAsyncThunk(
    'dashboard/importDocument',
    async ({ file, folderId }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) {
            formData.append('folderId', folderId);
        }

        const response = await fetch('/api/documents/import', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to import document');
        }

        const apiResponse: ApiResponse<DocumentItem> = await response.json();
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'Failed to import document');
        }

        return apiResponse.data;
    }
);

export const deleteItem: AsyncThunk<
    string,
    { itemId: string; itemType: 'folder' | 'document' },
    {}
> = createAsyncThunk(
    'dashboard/deleteItem',
    async ({ itemId, itemType }) => {
        const endpoint = itemType === 'folder' ? '/api/folders' : '/api/documents';

        const response = await fetch(`${endpoint}/${itemId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }

        const apiResponse: ApiResponse<{ itemId: string }> = await response.json();
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'Failed to delete item');
        }

        return itemId;
    }
);

// Slice 생성
export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // 네비게이션
        setCurrentFolder: (state, action: PayloadAction<string | null>) => {
            state.currentFolderId = action.payload;
            state.currentPage = 1; // 첫 페이지로 리셋
        },

        // 현재 경로 업데이트
        updateCurrentPath: (state, action: PayloadAction<Folder[]>) => {
            state.currentPath = action.payload;
        },

        // 페이지네이션
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },

        // 정렬
        setSortOrder: (state, action: PayloadAction<{
            order: DashboardState['sortOrder'];
            direction: DashboardState['sortDirection'];
        }>) => {
            state.sortOrder = action.payload.order;
            state.sortDirection = action.payload.direction;
            state.currentPage = 1; // 첫 페이지로 리셋
            // 정렬 변경 시 pagination 정보 초기화
            state.totalItems = 0;
            state.totalPages = 1;
        },

        // 로딩 상태
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // 로컬 저장소에서 상태 복원
        restoreFromLocalStorage: (state) => {
            try {
                const savedItems = localStorage.getItem('dashboard_items');
                const savedState = localStorage.getItem('dashboard_state');

                if (savedItems) {
                    state.items = JSON.parse(savedItems);
                }

                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    Object.assign(state, parsedState);
                    // pagination 정보는 API에서 다시 받아오므로 초기화
                    state.totalItems = 0;
                    state.totalPages = 1;
                }
            } catch (error) {
                console.error('Failed to restore dashboard state:', error);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchDashboardItems
            .addCase(fetchDashboardItems.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardItems.fulfilled, (state, action) => {
                const { data, folderId } = action.payload;
                state.isLoading = false;
                state.currentFolderId = folderId;

                // 현재 폴더의 기존 아이템들을 삭제 (정렬/필터 변경 시 초기화)
                Object.keys(state.items).forEach(itemId => {
                    const item = state.items[itemId];
                    if (item.type === 'folder' && item.parentId === folderId) {
                        delete state.items[itemId];
                    } else if (item.type === 'document' && item.folderId === folderId) {
                        delete state.items[itemId];
                    }
                });

                // 새 아이템들을 items 객체에 추가
                if (data?.items) {
                    data.items.forEach((item) => {
                        state.items[item.id] = item;
                    });
                }

                // 페이지네이션 정보 업데이트
                if (data?.pagination) {
                    state.currentPage = data.pagination.page;
                    state.totalItems = data.pagination.total;
                    state.totalPages = data.pagination.totalPages;
                }
            })
            .addCase(fetchDashboardItems.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to load items';
            })

            // createFolder
            .addCase(createFolder.fulfilled, (state, action) => {
                const folder = action.payload;
                state.items[folder.id] = folder;

                // 부모 폴더에 자식 추가
                if (folder.parentId && state.items[folder.parentId]) {
                    const parent = state.items[folder.parentId] as FolderItem;
                    parent.childrenCount = (parent.childrenCount || 0) + 1;
                }
            })

            // moveItem
            .addCase(moveItem.fulfilled, (state, action) => {
                const { itemId, targetFolderId } = action.payload;
                const item = state.items[itemId];

                if (item) {
                    // 기존 부모에서 제거
                    if (item.type === 'folder' && item.parentId) {
                        const oldParent = state.items[item.parentId] as FolderItem;
                        oldParent.childrenCount = (oldParent.childrenCount || 1) - 1;
                    } else if (item.type === 'document' && item.folderId) {
                        // 기존 폴더에서 제거 (필요시 API 호출로 처리)
                    }

                    // 새 위치로 이동
                    if (item.type === 'folder') {
                        (item as FolderItem).parentId = targetFolderId;
                    } else {
                        (item as DocumentItem).folderId = targetFolderId;
                    }

                    // 새 부모에 추가
                    if (targetFolderId) {
                        const newParent = state.items[targetFolderId] as FolderItem;
                        newParent.childrenCount = (newParent.childrenCount || 0) + 1;
                    }

                    item.updatedAt = new Date();
                }
            })

            // createDocument
            .addCase(createDocument.fulfilled, (state, action) => {
                const document = action.payload;
                state.items[document.id] = document;

                // 폴더에 문서 추가
                if (document.folderId && state.items[document.folderId]) {
                    const folder = state.items[document.folderId] as FolderItem;
                    folder.childrenCount = (folder.childrenCount || 0) + 1;
                }
            })

            // importDocument
            .addCase(importDocument.fulfilled, (state, action) => {
                const document = action.payload;
                state.items[document.id] = document;

                // 폴더에 문서 추가
                if (document.folderId && state.items[document.folderId]) {
                    const folder = state.items[document.folderId] as FolderItem;
                    folder.childrenCount = (folder.childrenCount || 0) + 1;
                }
            })

            // deleteItem
            .addCase(deleteItem.fulfilled, (state, action) => {
                const itemId = action.payload;
                const item = state.items[itemId];

                // 백엔드에서 재귀적으로 삭제하므로 로컬에서는 해당 아이템만 제거
                if (item) {
                    // 부모 폴더의 childrenCount 업데이트
                    if (item.type === 'folder' && item.parentId) {
                        const parent = state.items[item.parentId] as FolderItem;
                        if (parent && parent.childrenCount !== undefined) {
                            parent.childrenCount = Math.max(0, parent.childrenCount - 1);
                        }
                    } else if (item.type === 'document' && item.folderId) {
                        const folder = state.items[item.folderId] as FolderItem;
                        if (folder && folder.childrenCount !== undefined) {
                            folder.childrenCount = Math.max(0, folder.childrenCount - 1);
                        }
                    }

                    // 아이템 삭제
                    delete state.items[itemId];
                }
            });
    },
});

// 액션 및 리듀서 내보내기
export const {
    setCurrentFolder,
    updateCurrentPath,
    setCurrentPage,
    setSortOrder,
    setLoading,
    setError,
    restoreFromLocalStorage,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;