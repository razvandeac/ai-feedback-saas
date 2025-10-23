import { renderHook, act } from '@testing-library/react';
import { useEditorState } from '../useEditorState';
import { WidgetConfig } from '@/src/lib/studio/WidgetConfigSchema';

const mockInitialConfig: WidgetConfig = {
  theme: {
    variant: 'light',
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    borderRadius: 8,
  },
  blocks: [
    {
      id: 'test-1',
      type: 'text',
      version: 1,
      data: { text: 'Test text', align: 'left' },
    },
  ],
};

describe('useEditorState', () => {
  it('should initialize with provided config', () => {
    const { result } = renderHook(() => useEditorState(mockInitialConfig));
    
    expect(result.current.config).toEqual(mockInitialConfig);
    expect(result.current.dirty).toBe(false);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should track history on config changes', () => {
    const { result } = renderHook(() => useEditorState(mockInitialConfig));
    
    act(() => {
      result.current.setConfigWithHistory(prev => ({
        ...prev,
        blocks: [...prev.blocks, {
          id: 'test-2',
          type: 'text',
          version: 1,
          data: { text: 'New text', align: 'left' },
        }],
      }));
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.config.blocks).toHaveLength(2);
  });

  it('should support undo/redo operations', () => {
    const { result } = renderHook(() => useEditorState(mockInitialConfig));
    
    // Make a change
    act(() => {
      result.current.setConfigWithHistory(prev => ({
        ...prev,
        blocks: [...prev.blocks, {
          id: 'test-2',
          type: 'text',
          version: 1,
          data: { text: 'New text', align: 'left' },
        }],
      }));
    });

    expect(result.current.config.blocks).toHaveLength(2);
    expect(result.current.canUndo).toBe(true);

    // Undo
    act(() => {
      result.current.undo();
    });

    expect(result.current.config.blocks).toHaveLength(1);
    expect(result.current.canRedo).toBe(true);

    // Redo
    act(() => {
      result.current.redo();
    });

    expect(result.current.config.blocks).toHaveLength(2);
    expect(result.current.canRedo).toBe(false);
  });

  it('should validate blocks and report issues', () => {
    const invalidConfig: WidgetConfig = {
      ...mockInitialConfig,
      blocks: [
        {
          id: 'invalid',
          type: 'text',
          version: 1,
          data: { text: '', align: 'invalid' as any },
        },
      ],
    };

    const { result } = renderHook(() => useEditorState(invalidConfig));
    
    expect(result.current.issues.length).toBeGreaterThan(0);
  });
});
