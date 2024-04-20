import { EditorSelection } from '@codemirror/state';
import { UnderlineIcon } from 'lucide-react';
import type { ToolbarCommand } from '@/toolbar/types/toolbar';

const underline: ToolbarCommand = {
    name: 'underline',
    icon: <UnderlineIcon size={16} />,
    execute: (codeMirrorRef) => {
        const { state, view } = codeMirrorRef;

        if (!state || !view) {
            return;
        }

        view.dispatch(
            view.state.changeByRange((range) => ({
                changes: [
                    { from: range.from, insert: '<u>' },
                    { from: range.to, insert: '</u>' },
                ],
                range: EditorSelection.range(range.from + 3, range.to + 3),
            }))
        );
    },
};

export default underline;
