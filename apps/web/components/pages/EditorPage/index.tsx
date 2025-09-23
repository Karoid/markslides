'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkSlidesEditor, { type MarkSlidesEditorRef } from '@markslides/editor';
import defaultToolbarCommands from '@markslides/editor/toolbar';
import { Box } from '@markslides/ui/box';
import useAppDispatch from '@/redux/hooks/useAppDispatch';
import useAppSelector from '@/redux/hooks/useAppSelector';
import { setContentRequested, setTitle } from '@/redux/slices/localSlice';
import { setSlideInfo } from '@/redux/slices/editorSlice';
import { setSlideConfig } from '@/redux/slices/slideConfigSlice';
import SlideShowFragment from '@/components/fragments/SlideShowFragment';
import slideConfigUtil from '@/lib/utils/slideConfigUtil';
import EditorLayout from '@/components/base/editor/EditorLayout';

interface EditorPageProps {
    documentId: string;
}

function EditorPage({ documentId }: EditorPageProps): JSX.Element {
    const router = useRouter();
    const editorRef = useRef<MarkSlidesEditorRef>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isSlideShowMode = useAppSelector(
        (state) => state.app.isSlideShowMode
    );
    const slideConfigState = useAppSelector((state) => state.slideConfig);
    const slideInfo = useAppSelector((state) => state.editor.slideInfo);
    const localContent = useAppSelector((state) => state.local.content);
    const localTitle = useAppSelector((state) => state.local.title);
    const dispatch = useAppDispatch();

    const markdownContent = useAppSelector((state) => state.local.content);

    // Load document data
    useEffect(() => {
        const loadDocument = async () => {
            try {
                const response = await fetch(`/api/documents/${documentId}`);
                if (!response.ok) {
                    throw new Error('Document not found');
                }
                const document = await response.json();
                
                dispatch(setTitle(document.title));
                dispatch(setContentRequested(document.content));
                if (document.slideConfig) {
                    dispatch(setSlideConfig(document.slideConfig));
                }
            } catch (error) {
                console.error('Failed to load document:', error);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (documentId) {
            loadDocument();
        }
    }, [documentId, dispatch, router]);

    // Auto-save functionality
    useEffect(() => {
        const saveDocument = async () => {
            if (!documentId || isLoading) return;

            try {
                await fetch(`/api/documents/${documentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: localTitle,
                        content: localContent,
                        slideConfig: slideConfigState,
                    }),
                });
            } catch (error) {
                console.error('Failed to save document:', error);
            }
        };

        const timeoutId = setTimeout(saveDocument, 1000); // Debounce save
        return () => clearTimeout(timeoutId);
    }, [documentId, localTitle, localContent, slideConfigState, isLoading]);

    const toolbarCommands = useMemo(() => {
        return [
            ...defaultToolbarCommands
        ];
    }, []);

    const slideConfig = useMemo(() => {
        return slideConfigUtil.generateMarpConfigFromSlideConfigState(
            slideConfigState
        );
    }, [slideConfigState]);

    if (isLoading) {
        return (
            <EditorLayout>
                <Box height='100%' display='flex' alignItems='center' justifyContent='center'>
                    Loading...
                </Box>
            </EditorLayout>
        );
    }

    return (
        <EditorLayout>
            <Box height='100%'>
                <MarkSlidesEditor
                    ref={editorRef}
                    height='inherit'
                    toolbarCommands={toolbarCommands}
                    config={slideConfigState}
                    isFixScrollToBottom={false}
                    slideInfo={slideInfo}
                    onChangeSlideInfo={(newSlideInfo) => {
                        dispatch(setSlideInfo(newSlideInfo));
                    }}
                    placeholder='# Hi, MarkSlides!'
                    value={markdownContent}
                    onChange={(newValue) => {
                        dispatch(setContentRequested(newValue));
                    }}
                />

                {isSlideShowMode && (
                    <SlideShowFragment
                        mode='audience'
                        content={localContent}
                        config={slideConfig}
                    />
                )}
            </Box>
        </EditorLayout>
    );
}

export default EditorPage;
