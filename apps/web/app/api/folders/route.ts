import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { name, parentId } = await request.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Folder name is required' },
                { status: 400 }
            );
        }

        // 계층적 구조 검증 (순환 참조 방지)
        if (parentId) {
            await validateHierarchy(parentId);
        }

        const folder = await prisma.folder.create({
            data: {
                name: name.trim(),
                parentId,
            },
        });

        return NextResponse.json({
            success: true,
            data: folder,
        });
    } catch (error) {
        console.error('Failed to create folder:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create folder' },
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
