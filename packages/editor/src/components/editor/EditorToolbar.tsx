import { ForwardedRef, forwardRef, memo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import appConst from '@/lib/constants/appConst';
import DialogManager from './DialogManager';
import type { ToolbarCommand, ToolbarContext } from '@/toolbar';

const TOOLBAR_HEIGHT = 32;

const Wrapper = styled.div`
    height: ${TOOLBAR_HEIGHT}px;
    display: flex;
    flex-wrap: wrap;
    background-color: white;
    box-shadow: 0 -1px 0 0 #eeeeee inset;
`;

const ToolbarItem = styled.button`
    all: unset;
    width: 32px;
    height: ${TOOLBAR_HEIGHT}px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    background-color: transparent;
    &:hover {
        background-color: #dddddd;
    }
`;

export interface EditorToolbarProps {
    toolbarCommands: ToolbarCommand[];
    codeMirrorRef: ReactCodeMirrorRef | null;
    documentId?: string;
}

function EditorToolbar(
    props: EditorToolbarProps,
    forwardedRef: ForwardedRef<HTMLDivElement>
) {
    const { toolbarCommands, codeMirrorRef, documentId } = props;
    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    const handleOpenDialog = useCallback((dialogName: string) => {
        setActiveDialog(dialogName);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setActiveDialog(null);
    }, []);

    const handleImageSelect = useCallback(
        (imageMarkdown: string) => {
            if (!codeMirrorRef) {
                return;
            }

            const view = codeMirrorRef.view;
            if (!view) {
                return;
            }

            // 현재 커서 위치에 이미지 마크다운 삽입
            const cursorPosition = view.state.selection.main.from;

            view.dispatch({
                changes: {
                    from: cursorPosition,
                    to: cursorPosition,
                    insert: imageMarkdown,
                },
                selection: {
                    anchor: cursorPosition + imageMarkdown.length,
                    head: cursorPosition + imageMarkdown.length,
                },
            });

            view.focus();
            handleCloseDialog();
        },
        [codeMirrorRef, handleCloseDialog]
    );

    const handleVegaSelect = useCallback(
        (spec: any) => {
            if (!codeMirrorRef) {
                return;
            }

            const view = codeMirrorRef.view;
            if (!view) {
                return;
            }

            // 현재 커서 위치에 Vega 차트 마크다운 삽입
            const selectedText = view.state.sliceDoc(
                view.state.selection.main.from,
                view.state.selection.main.to
            );

            const mark = '```vega';
            const chartSpec = JSON.stringify(spec, null, 2);
            const vegaMarkdown = `
${mark}
${selectedText.length > 0 ? selectedText : chartSpec}
\`\`\`
            `.trim();

            view.dispatch({
                changes: {
                    from: view.state.selection.main.from,
                    to: view.state.selection.main.to,
                    insert: vegaMarkdown,
                },
                selection: {
                    anchor: view.state.selection.main.from + vegaMarkdown.length,
                    head: view.state.selection.main.from + vegaMarkdown.length,
                },
            });

            view.focus();
            handleCloseDialog();
        },
        [codeMirrorRef, handleCloseDialog]
    );

    const context: ToolbarContext = {
        openDialog: handleOpenDialog,
    };

    return (
        <Wrapper
            id={appConst.EDITOR_TOOLBAR_ID}
            ref={forwardedRef}>
            {toolbarCommands.map((toolbarCommand) => {
                return (
                    <ToolbarItem
                        key={toolbarCommand.name}
                        title={toolbarCommand.tooltip}
                        aria-label={toolbarCommand.name}
                        onClick={() => {
                            if (codeMirrorRef) {
                                toolbarCommand.execute(codeMirrorRef, context);
                            }
                        }}>
                        {toolbarCommand.icon}
                    </ToolbarItem>
                );
            })}
            
            <DialogManager
                activeDialog={activeDialog}
                onCloseDialog={handleCloseDialog}
                onImageSelect={handleImageSelect}
                onVegaSelect={handleVegaSelect}
                documentId={documentId}
            />
        </Wrapper>
    );
}

export default memo(forwardRef(EditorToolbar));
