import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { ExcalidrawIcon } from '@/components/icons';
import type { ToolbarCommand } from '@/toolbar/types/toolbar';

const excalidraw: ToolbarCommand = {
    name: 'excalidraw',
    icon: <ExcalidrawIcon size={16} />,
    tooltip: 'Add Excalidraw',
    execute: (codeMirrorRef: ReactCodeMirrorRef) => {
        const { state, view } = codeMirrorRef;

        if (!state || !view) {
            return;
        }

        const selectedText = view.state.sliceDoc(
            view.state.selection.main.from,
            view.state.selection.main.to
        );

        const mark = '```excalidraw';
        const sampleDiagram = `
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor",
  "elements": [
    {
      "type": "rectangle",
      "version": 1,
      "versionNonce": 1,
      "isDeleted": false,
      "id": "rect1",
      "fillStyle": "hachure",
      "strokeWidth": 1,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "x": 100,
      "y": 100,
      "strokeColor": "#000000",
      "backgroundColor": "transparent",
      "width": 200,
      "height": 100,
      "seed": 1,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "boundElements": [],
      "updated": 1,
      "link": null,
      "locked": false
    }
  ],
  "appState": {
    "gridSize": null,
    "viewBackgroundColor": "#ffffff"
  }
}
        `.trim();

        view.dispatch({
            changes: {
                from: view.state.selection.main.from,
                to: view.state.selection.main.to,
                insert: `
${mark}
${selectedText.length > 0 ? selectedText : sampleDiagram}
\`\`\`
        `.trim(),
            },
        });
    },
};

export default excalidraw;
