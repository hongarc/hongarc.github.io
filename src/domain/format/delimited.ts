import { isPlainObject } from './json';

export type Delimiter = ',' | '\t';

const cellText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return (value as string | number | boolean).toString();
};

const escapeCell = (text: string, delimiter: Delimiter): string =>
  text.includes(delimiter) || /["\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;

/**
 * Convert an array of objects to CSV/TSV: header row from the union of keys
 * (first-seen order), one line per object, nested values as JSON text.
 */
export const toDelimited = (data: unknown, delimiter: Delimiter): string => {
  if (!Array.isArray(data)) {
    throw new TypeError('Input must be a JSON array');
  }
  const items = data as readonly unknown[];
  if (items.length === 0) return '';

  const records: Record<string, unknown>[] = [];
  for (const item of items) {
    if (!isPlainObject(item)) {
      throw new TypeError('Array items must be objects');
    }
    records.push(item);
  }

  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  const lines = [
    headers.map((header) => escapeCell(header, delimiter)),
    ...records.map((record) =>
      headers.map((header) => escapeCell(cellText(record[header]), delimiter))
    ),
  ];
  return lines.map((cells) => cells.join(delimiter)).join('\n');
};
