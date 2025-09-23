# MarkSlides AI Agents Technical Guide

## Project Overview

MarkSlides is a markdown-based presentation creation tool that enables users to create professional presentations using markdown syntax with real-time preview, multiple themes, and advanced features like Mermaid diagrams and custom layouts.

## Project Structure

```text
markslides/
├── apps/
│   ├── web/                    # Next.js 14 web application
│   │   ├── app/               # App Router (Next.js 14)
│   │   │   ├── (editor)/      # Editor page group
│   │   │   ├── slide-show/    # Presentation mode
│   │   │   └── slide-list/    # Slide management
│   │   ├── components/        # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── fragments/     # Reusable fragments
│   │   │   └── ui/           # UI components
│   │   ├── lib/              # Utilities and constants
│   │   ├── redux/            # Redux store and slices
│   │   └── hooks/            # Custom React hooks
│   ├── docs/                 # Documentation app
│   └── storybook/            # Storybook for component development
├── packages/
│   ├── editor/               # @markslides/editor (v0.1.67)
│   │   ├── src/
│   │   │   ├── components/   # Editor components
│   │   │   ├── hooks/        # CodeMirror extensions
│   │   │   ├── lib/          # Utilities and types
│   │   │   └── toolbar/      # Toolbar commands
│   │   └── dist/             # Built package
│   ├── renderer/             # @markslides/renderer (v0.1.36)
│   │   ├── src/
│   │   │   ├── hooks/        # Rendering hooks
│   │   │   └── lib/          # Marp configuration
│   │   └── dist/             # Built package
│   ├── themes/               # @markslides/themes (v0.1.6)
│   │   ├── src/
│   │   │   └── themes/       # CSS theme files
│   │   └── dist/             # Built package
│   ├── ui/                   # @markslides/ui
│   │   ├── src/              # UI components
│   │   └── dist/             # Built package
│   ├── eslint-config/        # Shared ESLint config
│   ├── typescript-config/    # Shared TypeScript config
│   ├── markdown-it-link/     # Custom markdown-it plugin
│   └── markdown-it-typograms/ # Typograms plugin
├── docker/                   # Docker configuration
├── turbo.json               # Turbo monorepo config
└── package.json             # Root package.json
```

## Core Packages Architecture

### 1. `@markslides/editor` (v0.1.67)

**Location**: `packages/editor/`
**Purpose**: Markdown editor component with CodeMirror 6 integration

**Key Files**:

- `src/components/editor/MarkSlidesEditor.tsx` - Main editor component
- `src/toolbar/index.ts` - Toolbar command exports
- `src/hooks/codemirror/` - CodeMirror extensions
- `src/lib/types/common.ts` - TypeScript definitions

**Dependencies**:

- `@uiw/react-codemirror` - CodeMirror React wrapper
- `@codemirror/lang-markdown` - Markdown language support
- `@markslides/renderer` - For slide preview

**Toolbar Commands** (16 total):

```typescript
// Available in packages/editor/src/toolbar/
undo, redo, heading, bold, italic, strike, underline,
blockQuotes, orderedList, unorderedList, todoList,
link, image, code, codeBlock, mermaid
```

### 2. `@markslides/renderer` (v0.1.36)

**Location**: `packages/renderer/`
**Purpose**: Markdown to slide conversion using Marp

**Key Files**:

- `src/lib/marp/appMarp.ts` - Marp configuration
- `src/hooks/useDefaultMarpRender.ts` - Rendering hook
- `src/lib/types/common.ts` - Type definitions

**Dependencies**:

- `@marp-team/marp-core` - Core Marp functionality
- `markdown-it` - Markdown parser
- `@markslides/themes` - Theme system

**Supported Plugins**:

- `markdown-it-container` - Column layouts (2-6 columns)
- `markdown-it-typograms` - Typograms support
- `markdown-it-task-lists` - Task lists
- `markdown-it-link` - Link processing

### 3. `@markslides/themes` (v0.1.6)

**Location**: `packages/themes/`
**Purpose**: CSS theme management for slides

**Key Files**:

- `src/themes/default.css` - Default GitHub-style theme
- `src/themes/red.css` - Red color scheme
- `src/themes/green.css` - Green color scheme
- `src/themes/blue.css` - Blue color scheme
- `src/index.ts` - Theme exports

### 4. `@markslides/ui`

**Location**: `packages/ui/`
**Purpose**: Shared UI components

**Key Components**:

- `Box` - Layout component
- `Center` - Centering component

## Web Application (`apps/web`)

**Location**: `apps/web/`
**Framework**: Next.js 14 with App Router

**Key Directories**:

- `app/` - Next.js App Router pages
- `components/` - React components
- `redux/` - State management
- `lib/` - Utilities and constants

**State Management** (Redux Toolkit):

- `redux/slices/localSlice.ts` - Local content and title
- `redux/slices/editorSlice.ts` - Editor state and slide info
- `redux/slices/slideConfig.ts` - Slide configuration

**Key Pages**:

- `app/(editor)/page.tsx` - Main editor page
- `app/slide-show/page.tsx` - Presentation mode
- `app/slide-list/page.tsx` - Slide management

## AI Agent Development Guide

### Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build all packages
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Publish packages
npm run publish-packages
```

### Development Workflow

#### 1. Editor Feature Development

**Location**: `packages/editor/src/`

**Adding New Toolbar Command**:

```typescript
// File: packages/editor/src/toolbar/commands/newCommand.ts
import { ToolbarCommand } from '@/toolbar/types/toolbar';

const newCommand: ToolbarCommand = {
  icon: 'IconName',
  title: 'Command Title',
  action: (editor) => {
    // Implement editor action
    const { state, dispatch } = editor.view;
    // Use CodeMirror commands
  }
};

export default newCommand;
```

**CodeMirror Extensions**:

```typescript
// File: packages/editor/src/hooks/codemirror/useCustomExtension.ts
import { Extension } from '@codemirror/state';

export default function useCustomExtension(): Extension {
  return /* extension implementation */;
}
```

#### 2. Renderer Enhancement

**Location**: `packages/renderer/src/`

**Adding Markdown Plugin**:

```typescript
// File: packages/renderer/src/lib/marp/plugins/customPlugin.ts
import { PluginSimple } from 'markdown-it';

const customPlugin: PluginSimple = (md) => {
  // Plugin implementation
};

export default customPlugin;
```

**Marp Configuration**:

```typescript
// File: packages/renderer/src/lib/marp/appMarp.ts
import { Marp } from '@marp-team/marp-core';
import customPlugin from './plugins/customPlugin';

const marp = new Marp({
  // Configuration options
});
marp.use(customPlugin);
```

#### 3. Theme Development

**Location**: `packages/themes/src/themes/`

**Creating New Theme**:

```css
/* File: packages/themes/src/themes/custom.css */
@theme custom

section {
  --color-fg-default: #your-color;
  --color-canvas-default: #your-bg;
  /* Define theme variables */
}
```

**Register Theme**:

```typescript
// File: packages/themes/src/index.ts
import customTheme from './themes/custom.css';

const themes = [
  { name: 'custom', css: customTheme },
  // ... other themes
];
```

#### 4. UI Component Development

**Location**: `packages/ui/src/`

**Creating Component**:

```typescript
// File: packages/ui/src/components/CustomComponent.tsx
import React from 'react';
import styled from 'styled-components';

const StyledComponent = styled.div`
  /* Styled component styles */
`;

const CustomComponent: React.FC<Props> = ({ children, ...props }) => {
  return <StyledComponent {...props}>{children}</StyledComponent>;
};

export default CustomComponent;
```

### Key Technical Details

#### TypeScript Configuration

- **Root**: `tsconfig.json` - Base configuration
- **Packages**: Each package has its own `tsconfig.json`
- **Shared**: `packages/typescript-config/` - Shared configs

#### Build System

- **Turbo**: Monorepo build orchestration
- **tsup**: Package bundling (ESM + CJS)
- **Next.js**: Web app building

#### State Management

```typescript
// Redux slices location: apps/web/redux/slices/
interface LocalState {
  content: string;
  title: string;
}

interface EditorState {
  slideInfo: SlideInfo;
  // ... other editor state
}

interface SlideConfigState {
  theme: SlideTheme;
  class: SlideClass;
  size: SlideSize;
  header: string;
  footer: string;
  paginate: boolean;
}
```

#### File Structure Patterns

```text
packages/[package-name]/src/
├── components/          # React components
├── hooks/              # Custom hooks
├── lib/                # Utilities and types
├── toolbar/            # Editor toolbar (editor only)
└── index.ts           # Main export file
```

### Common Development Tasks

#### Adding New Slide Configuration

1. Update `packages/renderer/src/lib/constants/slideConfigConst.ts`
2. Add types in `packages/renderer/src/lib/types/common.ts`
3. Update UI components in `apps/web/components/`

#### Extending Markdown Support

1. Create plugin in `packages/markdown-it-[name]/`
2. Register in `packages/renderer/src/lib/marp/appMarp.ts`
3. Add toolbar command if needed

#### Adding New Page

1. Create page in `apps/web/app/[route]/page.tsx`
2. Add component in `apps/web/components/pages/`
3. Update navigation if needed

### Debugging and Testing

#### Development Tools

- **Storybook**: `apps/storybook/` - Component development
- **ESLint**: Shared config in `packages/eslint-config/`
- **Prettier**: Code formatting

#### Common Issues

- **Build errors**: Check `turbo.json` dependencies
- **Type errors**: Verify package exports in `package.json`
- **Runtime errors**: Check Redux state structure

### Deployment

#### Docker Support

- **Dockerfile**: Root level configuration
- **docker-compose.yml**: Multi-service setup
- **docker/**: Additional Docker files

#### Package Publishing

- **Changesets**: Version management
- **npm workspaces**: Monorepo package management
- **Turbo**: Build orchestration

## API Reference

### Editor API

```typescript
interface MarkSlidesEditorProps {
  value: string;
  onChange: (value: string) => void;
  toolbarCommands: ToolbarCommand[];
  config: SlideConfigState;
  slideInfo: SlideInfo;
  onChangeSlideInfo: (info: SlideInfo) => void;
}
```

### Renderer API

```typescript
interface SlideConfigState {
  theme: 'default' | 'red' | 'green' | 'blue';
  class: 'normal' | 'invert';
  size: '4:3' | '16:9';
  header: string;
  footer: string;
  paginate: boolean;
}
```

### Theme API

```css
/* CSS Custom Properties */
section {
  --color-fg-default: #text-color;
  --color-canvas-default: #background-color;
  /* ... more variables */
}
```

## Code Conventions

### TypeScript Conventions

#### Type Definitions

- **Interface naming**: PascalCase with descriptive names (e.g., `SlideConfigState`, `MarkSlidesEditorProps`)
- **Type naming**: PascalCase for complex types, camelCase for simple types
- **Union types**: Use string literals for enums (e.g., `'audience' | 'presenter' | 'public'`)
- **Generic types**: Use single uppercase letters (e.g., `T`, `K`, `V`)

```typescript
// Good examples from the codebase
export interface SlideConfigState {
  theme: SlideTheme;
  class: SlideClass;
  size: SlideSize;
  header: string;
  footer: string;
  paginate: boolean;
}

export type SlideShowMode = 'audience' | 'presenter' | 'public';

export type ToolbarCommand = {
  name: string;
  icon: JSX.Element;
  execute: (codeMirrorRef: ReactCodeMirrorRef) => void;
};
```

#### Import/Export Patterns

- **Type imports**: Use `import type` for type-only imports
- **Default exports**: Use for main components and utilities
- **Named exports**: Use for multiple exports from modules
- **Path aliases**: Use `@/` for internal imports, full package names for external

```typescript
// Type imports
import type { SlideConfigState } from '@markslides/renderer';
import type { PayloadAction } from '@reduxjs/toolkit';

// Mixed imports
import MarkSlidesEditor, { type MarkSlidesEditorRef } from '@markslides/editor';

// Internal path aliases
import useAppDispatch from '@/redux/hooks/useAppDispatch';
import slideConfigUtil from '@/lib/utils/slideConfigUtil';
```

### React Component Conventions

#### Component Structure

- **Function components**: Use arrow functions for simple components, function declarations for complex ones
- **Props interface**: Define props interface above the component
- **Return type**: Explicitly type return as `JSX.Element`
- **Client components**: Use `'use client'` directive at the top

```typescript
'use client';

import { useMemo, useRef } from 'react';
import type { ComponentProps } from './types';

interface CustomComponentProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function CustomComponent(props: CustomComponentProps): JSX.Element {
  const { title, children, onClick } = props;
  
  return (
    <div onClick={onClick}>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export default CustomComponent;
```

#### Styled Components Conventions

- **Component naming**: Use descriptive names with `Styled` prefix
- **Props typing**: Use `CSSProperties` for style props
- **Attrs pattern**: Use `.attrs()` for prop transformation
- **Custom props**: Prefix with underscore (e.g., `_hover`, `_focus`)

```typescript
import styled, { type CSSProperties } from 'styled-components';

const StyledButton = styled.button.attrs<
  ButtonHTMLAttributes<HTMLButtonElement> & { _hover?: CSSProperties }
>(({ _hover, ...others }) => ({
  style: {
    ...others,
  },
}))`
  all: unset;
  padding: 10px 16px;
  cursor: pointer;
  
  &:hover {
    * {
      ${({ _hover }) => _hover && inlineRules(_hover)};
    }
  }
`;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  _hover?: CSSProperties;
  children: ReactNode;
}
```

### Redux Toolkit Conventions

#### Slice Structure

- **Slice naming**: Use descriptive names ending with `Slice`
- **Interface naming**: Use `State` suffix for state interfaces
- **Action naming**: Use descriptive verbs (e.g., `setTitle`, `resetLocalSlice`)
- **Payload typing**: Use `PayloadAction<T>` for typed actions

```typescript
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface LocalState {
  title: string;
  content: string;
}

const initialState: LocalState = {
  title: '',
  content: '',
};

export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    setTitle: (state: LocalState, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    resetLocalSlice: () => initialState,
  },
});

export const { setTitle, resetLocalSlice } = localSlice.actions;
export default localSlice.reducer;
```

### File and Folder Naming

#### File Naming

- **Components**: PascalCase for component files (e.g., `MarkSlidesEditor.tsx`)
- **Utilities**: camelCase for utility files (e.g., `slideConfigUtil.ts`)
- **Types**: camelCase with descriptive names (e.g., `common.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useWindowSize.ts`)

#### Folder Structure

- **Components**: Group by feature, use `index.tsx` for main exports
- **Hooks**: Organize by category (e.g., `codemirror/`, `window/`)
- **Utils**: Group related utilities together
- **Types**: Centralize in `types/` or `lib/types/`

```text
src/
├── components/
│   ├── editor/
│   │   ├── MarkSlidesEditor.tsx
│   │   └── EditorToolbar.tsx
│   └── fragments/
│       └── PreviewFragment.tsx
├── hooks/
│   ├── codemirror/
│   └── window/
├── lib/
│   ├── types/
│   └── utils/
└── toolbar/
    └── commands/
```

### Code Style Guidelines

#### General Rules

- **Indentation**: 4 spaces (not tabs)
- **Line length**: Keep under 100 characters when possible
- **Semicolons**: Always use semicolons
- **Quotes**: Use single quotes for strings, double quotes for JSX attributes
- **Trailing commas**: Use in objects and arrays

#### TypeScript Specific

- **Strict mode**: Always use strict TypeScript settings
- **No any**: Avoid `any` type, use `unknown` or proper typing
- **Null checks**: Use optional chaining and nullish coalescing
- **Type assertions**: Use sparingly, prefer type guards

```typescript
// Good
const title = data?.title ?? 'Untitled';
if (isSlideInfo(data)) {
  // data is properly typed here
}

// Avoid
const title = (data as any).title || 'Untitled';
```

#### React Specific

- **Props destructuring**: Destructure props at the beginning of components
- **Event handlers**: Use descriptive names (e.g., `handleClick`, `onChangeSlideInfo`)
- **Conditional rendering**: Use logical operators or ternary operators consistently
- **Keys**: Always provide unique keys for list items

```typescript
// Good
function Component({ title, children, onSave }: Props): JSX.Element {
  const handleClick = useCallback(() => {
    onSave?.();
  }, [onSave]);

  return (
    <div>
      {title && <h1>{title}</h1>}
      {children}
    </div>
  );
}
```

### Package-Specific Conventions

#### Editor Package

- **Toolbar commands**: Export as named exports from `toolbar/index.ts`
- **CodeMirror extensions**: Use `use` prefix for custom hooks
- **Component refs**: Use `forwardRef` with proper typing

#### Renderer Package

- **Marp configuration**: Centralize in `appMarp.ts`
- **Plugin registration**: Use descriptive names and proper typing
- **Theme management**: Use consistent naming for theme files

#### UI Package

- **Component exports**: Use named exports for components
- **Style props**: Use `CSSProperties` for all style-related props
- **Utility functions**: Keep in `utils/` directory

### Error Handling

#### General Approach

- **Try-catch**: Use for async operations and external API calls
- **Error boundaries**: Implement for React error handling
- **Console errors**: Use `console.error` for debugging, remove in production
- **Type guards**: Use for runtime type checking

```typescript
// Good error handling
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  return null;
}

// Type guard
function isSlideInfo(data: unknown): data is SlideInfo {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    'currentSlideNumber' in data
  );
}
```

### Performance Conventions

#### React Performance

- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Component splitting**: Split large components into smaller, focused ones
- **Lazy loading**: Use `dynamic` imports for heavy components

#### Bundle Optimization

- **Tree shaking**: Use named imports to enable tree shaking
- **Code splitting**: Use dynamic imports for route-based splitting
- **Asset optimization**: Optimize images and other assets

```typescript
// Lazy loading example
const SlideShowFragment = dynamic(
  () => import('@/components/fragments/SlideShowFragment'),
  {
    ssr: false,
    loading: () => <LoadingComponent />,
  }
);
```
