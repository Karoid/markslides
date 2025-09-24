import { EditorView, ViewUpdate } from '@codemirror/view';
import { Text } from '@codemirror/state';
import codemirrorUtil from '@/lib/codemirror/util';
import type { SlideInfo } from '@/lib/types/common';

export function getSlideInfoFromText(doc: Text, currentLineNumber: number): SlideInfo {
    let lineNum = 1;
    let totalPageCount = 1;
    let currentPageNumber = 1;
    let slideTitle: string | undefined = '';
    let pageTitleArray: (string | undefined)[] = [];
    let isSearchTitleMode = true;

    const iterLine = doc.iterLines();
    while (!iterLine.done) {
        if (iterLine.value === '---') {
            // Handle no slide title case
            if (totalPageCount > 1 && isSearchTitleMode) {
                pageTitleArray.push('');
            }

            totalPageCount++;
            isSearchTitleMode = true;
        }

        if (isSearchTitleMode && iterLine.value && iterLine.value.startsWith('#')) {
            isSearchTitleMode = false;
            const parsedTitle = iterLine.value.split(/# /);
            if (parsedTitle.length > 1) {
                if (totalPageCount === 1) {
                    slideTitle = parsedTitle[1];
                }
                pageTitleArray.push(parsedTitle[1]);
            }
        }

        if (lineNum === currentLineNumber) {
            currentPageNumber = totalPageCount;
        }
        lineNum++;

        iterLine.next();
    }

    return {
        slideTitle,
        currentPageTitle: pageTitleArray[currentPageNumber - 1],
        currentPageNumber,
        totalPageCount,
    };
}

export function getSlideInfoFromString(content: string, currentLineNumber: number): SlideInfo {
    let lineNum = 1;
    let totalPageCount = 1;
    let currentPageNumber = 1;
    let slideTitle: string | undefined = '';
    let pageTitleArray: (string | undefined)[] = [];
    let isSearchTitleMode = true;

    const lines = content.split('\n');
    for (const line of lines) {
        if (line === '---') {
            // Handle no slide title case
            if (totalPageCount > 1 && isSearchTitleMode) {
                pageTitleArray.push('');
            }

            totalPageCount++;
            isSearchTitleMode = true;
        }

        if (isSearchTitleMode && line && line.startsWith('#')) {
            isSearchTitleMode = false;
            const parsedTitle = line.split(/# /);
            if (parsedTitle.length > 1) {
                if (totalPageCount === 1) {
                    slideTitle = parsedTitle[1];
                }
                pageTitleArray.push(parsedTitle[1]);
            }
        }

        if (lineNum === currentLineNumber) {
            currentPageNumber = totalPageCount;
        }
        lineNum++;
    }

    return {
        slideTitle,
        currentPageTitle: pageTitleArray[currentPageNumber - 1],
        currentPageNumber,
        totalPageCount,
    };
}

// For backward compatibility
export function getSlideInfoFromDoc(doc: Text | string, currentLineNumber: number): SlideInfo {
    if (typeof doc === 'string') {
        return getSlideInfoFromString(doc, currentLineNumber);
    } else {
        return getSlideInfoFromText(doc, currentLineNumber);
    }
}

function slideInfoExtension(callback: (slideInfo: SlideInfo) => void) {
    let lastSlideInfo: SlideInfo | null = null;

    return EditorView.updateListener.of((update: ViewUpdate) => {
        // Only process updates when document changes
        if (!update.docChanged) {
            return;
        }

        const { state } = update;
        const currentLineNumber = codemirrorUtil.getCurrentLineNumber(state);
        const newPageInfo = getSlideInfoFromDoc(state.doc, currentLineNumber);

        // Only call callback if slide info actually changed
        if (
            !lastSlideInfo ||
            lastSlideInfo.currentPageNumber !== newPageInfo.currentPageNumber ||
            lastSlideInfo.totalPageCount !== newPageInfo.totalPageCount ||
            lastSlideInfo.slideTitle !== newPageInfo.slideTitle ||
            lastSlideInfo.currentPageTitle !== newPageInfo.currentPageTitle
        ) {
            lastSlideInfo = newPageInfo;
            callback(newPageInfo);
        }
    });
}

export default slideInfoExtension;
