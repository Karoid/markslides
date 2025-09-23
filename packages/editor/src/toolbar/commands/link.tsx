import { EditorSelection } from '@codemirror/state';
import { LinkIcon } from 'lucide-react';
import type { ToolbarCommand } from '@/toolbar/types/toolbar';

const link: ToolbarCommand = {
    name: 'link',
    icon: <LinkIcon size={16} />,
    tooltip: 'Link',
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
                insert: `[${txt}]()`,
            },
            selection: EditorSelection.range(
                main.from + 3 + txt.length,
                main.to + 3
            ),
            // selection: { anchor: main.from + 4 },
        });
    },
};

export default link;
