import { EditorSelection } from '@codemirror/state';
import { QuoteIcon } from 'lucide-react';

import type { ToolbarCommand } from '@/toolbar/types/toolbar';

const blockQuotes: ToolbarCommand = {
    name: 'blockQuotes',
    icon: (
        <QuoteIcon
            size={16}
            fill='black'
        />
    ),
    execute: (codeMirrorRef) => {
        const { state, view } = codeMirrorRef;

        if (!state || !view) {
            return;
        }

        const lineInfo = view.state.doc.lineAt(view.state.selection.main.from);
        let mark = '> ';
        const matchMark = lineInfo.text.match(/^>\s/);
        if (matchMark && matchMark[0]) {
            mark = '';
        }
        view.dispatch({
            changes: {
                from: lineInfo.from,
                to: lineInfo.to,
                insert: `${mark}${lineInfo.text}`,
            },
            // selection: EditorSelection.range(lineInfo.from + mark.length, lineInfo.to),
            selection: { anchor: view.state.selection.main.from + mark.length },
        });
    },
};

export default blockQuotes;
