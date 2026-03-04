// Segment model and pure utility functions for segmented timestamp input
// Format: YYYY-MM-DDThh:mm:ssZ
// Indices: 0123456789012345678

export interface Segment {
  name: string;
  start: number;
  end: number;
  min: number;
  max: number;
  length: number;
}

const SEG_YEAR: Segment = { name: 'year', start: 0, end: 4, min: 1970, max: 2099, length: 4 };
const SEG_MONTH: Segment = { name: 'month', start: 5, end: 7, min: 1, max: 12, length: 2 };
const SEG_DAY: Segment = { name: 'day', start: 8, end: 10, min: 1, max: 31, length: 2 };
const SEG_HOUR: Segment = { name: 'hour', start: 11, end: 13, min: 0, max: 23, length: 2 };
const SEG_MINUTE: Segment = {
  name: 'minute',
  start: 14,
  end: 16,
  min: 0,
  max: 59,
  length: 2,
};
const SEG_SECOND: Segment = {
  name: 'second',
  start: 17,
  end: 19,
  min: 0,
  max: 59,
  length: 2,
};

const SEGMENTS: Segment[] = [SEG_YEAR, SEG_MONTH, SEG_DAY, SEG_HOUR, SEG_MINUTE, SEG_SECOND];
export const SEGMENT_COUNT = SEGMENTS.length;

export const TEMPLATE = '0000-01-01T00:00:00Z';

export const toFixedIso = (v: string): string | null => {
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

export const getSegment = (idx: number): Segment => SEGMENTS[idx] ?? SEG_YEAR;

export const getSegmentIndex = (cursorPos: number): number => {
  for (let i = SEGMENT_COUNT - 1; i >= 0; i--) {
    if (cursorPos >= getSegment(i).start) return i;
  }
  return 0;
};

export const extractSegmentValue = (value: string, seg: Segment): number =>
  Number.parseInt(value.slice(seg.start, seg.end), 10);

export const replaceSegment = (value: string, seg: Segment, numValue: number): string => {
  const padded = String(numValue).padStart(seg.length, '0');
  return value.slice(0, seg.start) + padded + value.slice(seg.end);
};

const getMaxDay = (year: number, month: number): number => new Date(year, month, 0).getDate();

export const getEffectiveMax = (seg: Segment, timestamp: string): number => {
  if (seg.name === 'day') {
    const year = extractSegmentValue(timestamp, SEG_YEAR);
    const month = extractSegmentValue(timestamp, SEG_MONTH);
    return getMaxDay(year, month);
  }
  return seg.max;
};

export const clampDayInTimestamp = (value: string): string => {
  const year = extractSegmentValue(value, SEG_YEAR);
  const month = extractSegmentValue(value, SEG_MONTH);
  const day = extractSegmentValue(value, SEG_DAY);
  const maxDay = getMaxDay(year, month);
  if (day > maxDay) {
    return replaceSegment(value, SEG_DAY, maxDay);
  }
  return value;
};

export const wrapValue = (current: number, delta: number, min: number, max: number): number => {
  const range = max - min + 1;
  return ((((current - min + delta) % range) + range) % range) + min;
};

export const clampValue = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const measureCanvas = document.createElement('canvas');
export const getCharIndexFromClick = (input: HTMLInputElement, offsetX: number): number => {
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return 0;
  const style = globalThis.getComputedStyle(input);
  ctx.font = `${style.fontSize} ${style.fontFamily}`;
  const paddingLeft = Number.parseFloat(style.paddingLeft);
  const x = offsetX - paddingLeft;
  const text = input.value;
  for (let i = 0; i < text.length; i++) {
    const width = ctx.measureText(text.slice(0, i + 1)).width;
    if (width > x) return i;
  }
  return text.length - 1;
};

export const normalizeTimestamp = (v: string): string => {
  if (v.length === 20) return v;
  return toFixedIso(v) ?? TEMPLATE;
};

export const commitBufferPure = (buffer: string, seg: Segment, currentValue: string): string => {
  if (!buffer) return currentValue;
  const effectiveMax = getEffectiveMax(seg, currentValue);
  const numValue = clampValue(Number.parseInt(buffer, 10), seg.min, effectiveMax);
  return replaceSegment(currentValue, seg, numValue);
};
