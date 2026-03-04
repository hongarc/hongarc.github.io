import type React from 'react';
import { useCallback, useRef } from 'react';

import { dispatchSegmentKey } from '@/utils/segment-key-handlers';
import {
  TEMPLATE,
  clampDayInTimestamp,
  commitBufferPure,
  getCharIndexFromClick,
  getSegment,
  getSegmentIndex,
  normalizeTimestamp,
  toFixedIso,
} from '@/utils/segmented-input';

interface UseSegmentedInputOptions {
  value: string;
  onChange: (value: string) => void;
}

export function useSegmentedInput({ value, onChange }: UseSegmentedInputOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef<string>('');
  const segmentIndexRef = useRef<number>(0);

  const selectSegment = useCallback((segIdx: number) => {
    const seg = getSegment(segIdx);
    segmentIndexRef.current = segIdx;
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(seg.start, seg.end);
    });
  }, []);

  const updateAndNotify = useCallback(
    (newValue: string) => {
      onChange(clampDayInTimestamp(newValue));
    },
    [onChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.metaKey || e.ctrlKey) return;

      const current = normalizeTimestamp(value);
      const segIdx = segmentIndexRef.current;
      const seg = getSegment(segIdx);

      const result = dispatchSegmentKey({
        key: e.key,
        shiftKey: e.shiftKey,
        currentValue: current,
        segIdx,
        seg,
        buffer: bufferRef.current,
      });

      if (!result) return;

      if (result.blur) {
        inputRef.current?.blur();
      } else {
        e.preventDefault();
      }

      if (result.buffer !== undefined) {
        bufferRef.current = result.buffer;
      }
      if (result.value !== undefined) {
        updateAndNotify(result.value);
      }
      if (result.segIdx !== undefined) {
        selectSegment(result.segIdx);
      }
    },
    [value, updateAndNotify, selectSegment]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      const input = inputRef.current;
      if (!input) return;

      const charIndex = getCharIndexFromClick(input, e.nativeEvent.offsetX);
      const segIdx = getSegmentIndex(charIndex);
      bufferRef.current = '';
      segmentIndexRef.current = segIdx;

      e.preventDefault();
      input.focus();
      selectSegment(segIdx);
    },
    [selectSegment]
  );

  const onFocus = useCallback(() => {
    bufferRef.current = '';
    if (value.length !== 20) {
      const fixed = toFixedIso(value);
      onChange(fixed ?? TEMPLATE);
    }
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      if (input.selectionStart === input.selectionEnd) {
        selectSegment(segmentIndexRef.current);
      }
    });
  }, [value, onChange, selectSegment]);

  const onBlur = useCallback(() => {
    const current = normalizeTimestamp(value);
    const segIdx = segmentIndexRef.current;
    const seg = getSegment(segIdx);
    const buffer = bufferRef.current;
    bufferRef.current = '';

    if (!buffer) return;

    const afterCommit = commitBufferPure(buffer, seg, current);
    if (afterCommit !== current) {
      updateAndNotify(afterCommit);
    }
  }, [value, updateAndNotify]);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => {
      if (document.activeElement !== inputRef.current) return;
      e.preventDefault();

      const current = normalizeTimestamp(value);
      const segIdx = segmentIndexRef.current;
      const seg = getSegment(segIdx);

      const result = dispatchSegmentKey({
        key: e.deltaY < 0 ? 'ArrowUp' : 'ArrowDown',
        shiftKey: false,
        currentValue: current,
        segIdx,
        seg,
        buffer: bufferRef.current,
      });

      if (!result) return;

      if (result.buffer !== undefined) {
        bufferRef.current = result.buffer;
      }
      if (result.value !== undefined) {
        updateAndNotify(result.value);
      }
      if (result.segIdx !== undefined) {
        selectSegment(result.segIdx);
      }
    },
    [value, updateAndNotify, selectSegment]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').trim();
      const date = new Date(pasted);
      if (!Number.isNaN(date.getTime())) {
        const iso = date.toISOString().replace('.000Z', 'Z');
        onChange(iso);
        selectSegment(0);
      }
    },
    [onChange, selectSegment]
  );

  return {
    inputRef,
    handlers: { onKeyDown, onMouseDown, onFocus, onBlur, onWheel, onPaste },
  };
}
