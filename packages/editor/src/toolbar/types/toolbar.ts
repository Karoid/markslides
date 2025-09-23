import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';

export type ToolbarCommand = {
    name: string;
    icon: JSX.Element;
    tooltip: string;
    execute: (codeMirrorRef: ReactCodeMirrorRef, context?: ToolbarContext) => void;
};

export interface ToolbarContext {
    openDialog?: (dialogName: string) => void;
}
