import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('documentId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where = documentId ? { documentId } : {};

        // 이미지 목록 조회
        const images = await prisma.image.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
            select: {
                id: true,
                filename: true,
                originalName: true,
                url: true,
                size: true,
                mimeType: true,
                createdAt: true,
            },
        });

        // 전체 개수 조회
        const totalCount = await prisma.image.count({ where });
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            images,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error('이미지 목록 조회 오류:', error);
        return NextResponse.json(
            { error: '이미지 목록을 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
