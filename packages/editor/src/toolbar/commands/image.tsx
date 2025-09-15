import { ImageIcon } from 'lucide-react';
import type { ToolbarCommand } from '@/toolbar/types/toolbar';

const image: ToolbarCommand = {
    name: 'image',
    icon: <ImageIcon size={16} />,
    execute: (codeMirrorRef, onOpenImageDialog) => {
        // 이미지 다이얼로그 열기
        if (onOpenImageDialog) {
            onOpenImageDialog();
        }
    },
};

export default image;
