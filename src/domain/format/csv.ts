import type { Delimiter } from './delimited';

const QUOTE = '"';

/**
 * Parse CSV/TSV text (RFC 4180) into one object per record, keyed by the header row.
 * Quoted fields may contain the delimiter, doubled quotes and newlines; empty lines are
 * skipped; short rows are padded with ''. Throws on an unterminated quoted field.
 */
export const parseDelimited = (text: string, delimiter: Delimiter): Record<string, string>[] => {
  const records: string[][] = [];
  let fields: string[] = [];
  let field = '';
  let wasQuoted = false;
  let line = 1;
  let i = 0;

  const endField = () => {
    fields.push(field);
    field = '';
    wasQuoted = false;
  };
  const endRecord = () => {
    const isEmptyLine = fields.length === 0 && field === '' && !wasQuoted;
    if (!isEmptyLine) {
      endField();
      records.push(fields);
    }
    fields = [];
    field = '';
    wasQuoted = false;
  };

  while (i < text.length) {
    const char = text.charAt(i);
    if (char === QUOTE && field === '' && !wasQuoted) {
      const startLine = line;
      wasQuoted = true;
      i++;
      for (;;) {
        if (i >= text.length) {
          throw new Error(`Unterminated quoted field on line ${String(startLine)}`);
        }
        const inner = text.charAt(i);
        if (inner === QUOTE) {
          if (text[i + 1] === QUOTE) {
            field += QUOTE;
            i += 2;
            continue;
          }
          i++;
          break;
        }
        if (inner === '\n') line++;
        field += inner;
        i++;
      }
    } else if (char === delimiter) {
      endField();
      i++;
    } else if (char === '\n' || (char === '\r' && text[i + 1] === '\n')) {
      endRecord();
      line++;
      i += char === '\n' ? 1 : 2;
    } else {
      field += char;
      i++;
    }
  }
  endRecord();

  const [header, ...rows] = records;
  if (!header) return [];
  return rows.map((row) => {
    const record: Record<string, string> = {};
    for (const [index, key] of header.entries()) {
      record[key] = row[index] ?? '';
    }
    return record;
  });
};
