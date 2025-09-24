import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'File is required' },
                { status: 400 }
            );
        }

        // 파일 확장자 검증
        const allowedExtensions = ['.md', '.marp'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!allowedExtensions.includes(fileExtension)) {
            return NextResponse.json(
                { success: false, message: 'Only .md and .marp files are supported' },
                { status: 400 }
            );
        }

        const content = await file.text();

        // 마크다운/Marp 파일 검증
        const isMarpFile = fileExtension === '.marp';
        if (isMarpFile && !content.includes('marp: true') && !content.includes('marp:')) {
            return NextResponse.json(
                { success: false, message: 'Marp files must contain valid marp configuration' },
                { status: 400 }
            );
        }

        // 제목 추출
        const title = extractTitle(content, file.name);

        // 설정 추출
        const slideConfig = extractSlideConfig(content);

        // 문서 생성
        const document = await prisma.document.create({
            data: {
                name: title,
                content,
                slideConfig,
                folderId: folderId || null,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: document.id,
                type: 'document',
                name: document.name,
                folderId: document.folderId,
                slideConfig: document.slideConfig,
                content: document.content,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                lastOpenedAt: document.lastOpenedAt,
            },
        });
    } catch (error) {
        console.error('Failed to import document:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to import document' },
            { status: 500 }
        );
    }
}

function extractTitle(content: string, fileName: string): string {
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
    if (headerMatch) {
        return headerMatch[1];
    }

    // 헤더도 없으면 파일명에서 확장자 제거
    return fileName.replace(/\.(md|marp)$/i, '');
}

function extractSlideConfig(content: string): any {
    const configMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (configMatch) {
        try {
            // YAML 파싱 시뮬레이션
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
