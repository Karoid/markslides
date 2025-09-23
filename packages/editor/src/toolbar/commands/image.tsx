import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { ImageIcon } from 'lucide-react';
import type { ToolbarCommand, ToolbarContext } from '@/toolbar/types/toolbar';

const image: ToolbarCommand = {
    name: 'image',
    icon: <ImageIcon size={16} />,
    tooltip: 'Upload Image',
    execute: (codeMirrorRef: ReactCodeMirrorRef, context?: ToolbarContext) => {
        // 이미지 다이얼로그 열기
        if (context?.openDialog) {
            context.openDialog('image');
        }
    },
};

export default image;
