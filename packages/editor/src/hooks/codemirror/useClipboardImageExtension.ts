import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

interface ClipboardImageOptions {
    onImagePaste: (file: File, position: number) => Promise<void>;
    maxFileSize?: number;
    allowedTypes?: string[];
}

export default function useClipboardImageExtension(
    options: ClipboardImageOptions
): Extension {
    const {
        onImagePaste,
        maxFileSize = 2 * 1024 * 1024, // 2MB
        allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    } = options;

    const pasteHandler = EditorView.domEventHandlers({
        paste(event, view) {
            const clipboardData = event.clipboardData;
            if (!clipboardData) {
                return false;
            }

            const items = Array.from(clipboardData.items);
            const imageItems = items.filter(item => 
                item.type.startsWith('image/') && 
                allowedTypes.includes(item.type)
            );

            if (imageItems.length === 0) {
                return false;
            }

            // 기본 붙여넣기 동작 방지
            event.preventDefault();

            // 커서 위치 가져오기
            const pos = view.state.selection.main.from;

            // 각 이미지 처리
            imageItems.forEach(async (item) => {
                const file = item.getAsFile();
                if (!file) {
                    return;
                }

                // 파일 크기 검증
                if (file.size > maxFileSize) {
                    console.warn(`이미지 파일이 너무 큽니다. 최대 크기: ${maxFileSize / 1024 / 1024}MB`);
                    return;
                }

                try {
                    await onImagePaste(file, pos);
                } catch (error) {
                    console.error('이미지 붙여넣기 오류:', error);
                }
            });

            return true;
        },
    });

    const theme = EditorView.theme({
        '.cm-editor': {
            '&.cm-focused': {
                outline: 'none',
            },
        },
    });

    return [pasteHandler, theme];
}
