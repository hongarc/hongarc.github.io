import { describe, expect, it } from 'vitest';

import { parseDelimited } from '@/domain/format/csv';
import { toDelimited } from '@/domain/format/delimited';
import { dataConverter } from '@/plugins/format/data-converter';

const convert = async (input: string, fromFormat: string, toFormat: string) =>
  dataConverter.transformer({ input, fromFormat, toFormat, indent: '2' });

describe('Data Converter CSV reading', () => {
  it('reads back the CSV it wrote for commas and quotes', async () => {
    const json = JSON.stringify([{ name: 'Smith, John', note: 'said "hi"' }]);
    const csv = await convert(json, 'json', 'csv');
    expect(csv.success).toBe(true);
    expect(csv.output).toBe('name,note\n"Smith, John","said ""hi"""');

    const back = await convert(csv.output ?? '', 'csv', 'json');
    expect(JSON.parse(back.output ?? '')).toEqual([{ name: 'Smith, John', note: 'said "hi"' }]);
  });

  it('handles CRLF CSV without stray carriage returns', async () => {
    const result = await convert('a,b\r\n1,2\r\n', 'csv', 'json');
    expect(JSON.parse(result.output ?? '')).toEqual([{ a: '1', b: '2' }]);
  });

  it('reports an unterminated quote as invalid input', async () => {
    const result = await convert('a\n"oops', 'csv', 'json');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unterminated quoted field on line 2');
  });
});

describe('parseDelimited', () => {
  it('reads quoted commas and doubled quotes', () => {
    expect(parseDelimited('name,note\n"Smith, John","said ""hi"""', ',')).toEqual([
      { name: 'Smith, John', note: 'said "hi"' },
    ]);
  });

  it('reads newlines inside quoted fields', () => {
    expect(parseDelimited('a,b\n"line1\nline2",x', ',')).toEqual([{ a: 'line1\nline2', b: 'x' }]);
  });

  it('accepts CRLF line endings and a trailing newline', () => {
    expect(parseDelimited('a,b\r\n1,2\r\n', ',')).toEqual([{ a: '1', b: '2' }]);
  });

  it('keeps CRLF inside quoted fields', () => {
    expect(parseDelimited('a\r\n"x\r\ny"\r\n', ',')).toEqual([{ a: 'x\r\ny' }]);
  });

  it('fills missing fields with an empty string', () => {
    expect(parseDelimited('a,b,c\n1', ',')).toEqual([{ a: '1', b: '', c: '' }]);
  });

  it('ignores fields beyond the header', () => {
    expect(parseDelimited('a\n1,2', ',')).toEqual([{ a: '1' }]);
  });

  it('skips empty lines', () => {
    expect(parseDelimited('a,b\n\n1,2\n\n\n3,4\n', ',')).toEqual([
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ]);
  });

  it('keeps a line holding only an empty quoted field', () => {
    expect(parseDelimited('a\n""\n', ',')).toEqual([{ a: '' }]);
  });

  it('keeps empty unquoted fields between delimiters', () => {
    expect(parseDelimited('a,b,c\n,,', ',')).toEqual([{ a: '', b: '', c: '' }]);
  });

  it('returns no rows for empty text or a header only', () => {
    expect(parseDelimited('', ',')).toEqual([]);
    expect(parseDelimited('a,b', ',')).toEqual([]);
  });

  it('treats a quote inside an unquoted field as a literal character', () => {
    expect(parseDelimited('a\nx"y', ',')).toEqual([{ a: 'x"y' }]);
  });

  it('reads TSV with a tab inside quotes', () => {
    expect(parseDelimited('a\tb\n"x\ty"\tz', '\t')).toEqual([{ a: 'x\ty', b: 'z' }]);
  });

  it('does not split TSV on commas', () => {
    expect(parseDelimited('a\tb\nx,y\tz', '\t')).toEqual([{ a: 'x,y', b: 'z' }]);
  });

  it('throws with the line where the unterminated quote opened', () => {
    expect(() => parseDelimited('a\n"oops', ',')).toThrow('Unterminated quoted field on line 2');
  });

  it('counts newlines and blank lines when reporting the line', () => {
    expect(() => parseDelimited('a,b\n\n"x\ny",1\n"oops\nmore', ',')).toThrow(
      'Unterminated quoted field on line 5'
    );
  });

  it('throws when the closing quote is missing after a doubled quote', () => {
    expect(() => parseDelimited('a\n"x""', ',')).toThrow('Unterminated quoted field on line 2');
  });

  it('round-trips string values with commas, quotes and newlines', () => {
    const original = [
      { name: 'Smith, John', note: 'said "hi"', other: 'line1\nline2' },
      { name: '"quoted"', note: 'a,b,"c"\nd', other: '' },
      { name: 'plain', note: ',', other: '""' },
    ];
    for (const delimiter of [',', '\t'] as const) {
      expect(parseDelimited(toDelimited(original, delimiter), delimiter)).toEqual(original);
    }
  });
});
