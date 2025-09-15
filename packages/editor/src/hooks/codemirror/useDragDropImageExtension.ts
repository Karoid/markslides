import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

interface ImageUploadOptions {
    onImageDrop: (file: File, position: number) => Promise<void>;
    maxFileSize?: number;
    allowedTypes?: string[];
}

export default function useDragDropImageExtension(
    options: ImageUploadOptions
): Extension {
    const {
        onImageDrop,
        maxFileSize = 2 * 1024 * 1024, // 2MB
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    } = options;

    const dropHandler = EditorView.domEventHandlers({
        dragover(event, view) {
            // 드래그 오버 시 기본 동작 방지
            event.preventDefault();
            event.dataTransfer!.dropEffect = 'copy';
            
            // 드래그 오버 시각적 피드백 추가
            view.dom.classList.add('cm-drag-over');
        },

        dragleave(event, view) {
            // 드래그가 에디터를 벗어날 때 시각적 피드백 제거
            const rect = view.dom.getBoundingClientRect();
            const { clientX, clientY } = event;
            
            if (
                clientX < rect.left ||
                clientX > rect.right ||
                clientY < rect.top ||
                clientY > rect.bottom
            ) {
                view.dom.classList.remove('cm-drag-over');
            }
        },

        async drop(event, view) {
            event.preventDefault();
            view.dom.classList.remove('cm-drag-over');

            const files = Array.from(event.dataTransfer?.files || []);
            const imageFiles = files.filter(file => 
                allowedTypes.includes(file.type)
            );

            if (imageFiles.length === 0) {
                return;
            }

            // 드롭 위치 계산
            const pos = view.posAtCoords({
                x: event.clientX,
                y: event.clientY,
            });

            if (pos === null) {
                return;
            }

            // 각 이미지 파일 처리
            for (const file of imageFiles) {
                if (file.size > maxFileSize) {
                    console.warn(`파일 ${file.name}이 너무 큽니다. 최대 크기: ${maxFileSize / 1024 / 1024}MB`);
                    continue;
                }

                try {
                    await onImageDrop(file, pos);
                } catch (error) {
                    console.error('이미지 업로드 오류:', error);
                }
            }
        },
    });

    const theme = EditorView.theme({
        '.cm-drag-over': {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed #3b82f6',
            borderRadius: '4px',
        },
        '.cm-image-uploading': {
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid #f97316',
            borderRadius: '2px',
            padding: '2px 4px',
            fontSize: '0.875em',
            color: '#f97316',
        },
    });

    return [dropHandler, theme];
}
