'use client';

import {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
    forwardRef,
    ForwardedRef,
} from 'react';
import styled from 'styled-components';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { history as historyExtension } from '@codemirror/commands';
import { lintGutter } from '@codemirror/lint';
import { parseMixed } from '@lezer/common';
import ReactCodeMirror, {
    type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { color as colorPickerExtension } from '@uiw/codemirror-extensions-color';
import { githubLight } from '@uiw/codemirror-themes-all';
import type { SlideConfigState } from '@markslides/renderer';
import useBottomPanelExtension from '@/hooks/codemirror/useBottomPanelExtension';
import useDragDropImageExtension from '@/hooks/codemirror/useDragDropImageExtension';
import useClipboardImageExtension from '@/hooks/codemirror/useClipboardImageExtension';
import PreviewFragment from '@/components/fragments/PreviewFragment';
import EditorToolbar, {
    type EditorToolbarProps,
} from '@/components/editor/EditorToolbar';
import CurrentPageSyncButton from '@/components/editor/CurrentPageSyncButton';
import shortcutExtension from '@/lib/codemirror/shortcutExtension';
import dividerHighlightExtension from '@/lib/codemirror/dividerHighlightExtension';
import lintExtension from '@/lib/codemirror/lintExtension';
import slideInfoExtension from '@/lib/codemirror/slideInfoExtension';
import cursorContextExtension from '@/lib/codemirror/cursorContextExtension';
import overwriteModeExtension from '@/lib/codemirror/overwriteModeExtension';
import defaultToolbarCommands from '@/toolbar/commands';
import codemirrorUtil from '@/lib/codemirror/util';
import type { SlideInfo } from '@/lib/types/common';
import { imageUploadService } from '@/lib/services/imageUploadService';
import { clipboardImageService } from '@/lib/services/clipboardImageService';
import { DEFAULT_IMAGE_SETTINGS } from '@/lib/types/imageSettings';

const extendedMarkdownLanguage = markdown({
    base: markdownLanguage,
    codeLanguages: languages,
    extensions: {
        wrap: parseMixed((node) => {
            if (node.name === 'HTMLBlock') {
                return {
                    parser: langs.css().language.parser,
                };
            }
            return null;
        }),
    },
});

const pageDividerTheme = EditorView.baseTheme({
    '&dark .cm-page-divider': {
        backgroundColor: '#FFFFFF44',
        fontWeight: 'bold',
    },
    '&light .cm-page-divider': {
        backgroundColor: '#00000033',
        fontWeight: 'bold',
    },
});

const Wrapper = styled.div<{ $height: number | string }>`
    height: ${({ $height }) => $height};
    display: flex;
    flex-direction: column;
`;

const EditorContainer = styled.div`
    height: calc(100% - 32px);
    display: flex;
    flex-direction: row;
    align-items: stretch;
    position: relative;
`;

const PreviewContainer = styled.div`
    flex: 1;
    overflow-y: scroll;
`;

const VerticalDivider = styled.div`
    width: 1px;
    height: 100%;
    background-color: #dddddd;
`;

const styleTheme = EditorView.baseTheme({
    '&.cm-editor.cm-focused': {
        outline: 'none',
    },
});

const overwriteCursorTheme = EditorView.baseTheme({
    '&.cm-editor .cm-cursor': {
        borderLeft: 'none',
        borderBottom: '2px solid',
        width: '0.6em',
        marginLeft: '0',
    },
    '&.cm-editor.cm-focused .cm-cursor': {
        borderLeft: 'none',
        borderBottom: '2px solid',
        width: '0.6em',
        marginLeft: '0',
    },
});

export interface MarkSlidesEditorRef extends ReactCodeMirrorRef {}

interface MarkSlidesEditorProps
    extends Pick<
            ReactCodeMirrorProps,
            'placeholder' | 'extensions' | 'readOnly' | 'value' | 'onChange'
        >,
        Partial<Pick<EditorToolbarProps, 'toolbarCommands'>> {
    height?: number | string;
    config?: SlideConfigState;
    isShowSyncCurrentPageToggle?: boolean;
    isFixScrollToBottom?: boolean;
    slideInfo: SlideInfo;
    onChangeSlideInfo: (newSlideInfo: SlideInfo) => void;
    documentId?: string; // 이미지 업로드 시 사용할 문서 ID
}

const DEFAULT_SLIDE_CONFIG: SlideConfigState = {
    header: '',
    footer: '',
    paginate: true,
    theme: 'default',
    class: 'normal',
    size: '16:9',
};

function MarkSlidesEditor(
    props: MarkSlidesEditorProps,
    ref: ForwardedRef<MarkSlidesEditorRef>
) {
    const {
        toolbarCommands = defaultToolbarCommands,
        height = '100vh',
        config = DEFAULT_SLIDE_CONFIG,
        isShowSyncCurrentPageToggle = true,
        isFixScrollToBottom = false,
        isOverwriteMode = false,
        onChangeSlideInfo,
        documentId,
        placeholder,
        extensions: externalExtensions = [],
        readOnly,
        value,
        onChange,
    } = props;

    const codeMirrorRef = useRef<ReactCodeMirrorRef | null>(null);
    // const editorViewRef = useRef<EditorView | null>(null);
    // const editorStateRef = useRef<EditorState | null>(null);

    const previewContainerRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<PreviewFragmentRef>(null);

    const [isSyncCurrentPage, setIsSyncCurrentPage] = useState(
        isShowSyncCurrentPageToggle
    );

    useEffect(() => {
        if (isFixScrollToBottom && value) {
            const view = codeMirrorRef.current?.view;
            if (view) {
                view.scrollDOM.scrollTo({
                    top: view.scrollDOM.scrollHeight,
                    behavior: 'instant',
                });

                view.dispatch({
                    selection: {
                        anchor: value.length,
                        head: value.length,
                    },
                });
            }

            if (previewContainerRef.current) {
                previewContainerRef.current.scrollTo({
                    top: previewContainerRef.current.scrollHeight,
                    behavior: 'instant',
                });
            }
        }
    }, [value]);

    const handleChangeCursorPosition = useCallback(
        (newCursorPosition: number) => {
            setCurrentCursorPosition(newCursorPosition);
        },
        []
    );

    const handleChangeLineNumber = useCallback((newLineNumber: number) => {
        setCurrentLineNumber(newLineNumber);
    }, []);

    const handleChangeSelectionStr = useCallback((newSelection: string) => {
        setCurrentSelection(newSelection);
    }, []);

    const handleImageDrop = useCallback(
        async (file: File, position: number) => {
            if (!codeMirrorRef.current || !onChange) {
                return;
            }

            const view = codeMirrorRef.current.view;
            if (!view) {
                return;
            }

            try {
                // 업로드 중 표시를 위한 임시 텍스트 삽입
                const uploadingText = `![업로드 중... ${file.name}](uploading...)`;
                
                view.dispatch({
                    changes: {
                        from: position,
                        to: position,
                        insert: uploadingText,
                    },
                    selection: {
                        anchor: position + uploadingText.length,
                        head: position + uploadingText.length,
                    },
                });

                // 이미지 업로드
                const uploadResult = await imageUploadService.uploadImage(
                    file,
                    documentId
                );

                // 마크다운 이미지 문법 생성
                const imageMarkdown = imageUploadService.generateMarkdownImage(
                    uploadResult.url,
                    uploadResult.originalName,
                    uploadResult.originalName
                );

                // 현재 에디터의 내용에서 임시 텍스트를 실제 이미지 마크다운으로 교체
                const currentContent = view.state.doc.toString();
                const uploadingTextStart = currentContent.indexOf(uploadingText);
                
                if (uploadingTextStart !== -1) {
                    view.dispatch({
                        changes: {
                            from: uploadingTextStart,
                            to: uploadingTextStart + uploadingText.length,
                            insert: imageMarkdown,
                        },
                    });
                }
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                
                // 오류 발생 시 임시 텍스트 제거
                const currentContent = view.state.doc.toString();
                const uploadingTextForError = `![업로드 중... ${file.name}](uploading...)`;
                const uploadingTextStart = currentContent.indexOf(uploadingTextForError);
                
                if (uploadingTextStart !== -1) {
                    view.dispatch({
                        changes: {
                            from: uploadingTextStart,
                            to: uploadingTextStart + uploadingTextForError.length,
                            insert: '',
                        },
                    });
                }
                
                // 사용자에게 오류 알림 (선택적으로 toast 등 사용)
                alert(`이미지 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            }
        },
        [documentId, onChange]
    );

    const handleClipboardImagePaste = useCallback(
        async (file: File, position: number) => {
            if (!codeMirrorRef.current || !onChange) {
                return;
            }

            const view = codeMirrorRef.current.view;
            if (!view) {
                return;
            }

            try {
                // 업로드 중 표시를 위한 임시 텍스트 삽입
                const uploadingText = `![붙여넣는 중... ${file.name}](uploading...)`;
                
                view.dispatch({
                    changes: {
                        from: position,
                        to: position,
                        insert: uploadingText,
                    },
                    selection: {
                        anchor: position + uploadingText.length,
                        head: position + uploadingText.length,
                    },
                });

                // 클립보드 이미지 업로드
                const result = await clipboardImageService.uploadClipboardImage(
                    file,
                    documentId,
                    DEFAULT_IMAGE_SETTINGS
                );

                if (result.success && result.markdown) {
                    // 현재 에디터의 내용에서 임시 텍스트를 실제 이미지 마크다운으로 교체
                    const currentContent = view.state.doc.toString();
                    const uploadingTextStart = currentContent.indexOf(uploadingText);
                    
                    if (uploadingTextStart !== -1) {
                        view.dispatch({
                            changes: {
                                from: uploadingTextStart,
                                to: uploadingTextStart + uploadingText.length,
                                insert: result.markdown,
                            },
                        });
                    }
                } else {
                    // 오류 발생 시 임시 텍스트 제거
                    const currentContent = view.state.doc.toString();
                    const uploadingTextStart = currentContent.indexOf(uploadingText);
                    
                    if (uploadingTextStart !== -1) {
                        view.dispatch({
                            changes: {
                                from: uploadingTextStart,
                                to: uploadingTextStart + uploadingText.length,
                                insert: '',
                            },
                        });
                    }
                    
                    console.error('클립보드 이미지 업로드 실패:', result.error);
                }
            } catch (error) {
                console.error('클립보드 이미지 붙여넣기 오류:', error);
                
                // 오류 발생 시 임시 텍스트 제거
                const currentContent = view.state.doc.toString();
                const uploadingTextForError = `![붙여넣는 중... ${file.name}](uploading...)`;
                const uploadingTextStart = currentContent.indexOf(uploadingTextForError);
                
                if (uploadingTextStart !== -1) {
                    view.dispatch({
                        changes: {
                            from: uploadingTextStart,
                            to: uploadingTextStart + uploadingTextForError.length,
                            insert: '',
                        },
                    });
                }
            }
        },
        [documentId, onChange]
    );

    const syncCurrentCursorPositionExtension =
        useSyncCurrentCursorPositionExtension(handleChangeCursorPosition);
    const syncCurrentLineNumberExtension = useSyncCurrentLineNumberExtension(
        handleChangeLineNumber
    );
    const syncCurrentSelectionExtension = useSyncCurrentSelectionExtension(
        handleChangeSelectionStr
    );
    const syncSlideInfoExtension = useSyncSlideInfoExtension(
        slideInfo,
        onChangeSlideInfo
    );
    const bottomPanelExtension = useBottomPanelExtension(
        slideInfo.currentSlideNumber,
        slideInfo.totalSlideCount
    );
    const dragDropImageExtension = useDragDropImageExtension({
        onImageDrop: handleImageDrop,
    });
    const clipboardImageExtension = useClipboardImageExtension({
        onImagePaste: handleClipboardImagePaste,
    });
=======
    const bottomPanelExtension = useBottomPanelExtension();
>>>>>>> upstream/main

    const extensions = useMemo(() => {
        let _extensions = [
            historyExtension(),
            styleTheme,
            ...(isOverwriteMode ? [overwriteCursorTheme] : []),
            shortcutExtension,
            colorPickerExtension,
            dividerHighlightExtension,
            lintExtension,
            // lintGutter(),
            extendedMarkdownLanguage,
            EditorView.lineWrapping,
            // cursorContextExtension((cursorContext) => {
            //     const { cursorPosition, lineNumber, selectionStr } =
            //         cursorContext;

            //     // NOTE: Add something to use these values
            // }),
            slideInfoExtension((slideInfo) => {
                if (previewRef.current) {
                    previewRef.current.setCurrentPage(
                        slideInfo.currentPageNumber,
                        isSyncCurrentPage
                    );
                }

                if (!!onChangeSlideInfo) {
                    onChangeSlideInfo(slideInfo);
                }
            }),
            bottomPanelExtension,
            dragDropImageExtension,
            clipboardImageExtension,
            ...externalExtensions,
        ];

        if (isOverwriteMode) {
            _extensions.push(overwriteModeExtension);
        }

        return _extensions;
    }, [
        isOverwriteMode,
        bottomPanelExtension,
        dragDropImageExtension,
        clipboardImageExtension,
        externalExtensions,
        overwriteModeExtension,
    ]);

    const handleClickSlide = useCallback(
        (slide: Element, index: number) => {
            if (!codeMirrorRef.current) {
                return;
            }

            const { view } = codeMirrorRef.current;
            if (!view) {
                return;
            }
            // NOTE: Do not use codeMirrorRef.current.state, because it doesn't updated in correctly
            const state = view.state;

            const line = codemirrorUtil.getLineFromSlideIndex(state, index);

            view.dispatch({
                selection: { head: line.from, anchor: line.from },
                // scrollIntoView: true,
            });
            view.focus();

            const lineBlockAt = view.lineBlockAt(line.from);
            if (lineBlockAt) {
                const scroller = view.scrollDOM.getBoundingClientRect();
                const middle = lineBlockAt.top - scroller.height / 2;

                view.scrollDOM.scrollTo({
                    top: middle,
                    behavior: 'smooth',
                });
            }
        },
        [codeMirrorRef.current]
    );

    const handleClickSyncCurrentPage = useCallback(() => {
        setIsSyncCurrentPage((prevIsSyncCurrentPage) => {
            return !prevIsSyncCurrentPage;
        });
    }, [isSyncCurrentPage]);

    const reactCodeMirrorCallbackRef = useCallback(
        (_ref: ReactCodeMirrorRef | null) => {
            if (ref && typeof ref === 'function') {
                ref(_ref);
            } else if (ref && typeof ref === 'object') {
                ref.current = _ref;
            }

            codeMirrorRef.current = _ref as ReactCodeMirrorRef;
        },
        [ref]
    );

    return (
        <Wrapper $height={height}>
            <EditorToolbar
                toolbarCommands={toolbarCommands}
                codeMirrorRef={codeMirrorRef.current}
                documentId={documentId}
            />

            <EditorContainer>
                <ReactCodeMirror
                    ref={reactCodeMirrorCallbackRef}
                    height='100%'
                    style={{
                        flex: '1',
                    }}
                    theme={[githubLight, pageDividerTheme]}
                    placeholder={placeholder}
                    extensions={extensions}
                    // onCreateEditor={(view: EditorView, state: EditorState) => {
                    //     editorViewRef.current = view;
                    //     editorStateRef.current = state;
                    // }}
                    readOnly={readOnly}
                    value={value}
                    onChange={onChange}
                    // TODO: Use this to update value
                    // onUpdate={(update) => {
                    //     // console.log('onUpdate', update);

                    //     if (onChange) {
                    //         onChange(update.state.doc.toString(), update);
                    //     }
                    // }}
                />

                <VerticalDivider />

                <PreviewContainer ref={previewContainerRef}>
                    <PreviewFragment
                        ref={previewRef}
                        config={config}
                        content={value ?? ''}
                        onClickSlide={handleClickSlide}
                    />
                </PreviewContainer>

                {isShowSyncCurrentPageToggle && (
                    <CurrentPageSyncButton
                        isSyncCurrentPage={isSyncCurrentPage}
                        onToggle={handleClickSyncCurrentPage}
                    />
                )}
            </EditorContainer>

        </Wrapper>
    );
}

export default forwardRef(MarkSlidesEditor);
