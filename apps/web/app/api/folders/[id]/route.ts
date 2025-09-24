import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { name, parentId } = await request.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Folder name is required' },
                { status: 400 }
            );
        }

        // 자기 자신으로의 이동 방지
        if (id === parentId) {
            return NextResponse.json(
                { success: false, message: 'Cannot move folder to itself' },
                { status: 400 }
            );
        }

        // 순환 참조 검증
        if (parentId) {
            await validateHierarchy(parentId, id);
        }

        const folder = await prisma.folder.update({
            where: { id },
            data: {
                name: name.trim(),
                parentId,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            data: folder,
        });
    } catch (error) {
        console.error('Failed to update folder:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update folder' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // 폴더와 모든 자식 항목들을 재귀적으로 삭제
        await deleteFolderRecursively(id);

        return NextResponse.json({
            success: true,
            message: 'Folder deleted successfully',
        });
    } catch (error) {
        console.error('Failed to delete folder:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete folder' },
            { status: 500 }
        );
    }
}

async function deleteFolderRecursively(folderId: string): Promise<void> {
    // 자식 폴더들을 먼저 찾기
    const childFolders = await prisma.folder.findMany({
        where: { parentId: folderId },
        select: { id: true },
    });

    // 자식 폴더들을 재귀적으로 삭제
    for (const childFolder of childFolders) {
        await deleteFolderRecursively(childFolder.id);
    }

    // 현재 폴더 삭제 (연관된 문서들은 CASCADE로 자동 삭제)
    await prisma.folder.delete({
        where: { id: folderId },
    });
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
