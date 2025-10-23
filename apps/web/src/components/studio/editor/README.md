# Studio Editor UX

A comprehensive editor system for the Widget Studio with drag-and-drop, autosave, undo/redo, and validation.

## Features

### ✅ Implemented

1. **Block Palette** - Search and insert blocks from a sidebar palette
2. **Slash Menu** - Quick block insertion with "/" keyboard shortcut
3. **Drag & Drop** - Reorder blocks with native HTML5 drag events
4. **Autosave** - Debounced autosave (700ms) with optimistic UI
5. **Undo/Redo** - 50-entry history stack with keyboard shortcuts
6. **Keyboard Shortcuts** - Cmd/Ctrl+Z for undo, Cmd/Ctrl+Shift+Z for redo
7. **Validation UI** - Real-time validation with error badges
8. **Save Banner** - Fixed banner showing save status (Saving/Saved/Error)

## Architecture

### Core Hooks

#### `useEditorState`
Manages editor state, history, and validation:
- **Config Management**: Current widget configuration
- **History Stack**: Undo/redo with bounded history (50 entries)
- **Validation**: Real-time block validation with Zod
- **Dirty State**: Tracks unsaved changes

```typescript
const {
  config,
  setConfigWithHistory,
  dirty,
  saving,
  saveError,
  lastSavedAt,
  undo,
  redo,
  canUndo,
  canRedo,
  issues
} = useEditorState(initialConfig);
```

#### `useAutosave`
Handles debounced autosaving:
- **Debounce**: 700ms default (configurable)
- **Optimistic UI**: Config applied immediately, saved asynchronously
- **Error Handling**: Captures and reports save errors

```typescript
useAutosave({
  config,
  dirty,
  setDirty,
  setSaving,
  setSaveError,
  setLastSavedAt,
  save: async (cfg) => { /* API call */ },
  debounceMs: 700
});
```

#### `useKeyboard`
Keyboard shortcut management:
- **Undo**: Cmd/Ctrl+Z
- **Redo**: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
- **Cross-platform**: Detects Mac vs Windows/Linux

```typescript
useKeyboard({ undo, redo });
```

### Components

#### `BlockPalette`
Searchable block type selector:
- Grid layout with 2 columns
- Real-time search filtering
- Click to insert at specified index

#### `SlashMenu`
Context-aware quick insert menu:
- Triggered by "/" key
- Filtered search
- Shows top 8 results
- ESC to close

#### `EditorCanvas`
Main editing surface:
- Drag & drop reordering
- Inline block insertion
- Block type indicators
- Preview rendering

#### `SaveBanner`
Fixed status indicator:
- Bottom-right position
- Shows: Saving / Saved / Error
- Semi-transparent backdrop

#### `ValidationBadge`
Error count display:
- Shows validation error count
- Red badge styling
- Hidden when no errors

### Utilities

#### `dnd.ts`
Drag and drop helpers:
- `moveBlock(blocks, fromIdx, toIdx)` - Reorder blocks
- `insertBlock(blocks, idx, block)` - Insert at index
- Immutable operations (returns new array)

## Usage

### Basic Integration

```typescript
import { useEditorState } from '@/components/studio/editor/useEditorState';
import { useAutosave } from '@/components/studio/editor/useAutosave';
import { SaveBanner } from '@/components/studio/editor/SaveBanner';
import { BlockPalette } from '@/components/studio/editor/BlockPalette';
import { EditorCanvas } from '@/components/studio/editor/EditorCanvas';
import { useKeyboard } from '@/components/studio/editor/useKeyboard';
import { ValidationBadge } from '@/components/studio/editor/ValidationBadge';

function StudioEditor({ projectId, initialConfig }) {
  const editorState = useEditorState(initialConfig);
  
  useKeyboard({ undo: editorState.undo, redo: editorState.redo });
  
  const save = async (cfg) => {
    await fetch(`/api/projects/${projectId}/config`, {
      method: 'PUT',
      body: JSON.stringify({ settings: cfg })
    });
  };
  
  useAutosave({ ...editorState, save });
  
  return (
    <div>
      <header>
        <button onClick={editorState.undo} disabled={!editorState.canUndo}>
          Undo
        </button>
        <button onClick={editorState.redo} disabled={!editorState.canRedo}>
          Redo
        </button>
        <ValidationBadge count={editorState.issues.length} />
      </header>
      
      <div className="grid grid-cols-12">
        <aside className="col-span-3">
          <BlockPalette onInsert={(type) => insertAt(0, type)} />
        </aside>
        <main className="col-span-9">
          <EditorCanvas
            blocks={editorState.config.blocks}
            onChange={(blocks) => editorState.setConfigWithHistory(prev => ({
              ...prev,
              blocks
            }))}
            onInsertAt={insertAt}
          />
        </main>
      </div>
      
      <SaveBanner
        saving={editorState.saving}
        lastSavedAt={editorState.lastSavedAt}
        error={editorState.saveError}
      />
    </div>
  );
}
```

## Testing

### Unit Tests

Run unit tests:
```bash
npm test
```

Test files:
- `__tests__/useEditorState.test.ts` - State management and history
- `__tests__/useAutosave.test.ts` - Autosave debouncing
- `__tests__/dnd.test.ts` - Drag and drop utilities

### E2E Tests

Run E2E tests:
```bash
npx playwright test tests/studio-editor.spec.ts
```

E2E test coverage:
- Block insertion from palette
- Drag and drop reordering
- Autosave flow
- Keyboard shortcuts
- Validation display

## API Integration

The editor integrates with the project config API:

**Endpoint**: `PUT /api/projects/[id]/config`

**Request Body**:
```json
{
  "settings": {
    "theme": { ... },
    "blocks": [ ... ]
  }
}
```

**Response**: Updated config with timestamp

## Future Enhancements

### Potential Improvements

1. **Nested DnD**: Use `@dnd-kit/core` for container block drag-and-drop
2. **Block Editing**: Inline editing for text blocks
3. **Copy/Paste**: Duplicate blocks with Cmd+C/V
4. **Block Selection**: Multi-select with Shift+Click
5. **Size Limit Warning**: Alert when config exceeds 500KB
6. **Validation Blocking**: Prevent save on validation errors
7. **Focus Management**: Arrow keys for block navigation
8. **Drag Handles**: Visual drag indicators on hover
9. **Preview Mode**: Toggle between edit and preview
10. **Version History**: Server-side version tracking

## Dependencies

- `uuid` - Block ID generation
- `zod` - Schema validation
- `react` - UI framework
- `@dnd-kit/*` (optional) - Advanced drag and drop

## File Structure

```
apps/web/src/components/studio/editor/
├── README.md                      # This file
├── useEditorState.ts              # State management hook
├── useAutosave.ts                 # Autosave hook
├── useKeyboard.ts                 # Keyboard shortcuts hook
├── BlockPalette.tsx               # Block type selector
├── SlashMenu.tsx                  # Quick insert menu
├── EditorCanvas.tsx               # Main editing surface
├── SaveBanner.tsx                 # Save status indicator
├── ValidationBadge.tsx            # Error count badge
├── dnd.ts                         # Drag and drop utilities
└── __tests__/
    ├── useEditorState.test.ts
    ├── useAutosave.test.ts
    └── dnd.test.ts
```

## Acceptance Criteria

✅ Add, search, and quick insert blocks via palette or "/"  
✅ Reorder top-level blocks by drag and drop  
✅ Edits autosave with optimistic UI and a status banner  
✅ Undo and redo work for recent edits  
✅ Keyboard shortcuts for undo and redo work on Mac and Windows  
✅ Validation errors display count and prevent silent bad writes  
✅ E2E and unit tests pass locally  

## License

Part of the AI Feedback SaaS project.

