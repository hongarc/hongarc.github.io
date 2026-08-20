import { describe, expect, it } from 'vitest';

import type { NormalizeDiffOptions } from '@/domain/text/normalize-diff';
import { normalizeForDiff } from '@/domain/text/normalize-diff';

const base: NormalizeDiffOptions = {
  format: 'none',
  trimWhitespace: false,
  ignoreCase: false,
  sortLines: false,
};

describe('normalizeForDiff', () => {
  it('collapses reordered JSON keys to the same pretty-printed output', async () => {
    const left = await normalizeForDiff('{"b":1,"a":2}', { ...base, format: 'json' });
    const right = await normalizeForDiff('{"a":2,"b":1}', { ...base, format: 'json' });

    expect(left).toBe(right);
    expect(left).toBe(JSON.stringify({ a: 2, b: 1 }, null, 2));
  });

  it('reformats flow-style and block-style YAML to the same output', async () => {
    const left = await normalizeForDiff('{a: 1, b: 2}', { ...base, format: 'yaml' });
    const right = await normalizeForDiff('a: 1\nb: 2', { ...base, format: 'yaml' });

    expect(left).toBe(right);
  });

  it('falls back to the raw string when JSON parsing fails', async () => {
    expect(await normalizeForDiff('{not valid', { ...base, format: 'json' })).toBe('{not valid');
  });

  it('lowercases both sides when ignoreCase is set', async () => {
    expect(await normalizeForDiff('HELLO', { ...base, ignoreCase: true })).toBe('hello');
  });

  it('trims each line and normalizes CRLF to LF when trimWhitespace is set', async () => {
    expect(await normalizeForDiff('  a  \r\n b ', { ...base, trimWhitespace: true })).toBe('a\nb');
  });

  it('sorts lines alphabetically when sortLines is set', async () => {
    expect(await normalizeForDiff('b\na\nc', { ...base, sortLines: true })).toBe('a\nb\nc');
  });

  it('returns the input untouched when every option is off', async () => {
    expect(await normalizeForDiff('anything\n  weird ', base)).toBe('anything\n  weird ');
  });

  it('leaves empty input untouched for both json and yaml formats', async () => {
    expect(await normalizeForDiff('', { ...base, format: 'json' })).toBe('');
    expect(await normalizeForDiff('', { ...base, format: 'yaml' })).toBe('');
  });
});
