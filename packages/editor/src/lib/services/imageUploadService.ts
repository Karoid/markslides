export interface ImageUploadResponse {
    id: string;
    url: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
}

export interface ImageUploadError {
    error: string;
}

export class ImageUploadService {
    private baseUrl: string;

    constructor(baseUrl = '/api/images') {
        this.baseUrl = baseUrl;
    }

    async uploadImage(
        file: File,
        documentId?: string
    ): Promise<ImageUploadResponse> {
        const formData = new FormData();
        formData.append('image', file);
        
        if (documentId) {
            formData.append('documentId', documentId);
        }

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData: ImageUploadError = await response.json();
            throw new Error(errorData.error || '이미지 업로드에 실패했습니다.');
        }

        return response.json();
    }

    async deleteImage(imageId: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/upload?id=${imageId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData: ImageUploadError = await response.json();
            throw new Error(errorData.error || '이미지 삭제에 실패했습니다.');
        }
    }

    generateMarkdownImage(url: string, alt: string = '', title?: string): string {
        const titleAttr = title ? ` "${title}"` : '';
        return `![${alt}](${url}${titleAttr})`;
    }
}

export const imageUploadService = new ImageUploadService();
