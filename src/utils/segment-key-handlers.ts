// Strategy pattern for segment keyboard handlers

import type { Segment } from './segmented-input';
import {
  SEGMENT_COUNT,
  clampValue,
  commitBufferPure,
  extractSegmentValue,
  getEffectiveMax,
  replaceSegment,
  wrapValue,
} from './segmented-input';

export interface SegmentKeyContext {
  key: string;
  shiftKey: boolean;
  currentValue: string;
  segIdx: number;
  seg: Segment;
  buffer: string;
}

export interface SegmentKeyResult {
  value?: string;
  segIdx?: number;
  buffer?: string;
  blur?: boolean;
}

interface SegmentKeyHandler {
  matches: (ctx: SegmentKeyContext) => boolean;
  execute: (ctx: SegmentKeyContext) => SegmentKeyResult;
}

// --- Digit handler helpers ---

const executeTwoDigitInput = (digit: string, ctx: SegmentKeyContext): SegmentKeyResult => {
  const { seg, segIdx, currentValue, buffer } = ctx;
  const newBuffer = buffer + digit;
  const effectiveMax = getEffectiveMax(seg, currentValue);
  const digitNum = Number.parseInt(digit, 10);

  // First digit: early commit if can only be units
  if (newBuffer.length === 1) {
    if (digitNum * 10 > effectiveMax) {
      const numValue = clampValue(digitNum, seg.min, effectiveMax);
      const newValue = replaceSegment(currentValue, seg, numValue);
      return {
        value: newValue,
        buffer: '',
        segIdx: segIdx < SEGMENT_COUNT - 1 ? segIdx + 1 : segIdx,
      };
    }
    // Show partial: place digit in tens position
    const partial = replaceSegment(currentValue, seg, digitNum * 10);
    return { value: partial, buffer: newBuffer, segIdx };
  }

  // Second digit: commit
  const numValue = clampValue(Number.parseInt(newBuffer.slice(0, 2), 10), seg.min, effectiveMax);
  const newValue = replaceSegment(currentValue, seg, numValue);
  return {
    value: newValue,
    buffer: '',
    segIdx: segIdx < SEGMENT_COUNT - 1 ? segIdx + 1 : segIdx,
  };
};

const executeFourDigitInput = (digit: string, ctx: SegmentKeyContext): SegmentKeyResult => {
  const { seg, segIdx, currentValue, buffer } = ctx;
  const newBuffer = buffer + digit;

  if (newBuffer.length >= seg.length) {
    const numValue = clampValue(
      Number.parseInt(newBuffer.slice(0, seg.length), 10),
      seg.min,
      seg.max
    );
    const newValue = replaceSegment(currentValue, seg, numValue);
    return {
      value: newValue,
      buffer: '',
      segIdx: segIdx < SEGMENT_COUNT - 1 ? segIdx + 1 : segIdx,
    };
  }

  // Partial year input
  const padded = newBuffer.padEnd(seg.length, '0');
  const partial = replaceSegment(currentValue, seg, Number.parseInt(padded, 10));
  return { value: partial, buffer: newBuffer, segIdx };
};

// --- Handler implementations ---

const digitHandler: SegmentKeyHandler = {
  matches: (ctx) => /^\d$/.test(ctx.key),
  execute: (ctx) => {
    if (ctx.seg.length === 2) {
      return executeTwoDigitInput(ctx.key, ctx);
    }
    return executeFourDigitInput(ctx.key, ctx);
  },
};

const arrowUpDownHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'ArrowUp' || ctx.key === 'ArrowDown',
  execute: (ctx) => {
    const { seg, segIdx, currentValue, buffer } = ctx;
    const afterCommit = commitBufferPure(buffer, seg, currentValue);
    const currentVal = extractSegmentValue(afterCommit, seg);
    const delta = ctx.key === 'ArrowUp' ? 1 : -1;
    const effectiveMax = getEffectiveMax(seg, afterCommit);
    const newVal = wrapValue(currentVal, delta, seg.min, effectiveMax);
    return {
      value: replaceSegment(afterCommit, seg, newVal),
      buffer: '',
      segIdx,
    };
  },
};

const arrowLeftHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'ArrowLeft',
  execute: (ctx) => {
    const { seg, segIdx, currentValue, buffer } = ctx;
    const afterCommit = commitBufferPure(buffer, seg, currentValue);
    return {
      value: afterCommit === currentValue ? undefined : afterCommit,
      buffer: '',
      segIdx: segIdx > 0 ? segIdx - 1 : segIdx,
    };
  },
};

const arrowRightHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'ArrowRight',
  execute: (ctx) => {
    const { seg, segIdx, currentValue, buffer } = ctx;
    const afterCommit = commitBufferPure(buffer, seg, currentValue);
    return {
      value: afterCommit === currentValue ? undefined : afterCommit,
      buffer: '',
      segIdx: segIdx < SEGMENT_COUNT - 1 ? segIdx + 1 : segIdx,
    };
  },
};

const tabHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'Tab',
  execute: (ctx) => {
    const { seg, segIdx, currentValue, buffer, shiftKey } = ctx;
    const afterCommit = commitBufferPure(buffer, seg, currentValue);
    const value = afterCommit === currentValue ? undefined : afterCommit;

    if (shiftKey) {
      if (segIdx > 0) {
        return { value, buffer: '', segIdx: segIdx - 1 };
      }
      // At first segment, let browser handle shift+tab (blur)
      return { value, buffer: '', blur: true };
    }

    if (segIdx < SEGMENT_COUNT - 1) {
      return { value, buffer: '', segIdx: segIdx + 1 };
    }
    // At last segment, let browser handle tab (blur)
    return { value, buffer: '', blur: true };
  },
};

const backspaceHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'Backspace' || ctx.key === 'Delete',
  execute: (ctx) => {
    const { seg, segIdx, currentValue } = ctx;
    return {
      value: replaceSegment(currentValue, seg, seg.min),
      buffer: '',
      segIdx,
    };
  },
};

const homeHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'Home',
  execute: (ctx) => {
    const { seg, currentValue, buffer } = ctx;
    const afterCommit = commitBufferPure(buffer, seg, currentValue);
    return {
      value: afterCommit === currentValue ? undefined : afterCommit,
      buffer: '',
      segIdx: 0,
    };
  },
};

const endHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'End',
  execute: (ctx) => {
    const { seg, currentValue, buffer } = ctx;
    const afterCommit = commitBufferPure(buffer, seg, currentValue);
    return {
      value: afterCommit === currentValue ? undefined : afterCommit,
      buffer: '',
      segIdx: SEGMENT_COUNT - 1,
    };
  },
};

const escapeHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key === 'Escape',
  execute: (ctx) => {
    const { seg, currentValue, buffer } = ctx;
    const afterCommit = commitBufferPure(buffer, seg, currentValue);
    return {
      value: afterCommit === currentValue ? undefined : afterCommit,
      buffer: '',
      blur: true,
    };
  },
};

const blockOtherKeysHandler: SegmentKeyHandler = {
  matches: (ctx) => ctx.key.length === 1,
  execute: () => ({}),
};

// Ordered list — first match wins
const handlers: SegmentKeyHandler[] = [
  digitHandler,
  arrowUpDownHandler,
  arrowLeftHandler,
  arrowRightHandler,
  tabHandler,
  backspaceHandler,
  homeHandler,
  endHandler,
  escapeHandler,
  blockOtherKeysHandler,
];

export const dispatchSegmentKey = (ctx: SegmentKeyContext): SegmentKeyResult | null => {
  for (const handler of handlers) {
    if (handler.matches(ctx)) {
      return handler.execute(ctx);
    }
  }
  return null;
};
