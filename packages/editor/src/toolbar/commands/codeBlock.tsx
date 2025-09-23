import { EditorSelection } from '@codemirror/state';
import { FileCode2Icon } from 'lucide-react';
import type { ToolbarCommand } from '@/toolbar/types/toolbar';

const codeBlock: ToolbarCommand = {
    name: 'codeBlock',
    icon: <FileCode2Icon size={16} />,
    tooltip: 'Code Block',
    execute: (codeMirrorRef) => {
        const { state, view } = codeMirrorRef;

        if (!state || !view) {
            return;
        }

        const main = view.state.selection.main;
        const txt = view.state.sliceDoc(
            view.state.selection.main.from,
            view.state.selection.main.to
        );
        view.dispatch({
            changes: {
                from: main.from,
                to: main.to,
                insert: `\`\`\`js\n${txt}\n\`\`\``,
            },
            selection: EditorSelection.range(main.from + 3, main.from + 5),
        });
    },
};

export default codeBlock;
