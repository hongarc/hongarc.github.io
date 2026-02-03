import { useCallback, useState } from 'react';

interface UseCopyToClipboardOptions {
  /** Duration in ms before resetting copied state (default: 2000) */
  resetDelay?: number;
  /** Callback fired after successful copy */
  onSuccess?: () => void;
  /** Callback fired on copy failure */
  onError?: (error: unknown) => void;
}

interface UseCopyToClipboardReturn {
  /** Whether text was recently copied */
  copied: boolean;
  /** Copy text to clipboard */
  copy: (text: string) => Promise<void>;
  /** Reset copied state manually */
  reset: () => void;
}

/**
 * Hook for clipboard operations with automatic state management
 *
 * @example
 * ```tsx
 * const { copied, copy } = useCopyToClipboard({ onSuccess: trackCopy });
 *
 * return (
 *   <button onClick={() => copy(text)}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </button>
 * );
 * ```
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { resetDelay = 2000, onSuccess, onError } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onSuccess?.();

        setTimeout(() => {
          setCopied(false);
        }, resetDelay);
      } catch (error) {
        onError?.(error);
      }
    },
    [resetDelay, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return { copied, copy, reset };
}
