import { describe, expect, it } from 'vitest';

import {
  checkAllowList,
  checkExtension,
  checkSize,
  compareDeclared,
  decodeTextHead,
  detectDelimiter,
  extensionOf,
  formatByteSize,
  parseAllowList,
  readImageSize,
  readTextFacts,
} from '@/domain/file/inspect';
import { detectType, familyOfMimetype, mimetypeOfExtension } from '@/domain/file/signature';

const bytesOf = (...values: number[]): Uint8Array => new Uint8Array(values);

const asciiBytes = (text: string): Uint8Array => new TextEncoder().encode(text);

/** A minimal ZIP local file header followed by an entry name. */
const zipWithEntry = (entryName: string): Uint8Array =>
  new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, ...asciiBytes(entryName)]);

/** OLE2 header plus a UTF-16LE stream name, as compound files store them. */
const ole2WithStream = (streamName: string): Uint8Array =>
  new Uint8Array([
    0xd0,
    0xcf,
    0x11,
    0xe0,
    0xa1,
    0xb1,
    0x1a,
    0xe1,
    ...[...asciiBytes(streamName)].flatMap((byte) => [byte, 0]),
  ]);

describe('detectType', () => {
  it('identifies a PDF by its header', () => {
    const result = detectType(asciiBytes('%PDF-1.7\nstartxref\n'));

    expect(result.family).toBe('pdf');
    expect(result.mimetypes).toContain('application/pdf');
  });

  it('identifies plain text when no signature matches', () => {
    expect(detectType(asciiBytes('name,age\nhong,30\n')).family).toBe('text');
  });

  it('separates a docx from an xlsx inside a ZIP container', () => {
    expect(detectType(zipWithEntry('word/document.xml')).label).toContain('Word');
    expect(detectType(zipWithEntry('xl/workbook.xml')).label).toContain('Excel');
  });

  it('falls back to a plain ZIP when no Office part is present', () => {
    expect(detectType(zipWithEntry('notes.txt')).family).toBe('zip');
  });

  it('separates a legacy doc from a legacy xls by stream name', () => {
    expect(detectType(ole2WithStream('WordDocument')).mimetypes).toContain('application/msword');
    expect(detectType(ole2WithStream('Workbook')).mimetypes).toContain('application/vnd.ms-excel');
  });

  it('flags an executable regardless of what it is named', () => {
    expect(detectType(bytesOf(0x4d, 0x5a, 0x90, 0x00)).family).toBe('executable');
    expect(detectType(bytesOf(0xcf, 0xfa, 0xed, 0xfe, 0x07)).family).toBe('executable');
  });

  it('treats bytes with embedded control characters as binary', () => {
    expect(detectType(bytesOf(0x61, 0x62, 0x00, 0x01, 0x63)).family).toBe('binary');
  });

  it('reports an empty file rather than guessing', () => {
    expect(detectType(new Uint8Array()).label).toContain('empty');
  });

  it('recognises UTF-16 text from its byte order mark', () => {
    const utf16 = bytesOf(0xff, 0xfe, 0x61, 0x00, 0x62, 0x00);

    expect(detectType(utf16).family).toBe('text');
    expect(detectType(utf16).label).toContain('UTF-16');
  });
});

describe('compareDeclared', () => {
  it('passes when the declared mimetype matches the bytes', () => {
    const verdict = compareDeclared('application/pdf', detectType(asciiBytes('%PDF-1.4')));

    expect(verdict.level).toBe('pass');
  });

  it('fails when a PDF is declared as text/csv', () => {
    const verdict = compareDeclared('text/csv', detectType(asciiBytes('%PDF-1.4')));

    expect(verdict.level).toBe('fail');
    expect(verdict.detail).toContain('PDF');
  });

  it('warns rather than fails when nothing was declared', () => {
    expect(compareDeclared('', detectType(asciiBytes('a,b\n1,2\n'))).level).toBe('warn');
  });

  it('warns when the declared mimetype maps to no known family', () => {
    expect(compareDeclared('application/x-custom', detectType(asciiBytes('hi'))).level).toBe(
      'warn'
    );
  });

  it('accepts either Office spelling for a legacy spreadsheet', () => {
    const xls = detectType(ole2WithStream('Workbook'));

    expect(compareDeclared('application/vnd.ms-excel', xls).level).toBe('pass');
    expect(compareDeclared('application/msword', xls).level).toBe('pass');
  });
});

describe('checkExtension', () => {
  it('passes for the expected extension and mimetype pair', () => {
    expect(checkExtension('report.csv', 'text/csv').level).toBe('pass');
  });

  it('warns when Excel claims a csv, without calling it a failure', () => {
    const verdict = checkExtension('report.csv', 'application/vnd.ms-excel');

    expect(verdict.level).toBe('warn');
    expect(verdict.detail).toContain('text/csv');
  });

  it('warns when the name has no extension', () => {
    expect(checkExtension('README', '').summary).toBe('no extension');
  });
});

describe('parseAllowList and checkAllowList', () => {
  it('splits on commas and whitespace, lower-casing entries', () => {
    expect(parseAllowList(' TEXT/CSV , application/pdf\n.XLSX ')).toEqual([
      'text/csv',
      'application/pdf',
      '.xlsx',
    ]);
  });

  it('returns null when no allow-list was supplied', () => {
    expect(checkAllowList(' '.repeat(3), 'a.csv', 'text/csv')).toBeNull();
  });

  it('matches an exact mimetype', () => {
    expect(checkAllowList('text/csv, application/pdf', 'a.csv', 'text/csv')?.level).toBe('pass');
  });

  it('matches a wildcard mimetype', () => {
    expect(checkAllowList('image/*', 'a.png', 'image/png')?.level).toBe('pass');
  });

  it('matches on extension when the browser declared nothing', () => {
    const verdict = checkAllowList('.xlsx, .csv', 'sheet.xlsx', '');

    expect(verdict?.level).toBe('pass');
    expect(verdict?.summary).toContain('.xlsx');
  });

  it('fails when neither the mimetype nor the extension is listed', () => {
    expect(checkAllowList('text/csv', 'payload.exe', 'application/octet-stream')?.level).toBe(
      'fail'
    );
  });
});

describe('checkSize', () => {
  it('returns null when no limit was set', () => {
    expect(checkSize(1024, 0)).toBeNull();
  });

  it('passes at exactly the limit', () => {
    expect(checkSize(1024 * 1024, 1)?.level).toBe('pass');
  });

  it('fails one byte over the limit', () => {
    expect(checkSize(1024 * 1024 + 1, 1)?.level).toBe('fail');
  });
});

describe('readTextFacts', () => {
  it('reports a UTF-8 byte order mark', () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...asciiBytes('a,b\n1,2\n')]);
    const text = decodeTextHead(bytes) ?? '';
    const facts = readTextFacts(bytes, text);

    expect(facts.encoding).toBe('UTF-8 with byte order mark');
    expect(facts.hasBom).toBe(true);
  });

  it('describes CRLF and LF line endings', () => {
    const crlf = asciiBytes('a,b\r\n1,2\r\n');
    expect(readTextFacts(crlf, decodeTextHead(crlf) ?? '').lineEndings).toBe('CRLF (Windows)');

    const lf = asciiBytes('a,b\n1,2\n');
    expect(readTextFacts(lf, decodeTextHead(lf) ?? '').lineEndings).toBe('LF (Unix)');
  });

  it('reports mixed line endings', () => {
    const mixed = asciiBytes('a\r\nb\nc\n');

    expect(readTextFacts(mixed, decodeTextHead(mixed) ?? '').lineEndings).toContain('mixed');
  });

  it('counts only non-empty sampled lines', () => {
    const bytes = asciiBytes('a,b\n\n1,2\n');

    expect(readTextFacts(bytes, decodeTextHead(bytes) ?? '').sampledLines).toBe(2);
  });

  it('strips the byte order mark from the decoded text', () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...asciiBytes('id\n1\n')]);

    expect(decodeTextHead(bytes)?.startsWith('id')).toBe(true);
  });
});

describe('detectDelimiter', () => {
  it('finds a consistent comma delimiter', () => {
    const result = detectDelimiter(['a,b,c', '1,2,3', '4,5,6']);

    expect(result).toEqual({ name: 'comma', columns: 3, consistent: true });
  });

  it('prefers semicolons when they are the real separator', () => {
    expect(detectDelimiter(['a;b;c', '1;2;3'])?.name).toBe('semicolon');
  });

  it('marks an uneven column count as inconsistent', () => {
    expect(detectDelimiter(['a,b,c', '1,2'])?.consistent).toBe(false);
  });

  it('returns null for prose with no delimiter', () => {
    expect(detectDelimiter(['just a sentence', 'and another'])).toBeNull();
  });

  it('returns null for an empty sample', () => {
    expect(detectDelimiter([])).toBeNull();
  });
});

describe('readImageSize', () => {
  it('reads PNG dimensions from the IHDR chunk', () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    png.set([0x00, 0x00, 0x01, 0x40], 16); // width 320
    png.set([0x00, 0x00, 0x00, 0xf0], 20); // height 240

    expect(readImageSize(png)).toEqual({ width: 320, height: 240 });
  });

  it('reads GIF dimensions little-endian', () => {
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x40, 0x01, 0xf0, 0x00]);

    expect(readImageSize(gif)).toEqual({ width: 320, height: 240 });
  });

  it('reads JPEG dimensions from the frame header', () => {
    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0xf0,
      0x01, 0x40, 0x03,
    ]);

    expect(readImageSize(jpeg)).toEqual({ width: 320, height: 240 });
  });

  it('returns null for a non-image', () => {
    expect(readImageSize(asciiBytes('%PDF-1.7'))).toBeNull();
  });
});

describe('small helpers', () => {
  it('extracts a lower-cased extension', () => {
    expect(extensionOf('Report.CSV')).toBe('csv');
    expect(extensionOf('archive.tar.gz')).toBe('gz');
    expect(extensionOf('Makefile')).toBe('');
  });

  it('formats byte counts across units', () => {
    expect(formatByteSize(512)).toBe('512 B');
    expect(formatByteSize(1024)).toBe('1.0 KB');
    expect(formatByteSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatByteSize(1024 * 1024 * 1024)).toBe('1.00 GB');
  });

  it('maps mimetypes to families and extensions to mimetypes', () => {
    expect(familyOfMimetype('APPLICATION/PDF')).toBe('pdf');
    expect(familyOfMimetype('application/unknown-thing')).toBeNull();
    expect(mimetypeOfExtension('.XLSX')).toContain('spreadsheetml');
    expect(mimetypeOfExtension('nope')).toBeNull();
  });
});
