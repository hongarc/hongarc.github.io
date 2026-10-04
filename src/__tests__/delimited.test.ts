import { describe, expect, it } from 'vitest';

import { toDelimited } from '@/domain/format/delimited';

const EXAMPLE =
  '[{ "name": "Alice", "age": 30, "city": "New York" }, ' +
  '{ "name": "Bob", "age": 25, "city": "London, UK" }]';

describe('Delimited (JSON to CSV/TSV)', () => {
  it('converts the ticket example exactly', () => {
    expect(toDelimited(JSON.parse(EXAMPLE), ',')).toBe(
      'name,age,city\nAlice,30,New York\nBob,25,"London, UK"'
    );
  });

  it('gives empty output for an empty array', () => {
    expect(toDelimited(JSON.parse('[]'), ',')).toBe('');
  });

  it('rejects non-array input', () => {
    expect(() => toDelimited(JSON.parse('{"a":1}'), ',')).toThrow('Input must be a JSON array');
    expect(() => toDelimited(JSON.parse('"text"'), ',')).toThrow('Input must be a JSON array');
    expect(() => toDelimited(null, ',')).toThrow('Input must be a JSON array');
  });

  it('rejects array items that are not objects', () => {
    expect(() => toDelimited([1, 2], ',')).toThrow('Array items must be objects');
    expect(() => toDelimited([{ a: 1 }, null], ',')).toThrow('Array items must be objects');
    expect(() => toDelimited([{ a: 1 }, [1]], ',')).toThrow('Array items must be objects');
  });

  it('quotes values with a quote or newline, doubling quotes', () => {
    expect(toDelimited([{ a: 'say "hi"', b: 'line1\nline2', c: 'cr\rx' }], ',')).toBe(
      'a,b,c\n"say ""hi""","line1\nline2","cr\rx"'
    );
  });

  it('quotes header names the same way', () => {
    expect(toDelimited([{ 'a,b': 1 }], ',')).toBe('"a,b"\n1');
  });

  it('writes nested objects and arrays as quoted JSON text', () => {
    expect(toDelimited([{ obj: { x: 1, y: 2 }, arr: [1, 2], one: [1] }], ',')).toBe(
      'obj,arr,one\n"{""x"":1,""y"":2}","[1,2]",[1]'
    );
  });

  it('writes null, undefined, booleans and numbers', () => {
    expect(toDelimited([{ a: null, b: true, c: 0, d: false }], ',')).toBe('a,b,c,d\n,true,0,false');
  });

  it('uses the union of keys in first-seen order and leaves missing cells empty', () => {
    expect(toDelimited([{ a: 1 }, { b: 2, a: 3 }], ',')).toBe('a,b\n1,\n3,2');
  });

  it('uses tabs for TSV and only quotes tabs, not commas', () => {
    expect(toDelimited([{ a: 'x,y', b: 'p\tq' }], '\t')).toBe('a\tb\nx,y\t"p\tq"');
  });
});
