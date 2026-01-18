import { Table } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getSelectInput, success } from '@/utils';

const MODE_OPTIONS = ['csv-to-json', 'json-to-csv'] as const;
const DELIMITER_OPTIONS = [',', ';', '\t', '|'] as const;

// Pure function: parse CSV to array of objects
const csvToJson = (csv: string, delimiter: string, hasHeader: boolean): object[] => {
  const lines = csv
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of row) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rows = lines.map((line) => parseRow(line));
  const firstRow = rows[0];
  if (!firstRow) return [];

  if (hasHeader) {
    const headers = firstRow;
    return rows.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      for (const [i, header] of headers.entries()) {
        obj[header] = row[i] ?? '';
      }
      return obj;
    });
  }

  // No header - use index as key
  return rows.map((row) => {
    const obj: Record<string, string> = {};
    for (const [i, value] of row.entries()) {
      obj[`col${String(i + 1)}`] = value;
    }
    return obj;
  });
};

// Pure function: convert JSON array to CSV
const jsonToCsv = (json: object[], delimiter: string): string => {
  if (json.length === 0) return '';

  const firstItem = json[0];
  if (!firstItem || typeof firstItem !== 'object') return '';

  const headers = Object.keys(firstItem);
  const escapeValue = (val: unknown): string => {
    let str: string;
    if (val === null || val === undefined) {
      str = '';
    } else if (typeof val === 'string') {
      str = val;
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      str = String(val);
    } else {
      str = JSON.stringify(val);
    }
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map((h) => escapeValue(h)).join(delimiter);
  const dataRows = json.map((row) => {
    const rowObj = row as Record<string, unknown>;
    return headers.map((h) => escapeValue(rowObj[h])).join(delimiter);
  });

  return [headerRow, ...dataRows].join('\n');
};

// Pure function: safely parse JSON
const parseJson = (str: string): object[] | null => {
  try {
    const parsed = JSON.parse(str) as unknown;
    if (Array.isArray(parsed)) return parsed as object[];
    if (typeof parsed === 'object' && parsed !== null) return [parsed];
    return null;
  } catch {
    return null;
  }
};

export const csvJson: ToolPlugin = {
  id: 'csv-json',
  label: 'CSV ↔ JSON',
  description: 'Convert between CSV and JSON',
  category: 'format',
  icon: <Table className="h-4 w-4" />,
  keywords: ['csv', 'json', 'convert', 'table', 'data', 'tsv', 'excel'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      placeholder: 'Paste CSV or JSON data...',
      required: true,
      rows: 8,
    },
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'csv-to-json',
      options: [
        { value: 'csv-to-json', label: 'CSV → JSON' },
        { value: 'json-to-csv', label: 'JSON → CSV' },
      ],
    },
    {
      id: 'delimiter',
      label: 'Delimiter',
      type: 'select',
      defaultValue: ',',
      options: [
        { value: ',', label: 'Comma (,)' },
        { value: ';', label: 'Semicolon (;)' },
        { value: '\t', label: 'Tab' },
        { value: '|', label: 'Pipe (|)' },
      ],
    },
    {
      id: 'hasHeader',
      label: 'First row is header',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  transformer: (inputs) => {
    const input = (inputs.input as string | undefined) ?? '';
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'csv-to-json');
    const delimiter = getSelectInput(inputs, 'delimiter', DELIMITER_OPTIONS, ',');
    const hasHeader = getBooleanInput(inputs, 'hasHeader');

    if (!input.trim()) {
      return failure('Please enter data to convert');
    }

    if (mode === 'csv-to-json') {
      const result = csvToJson(input, delimiter, hasHeader);
      if (result.length === 0) {
        return failure('No data found in CSV');
      }
      const output = JSON.stringify(result, null, 2);
      return success(output, {
        _language: 'json',
        rows: result.length,
        mode: 'CSV → JSON',
      });
    }

    // JSON to CSV
    const jsonData = parseJson(input);
    if (!jsonData) {
      return failure('Invalid JSON format');
    }
    if (jsonData.length === 0) {
      return failure('JSON array is empty');
    }

    const output = jsonToCsv(jsonData, delimiter);
    return success(output, {
      rows: jsonData.length,
      mode: 'JSON → CSV',
    });
  },
};
