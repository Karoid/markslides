# @markslides/markdown-it-mermaid

Mermaid plugin for markdown-it with image-based flowchart rendering

## Features

- **Image-based Flowchart Rendering**: Converts Mermaid flowcharts to image-based nodes to prevent text truncation issues
- **SVG Generation**: Uses SVG for high-quality, scalable node rendering
- **Multiple Node Shapes**: Supports rectangles, circles, diamonds, hexagons, parallelograms, and more
- **Fallback Support**: Falls back to original Mermaid rendering for non-flowchart diagrams
- **Customizable Styling**: Supports custom colors, fonts, and styling

## Installation

```bash
npm install --save @markslides/markdown-it-mermaid
```

## Usage

```tsx
import MarkdownIt from 'markdown-it';
import markdownItMermaid from '@markslides/markdown-it-mermaid';

const md = new MarkdownIt();
md.use(markdownItMermaid);

const result = md.render(`
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> B
    C --> E[End]
\`\`\`
`);
```

## Supported Node Shapes

- `[Text]` - Rectangle
- `(Text)` - Circle
- `{Text}` - Diamond
- `((Text))` - Stadium
- `{{Text}}` - Hexagon
- `[/Text/]` - Trapezoid
- `[\\Text/]` - Parallelogram

## How It Works

1. **Parsing**: The plugin parses Mermaid flowchart syntax to extract nodes and edges
2. **Image Generation**: Each node is converted to an SVG image using dummy image generation techniques
3. **Layout**: Nodes are arranged using CSS flexbox with proper spacing and arrows
4. **Fallback**: Non-flowchart Mermaid diagrams use the original Mermaid rendering

## Benefits

- **No Text Truncation**: Text in nodes is never cut off due to size constraints
- **Consistent Rendering**: All nodes render consistently across different environments
- **High Quality**: SVG-based rendering provides crisp, scalable graphics
- **Customizable**: Easy to modify colors, fonts, and styling

## License

This package releases under the MIT License.
