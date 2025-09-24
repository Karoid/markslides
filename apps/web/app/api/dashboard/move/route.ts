import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
    try {
        const { itemId, targetFolderId } = await request.json();

        if (!itemId) {
            return NextResponse.json(
                { success: false, message: 'Item ID is required' },
                { status: 400 }
            );
        }

        // 아이템 타입 확인 (폴더인지 문서인지)
        const [folder, document] = await Promise.all([
            prisma.folder.findUnique({ where: { id: itemId } }),
            prisma.document.findUnique({ where: { id: itemId } }),
        ]);

        if (!folder && !document) {
            return NextResponse.json(
                { success: false, message: 'Item not found' },
                { status: 404 }
            );
        }

        const isFolder = !!folder;

        // 자기 자신으로의 이동 방지 (폴더만 해당)
        if (isFolder && itemId === targetFolderId) {
            return NextResponse.json(
                { success: false, message: 'Cannot move folder to itself' },
                { status: 400 }
            );
        }

        // 순환 참조 검증 (폴더만 해당)
        if (isFolder && targetFolderId) {
            await validateHierarchy(targetFolderId, itemId);
        }

        // 이동 실행
        if (isFolder) {
            await prisma.folder.update({
                where: { id: itemId },
                data: {
                    parentId: targetFolderId || null,
                    updatedAt: new Date(),
                },
            });
        } else {
            await prisma.document.update({
                where: { id: itemId },
                data: {
                    folderId: targetFolderId || null,
                    updatedAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Item moved successfully',
        });
    } catch (error) {
        console.error('Failed to move item:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to move item' },
            { status: 500 }
        );
    }
}

async function validateHierarchy(parentId: string, excludeId?: string): Promise<void> {
    const ancestors = await getAncestorIds(parentId);
    if (ancestors.includes(excludeId)) {
        throw new Error('Circular reference detected');
    }
}

async function getAncestorIds(folderId: string): Promise<string[]> {
    const ancestors: string[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
        const folder = await prisma.folder.findUnique({
            where: { id: currentId },
            select: { parentId: true },
        });

        if (folder?.parentId) {
            ancestors.push(folder.parentId);
            currentId = folder.parentId;
        } else {
            break;
        }
    }

    return ancestors;
}
