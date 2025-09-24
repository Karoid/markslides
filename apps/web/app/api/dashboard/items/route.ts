import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Folder, Document } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folder_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 12;
        const sort = searchParams.get('sort') || 'name';
        const order = searchParams.get('order') || 'asc';

        const totalOffset = (page - 1) * limit;

        // 1. 폴더와 문서의 총 개수를 가져옴 (COUNT 쿼리)
        const [folderCount, documentCount] = await Promise.all([
            prisma.folder.count({
                where: folderId ? { parentId: folderId } : { parentId: null },
            }),
            prisma.document.count({
                where: folderId ? { folderId } : { folderId: null },
            }),
        ]);

        const total = folderCount + documentCount;
        const totalPages = Math.ceil(total / limit);

        // 2. 각 폴더의 children 개수를 계산 (현재 폴더에 있는 서브폴더 + 문서 개수)
        const folderChildrenCounts: Record<string, number> = {};
        let folders: Folder[] = [];
        let documents: Document[] = [];

        // 2. totalOffset에 따라 가져올 폴더와 문서 개수 계산
        if (totalOffset < folderCount) {
            // 폴더 범위 내에 있음
            const folderOffset = totalOffset;
            const folderLimit = Math.min(limit, folderCount - folderOffset);
            const remainingLimit = limit - folderLimit;

            // 폴더 가져오기
            folders = await prisma.folder.findMany({
                where: folderId ? { parentId: folderId } : { parentId: null },
                orderBy: getOrderBy(sort, order),
                skip: folderOffset,
                take: folderLimit,
            });
            if (folders.length > 0) {
                const folderIds = folders.map(f => f.id);
                for (const fid of folderIds) {
                    const [subFolderCount, docCount] = await Promise.all([
                        prisma.folder.count({ where: { parentId: fid } }),
                        prisma.document.count({ where: { folderId: fid } }),
                    ]);
                    folderChildrenCounts[fid] = subFolderCount + docCount;
                }
            }    

            // 남은 limit만큼 문서 가져오기
            if (remainingLimit > 0) {
                documents = await prisma.document.findMany({
                    where: folderId ? { folderId } : { folderId: null },
                    orderBy: getOrderBy(sort, order),
                    skip: 0,
                    take: remainingLimit,
                });
            }
        } else {
            // 문서 범위 내에 있음
            const documentOffset = totalOffset - folderCount;
            const documentLimit = Math.min(limit, documentCount - documentOffset);

            // 문서만 가져오기
            documents = await prisma.document.findMany({
                where: folderId ? { folderId } : { folderId: null },
                orderBy: getOrderBy(sort, order),
                skip: documentOffset,
                take: documentLimit,
            });
        }

        // 3. 응답 데이터 구성 (이미 정렬되어 있으므로 클라이언트 정렬 불필요)
        const items = [
            ...folders.map(folder => ({
                id: folder.id,
                type: 'folder' as const,
                name: folder.name,
                parentId: folder.parentId,
                childrenCount: folderChildrenCounts[folder.id] || 0, // 실제 아이템 개수
                createdAt: folder.createdAt,
                updatedAt: folder.updatedAt,
            })),
            ...documents.map(doc => ({
                id: doc.id,
                type: 'document' as const,
                name: doc.name,
                folderId: doc.folderId,
                slideConfig: doc.slideConfig,
                content: doc.content,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                lastOpenedAt: doc.lastOpenedAt,
            })),
        ];

        return NextResponse.json({
            success: true,
            data: {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            },
        });
    } catch (error) {
        console.error('Failed to fetch dashboard items:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch dashboard items' },
            { status: 500 }
        );
    }
}

function getOrderBy(sort: string, order: string) {
    const validSortFields = ['name', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';

    return {
        [sortField]: order === 'desc' ? 'desc' : 'asc',
    };
}
