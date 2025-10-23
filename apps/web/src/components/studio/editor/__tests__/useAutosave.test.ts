import { renderHook, act } from '@testing-library/react';
import { useAutosave } from '../useAutosave';
import { WidgetConfig } from '@/src/lib/studio/WidgetConfigSchema';

const mockConfig: WidgetConfig = {
  theme: {
    variant: 'light',
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    borderRadius: 8,
  },
  blocks: [],
};

describe('useAutosave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call save function after debounce delay', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockSetDirty = jest.fn();
    const mockSetSaving = jest.fn();
    const mockSetSaveError = jest.fn();
    const mockSetLastSavedAt = jest.fn();

    renderHook(() => useAutosave({
      config: mockConfig,
      dirty: true,
      setDirty: mockSetDirty,
      setSaving: mockSetSaving,
      setSaveError: mockSetSaveError,
      setLastSavedAt: mockSetLastSavedAt,
      save: mockSave,
      debounceMs: 100,
    }));

    // Fast-forward time to trigger the debounced save
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for async operations
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSave).toHaveBeenCalledWith(mockConfig);
    expect(mockSetDirty).toHaveBeenCalledWith(false);
    expect(mockSetLastSavedAt).toHaveBeenCalled();
  });

  it('should handle save errors', async () => {
    const mockSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    const mockSetDirty = jest.fn();
    const mockSetSaving = jest.fn();
    const mockSetSaveError = jest.fn();
    const mockSetLastSavedAt = jest.fn();

    renderHook(() => useAutosave({
      config: mockConfig,
      dirty: true,
      setDirty: mockSetDirty,
      setSaving: mockSetSaving,
      setSaveError: mockSetSaveError,
      setLastSavedAt: mockSetLastSavedAt,
      save: mockSave,
      debounceMs: 100,
    }));

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSetSaveError).toHaveBeenCalledWith('Save failed');
    expect(mockSetDirty).not.toHaveBeenCalledWith(false);
  });

  it('should not save when not dirty', () => {
    const mockSave = jest.fn();
    const mockSetDirty = jest.fn();
    const mockSetSaving = jest.fn();
    const mockSetSaveError = jest.fn();
    const mockSetLastSavedAt = jest.fn();

    renderHook(() => useAutosave({
      config: mockConfig,
      dirty: false,
      setDirty: mockSetDirty,
      setSaving: mockSetSaving,
      setSaveError: mockSetSaveError,
      setLastSavedAt: mockSetLastSavedAt,
      save: mockSave,
      debounceMs: 100,
    }));

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockSave).not.toHaveBeenCalled();
  });
});
