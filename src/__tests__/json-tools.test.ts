import { describe, expect, it } from 'vitest';

import {
  analyzeJson,
  describeJsonError,
  findJsonErrorPosition,
  formatJsonWithOrder,
  sortKeysByOrder,
} from '@/domain/format/json';

describe('sortKeysByOrder', () => {
  it('sorts keys ascending, recursing through arrays and objects', () => {
    const sorted = sortKeysByOrder({ b: { z: 1, y: 2 }, a: [{ d: 1, c: 2 }] }, 'asc');
    expect(JSON.stringify(sorted)).toBe('{"a":[{"c":2,"d":1}],"b":{"y":2,"z":1}}');
  });

  it('sorts keys descending', () => {
    expect(JSON.stringify(sortKeysByOrder({ a: 1, c: 3, b: 2 }, 'desc'))).toBe(
      '{"c":3,"b":2,"a":1}'
    );
  });

  it('leaves scalars untouched', () => {
    expect(sortKeysByOrder(5, 'asc')).toBe(5);
    expect(sortKeysByOrder(null, 'desc')).toBeNull();
  });
});

describe('formatJsonWithOrder', () => {
  it('beautifies with the given indent and no sorting', () => {
    expect(formatJsonWithOrder('{"b":1,"a":[1,2]}', '2', 'none')).toBe(
      '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}'
    );
  });

  it('uses tabs', () => {
    expect(formatJsonWithOrder('{"a":1}', 'tab', 'none')).toBe('{\n\t"a": 1\n}');
  });

  it('minifies with indent 0 and sorts descending', () => {
    expect(formatJsonWithOrder('{ "a": 1, "b": 2 }', '0', 'desc')).toBe('{"b":2,"a":1}');
  });

  it('sorts ascending', () => {
    expect(formatJsonWithOrder('{"b":1,"a":2}', '0', 'asc')).toBe('{"a":2,"b":1}');
  });

  it('throws on invalid JSON', () => {
    expect(() => formatJsonWithOrder('{', '2', 'none')).toThrow();
  });
});

describe('describeJsonError', () => {
  it('locates the error and derives line and column, whatever the engine message says', () => {
    const input = '{\n  "a": 1,\n  "b": x\n}';
    const issue = describeJsonError(input, new Error('Safari-style message with no position'));
    expect(issue).toEqual({
      message: 'Safari-style message with no position',
      position: 19,
      line: 3,
      column: 8,
    });
  });

  it('keeps only the message when the text is actually valid', () => {
    expect(describeJsonError('{}', new Error('odd'))).toEqual({
      message: 'odd',
      position: null,
      line: null,
      column: null,
    });
  });

  it('falls back to a generic message for non-Error values', () => {
    expect(describeJsonError('{', 'boom').message).toBe('Invalid JSON');
  });
});

describe('findJsonErrorPosition', () => {
  it.each([
    ['{\n  "a": 1,\n  "b": \n}', 20],
    ['[1,]', 3],
    ["{'a':1}", 1],
    ['{"a" 1}', 5],
    ['{"a":1,}', 7],
    ['[1 2]', 3],
    ['{"a":1', 6],
    ['"abc', 4],
    ['"a\nb"', 2],
    [String.raw`"\x"`, 2],
    [String.raw`"\u12G4"`, 2],
    [String.raw`"\`, 2],
    ['{} x', 3],
    ['  ', 2],
    ['-', 0],
    ['tru', 0],
  ])('finds the first bad character of %j at %i', (input, position) => {
    expect(findJsonErrorPosition(input)).toBe(position);
    expect(() => {
      JSON.parse(input);
    }).toThrow();
  });

  it.each([
    '{}',
    '[ ]',
    String.raw` [1, -2.5e+3, 0, true, false, null, "xé\n\"\\\/\b\f\r\t"] `,
    '{"a": {"b": [ {} , [] ]}}',
  ])('returns null for valid JSON %j', (input) => {
    expect(() => {
      JSON.parse(input);
    }).not.toThrow();
    expect(findJsonErrorPosition(input)).toBeNull();
  });

  it('gives up instead of crashing when nesting overflows the stack', () => {
    expect(findJsonErrorPosition('['.repeat(1_000_000))).toBeNull();
  });
});

describe('analyzeJson', () => {
  it('returns nothing for blank input', () => {
    expect(analyzeJson('  \n ')).toEqual({ issue: null, stats: null });
  });

  it('locates an error on the right line of a real parse failure', () => {
    const { issue, stats } = analyzeJson('{\n  "a": 1,\n  "b": \n}');
    expect(stats).toBeNull();
    expect(issue?.line).toBe(4);
    expect(issue?.column).toBe(1);
  });

  it('reports object size, depth, bytes and lines', () => {
    const input = '{"a":{"b":[1,{"c":null}]},"d":"é"}';
    const { issue, stats } = analyzeJson(input);
    expect(issue).toBeNull();
    expect(stats).toEqual({
      type: 'object',
      size: 2,
      depth: 4,
      bytes: input.length + 1,
      lines: 1,
    });
  });

  it('reports array size', () => {
    expect(analyzeJson('[1,2,3]\n').stats).toMatchObject({ type: 'array', size: 3, depth: 1 });
  });

  it('reports every scalar type with depth 0', () => {
    expect(analyzeJson('"x"').stats).toMatchObject({ type: 'string', size: 0, depth: 0 });
    expect(analyzeJson('1.5').stats).toMatchObject({ type: 'number', size: 0, depth: 0 });
    expect(analyzeJson('true').stats).toMatchObject({ type: 'boolean', size: 0, depth: 0 });
    expect(analyzeJson('null').stats).toMatchObject({ type: 'null', size: 0, depth: 0 });
  });

  it('measures very deep nesting without overflowing the stack', () => {
    const depth = 5000;
    const input = '['.repeat(depth) + ']'.repeat(depth);
    expect(analyzeJson(input).stats?.depth).toBe(depth);
  });
});
