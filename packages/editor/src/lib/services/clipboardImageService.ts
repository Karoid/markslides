import { imageUploadService } from './imageUploadService';
import { generateMarpitImageMarkdown } from '@/lib/types/imageSettings';
import type { ImageSettings } from '@/lib/types/imageSettings';

export interface ClipboardImageUploadResponse {
    success: boolean;
    markdown?: string;
    error?: string;
}

export class ClipboardImageService {
    async uploadClipboardImage(
        file: File,
        documentId?: string,
        imageSettings?: ImageSettings
    ): Promise<ClipboardImageUploadResponse> {
        try {
            // 이미지 업로드
            const uploadResult = await imageUploadService.uploadImage(file, documentId);
            
            // 마크다운 생성
            const markdown = generateMarpitImageMarkdown(
                uploadResult.url,
                imageSettings || {
                    alt: uploadResult.originalName,
                    title: uploadResult.originalName,
                }
            );

            return {
                success: true,
                markdown,
            };
        } catch (error) {
            console.error('클립보드 이미지 업로드 실패:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.',
            };
        }
    }

    // 클립보드에서 이미지 파일 생성
    createImageFileFromClipboard(
        clipboardItem: DataTransferItem,
        filename?: string
    ): File | null {
        const file = clipboardItem.getAsFile();
        if (!file) {
            return null;
        }

        // 파일명이 없으면 기본값 사용
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = file.type.split('/')[1] || 'png';
            filename = `clipboard-${timestamp}.${extension}`;
        }

        // 새로운 File 객체 생성 (파일명 변경)
        return new File([file], filename, { type: file.type });
    }

    // 클립보드에 이미지가 있는지 확인
    hasImageInClipboard(clipboardData: DataTransfer): boolean {
        const items = Array.from(clipboardData.items);
        return items.some(item => item.type.startsWith('image/'));
    }

    // 지원되는 이미지 타입인지 확인
    isSupportedImageType(mimeType: string): boolean {
        const supportedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        return supportedTypes.includes(mimeType);
    }
}

export const clipboardImageService = new ClipboardImageService();
