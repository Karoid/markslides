import { EditorView, ViewUpdate } from '@codemirror/view';
import codemirrorUtil from '@/lib/codemirror/util';
import { getSlideInfoFromDoc } from '@/lib/codemirror/slideInfoExtension';
import type { CursorContext } from '@/lib/types/common';
import type { SlideInfo } from '@/lib/types/common';

function cursorContextExtension(
    callback: (cursorContext: CursorContext) => void,
    onSlideInfoChange?: (slideInfo: SlideInfo) => void
) {
    let lastCurrentPageNumber = 1;

    return EditorView.updateListener.of((update: ViewUpdate) => {
        const { state } = update;

        const cursorPosition = codemirrorUtil.getCurrentCursorPosition(state);
        const lineNumber = codemirrorUtil.getCurrentLineNumber(state);
        const selectionStr = codemirrorUtil.getCurrentSelectionStr(state);

        callback({ cursorPosition, lineNumber, selectionStr });

        // Calculate slide info for cursor sync (only current page number for performance)
        if (onSlideInfoChange) {
            const slideInfo = getSlideInfoFromDoc(state.doc, lineNumber);
            if (slideInfo.currentPageNumber !== lastCurrentPageNumber) {
                lastCurrentPageNumber = slideInfo.currentPageNumber;
                onSlideInfoChange(slideInfo);
            }
        }
    });
}

export default cursorContextExtension;
