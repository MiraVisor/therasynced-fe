import { useCallback, useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  onSave: () => Promise<void> | void;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Hook for auto-saving with debouncing
 * Prevents excessive API calls while user is typing
 */
export function useAutoSave<T = unknown>(data: T, options: UseAutoSaveOptions) {
  const { onSave, debounceMs = 2000, enabled = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Serialize data for comparison
  const dataString = JSON.stringify(data);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void (async () => {
        try {
          await onSave();
          lastSavedRef.current = dataString;
        } catch (error) {
          console.error('Auto-save failed:', error);
          // Optionally show user notification
        }
      })();
    }, debounceMs);
  }, [onSave, debounceMs, dataString]);

  useEffect(() => {
    if (!enabled) return;

    // Only save if data has changed
    if (
      dataString !== lastSavedRef.current &&
      dataString !== '{}' &&
      dataString !== 'null' &&
      dataString !== '""'
    ) {
      void debouncedSave();
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [dataString, debouncedSave, enabled]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      await onSave();
      lastSavedRef.current = dataString;
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    }
  }, [onSave, dataString]);

  return { saveNow };
}
