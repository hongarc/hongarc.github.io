import { describe, expect, it } from 'vitest';

import { parseTimestampInput } from '@/domain/time/timestamp';

const iso = (text: string): string | null => parseTimestampInput(text)?.toISOString() ?? null;

describe('parseTimestampInput', () => {
  it('treats zero as the Unix epoch', () => {
    expect(iso('0')).toBe('1970-01-01T00:00:00.000Z');
  });

  it('treats negative seconds as dates before the epoch', () => {
    expect(iso('-86400')).toBe('1969-12-31T00:00:00.000Z');
  });

  it('parses positive seconds', () => {
    expect(iso('1704067200')).toBe('2024-01-01T00:00:00.000Z');
  });

  it('parses positive milliseconds', () => {
    expect(iso('1704067200000')).toBe('2024-01-01T00:00:00.000Z');
  });

  it('parses negative milliseconds', () => {
    expect(iso('-1704067200000')).toBe('1916-01-02T00:00:00.000Z');
  });

  it('ignores surrounding whitespace', () => {
    expect(iso(' 42 ')).toBe('1970-01-01T00:00:42.000Z');
  });

  it('switches to milliseconds just above 32_503_680_000', () => {
    expect(iso('32503680000')).toBe('3000-01-01T00:00:00.000Z');
    expect(iso('32503680001')).toBe('1971-01-12T04:48:00.001Z');
    expect(iso('-32503680000')).toBe('0940-01-01T00:00:00.000Z');
  });

  it('passes date strings through to Date', () => {
    expect(iso('2024-01-01T00:00:00Z')).toBe('2024-01-01T00:00:00.000Z');
  });

  it('returns null for unparseable input', () => {
    expect(parseTimestampInput('not a date')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseTimestampInput(' '.repeat(3))).toBeNull();
  });

  it('returns null for integers outside the Date range', () => {
    expect(parseTimestampInput('99999999999999999999')).toBeNull();
  });
});
