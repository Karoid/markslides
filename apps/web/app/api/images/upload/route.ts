import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { storageService } from '@/lib/storage';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        const documentId = formData.get('documentId') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: '이미지 파일이 필요합니다.' },
                { status: 400 }
            );
        }

        // 파일 크기 검증 (2MB 제한)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: '파일 크기는 2MB를 초과할 수 없습니다.' },
                { status: 400 }
            );
        }

        // 이미지 파일 타입 검증
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: '지원되지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP만 지원됩니다.' },
                { status: 400 }
            );
        }

        // 파일을 Buffer로 변환
        const buffer = Buffer.from(await file.arrayBuffer());

        // 스토리지에 파일 업로드
        const uploadResult = await storageService.uploadFile(
            buffer,
            file.name,
            file.type
        );

        // 데이터베이스에 이미지 정보 저장
        const image = await prisma.image.create({
            data: {
                filename: uploadResult.filename,
                originalName: file.name,
                mimeType: file.type,
                size: file.size,
                url: uploadResult.url,
                storageType: uploadResult.storageType,
                documentId: documentId || null,
            },
        });

        return NextResponse.json({
            id: image.id,
            url: image.url,
            filename: image.filename,
            originalName: image.originalName,
            size: image.size,
            mimeType: image.mimeType,
        });
    } catch (error) {
        console.error('이미지 업로드 오류:', error);
        return NextResponse.json(
            { error: '이미지 업로드 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('id');

        if (!imageId) {
            return NextResponse.json(
                { error: '이미지 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        // 데이터베이스에서 이미지 정보 조회
        const image = await prisma.image.findUnique({
            where: { id: imageId },
        });

        if (!image) {
            return NextResponse.json(
                { error: '이미지를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 스토리지에서 파일 삭제
        await storageService.deleteFile(image.filename, image.storageType);

        // 데이터베이스에서 이미지 정보 삭제
        await prisma.image.delete({
            where: { id: imageId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('이미지 삭제 오류:', error);
        return NextResponse.json(
            { error: '이미지 삭제 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
