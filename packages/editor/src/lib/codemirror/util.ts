import { EditorState } from '@codemirror/state';

const codemirrorUtil = {
    getCurrentSelectionStr: (state: EditorState) => {
        const { from, to } = state.selection.main;
        return state.sliceDoc(from, to);
    },
    getCurrentCursorPosition: (state: EditorState) => {
        return state.selection.main.head;
    },
    getCurrentLineNumber: (state: EditorState) => {
        return state.doc.lineAt(state.selection.main.head).number;
    },
    getLineFromSlideIndex: (state: EditorState, slideIndex: number) => {
        let lineNum = 1;
        let slideCount = 1;

        const iterLine = state.doc.iterLines();
        while (!iterLine.done && lineNum < state.doc.lines) {
            if (iterLine.value === '---') {
                slideCount++;
            }
            lineNum++;

            if (slideCount === slideIndex + 1) {
                break;
            }

            iterLine.next();
        }

        const line = state.doc.line(lineNum);
        return line;
    },
    getPageInfo: (state: EditorState) => {
        const currentLineNumber = state.doc.lineAt(
            state.selection.main.head
        ).number;

        let lineNum = 1;
        let totalPageCount = 1;
        let currentPageNumber = 1;
        const iterLine = state.doc.iterLines();
        while (!iterLine.done) {
            if (iterLine.value === '---') {
                totalPageCount++;
            }

            if (lineNum === currentLineNumber) {
                currentPageNumber = totalPageCount;
            }
            lineNum++;

            iterLine.next();
        }

        return { currentPageNumber, totalPageCount };
    },
};

export default codemirrorUtil;
