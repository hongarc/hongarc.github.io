import { ArrowLeftRight } from 'lucide-react';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const FORMAT_OPTIONS = ['json', 'yaml', 'csv', 'tsv'] as const;
type Format = (typeof FORMAT_OPTIONS)[number];

// Parse input based on format
const parseInput = (input: string, format: Format): unknown => {
  switch (format) {
    case 'json': {
      return JSON.parse(input);
    }
    case 'yaml': {
      return parseYaml(input);
    }
    case 'csv':
    case 'tsv': {
      const delimiter = format === 'csv' ? ',' : '\t';
      const lines = input.trim().split('\n');
      if (lines.length === 0) return [];

      const headers = lines[0]?.split(delimiter).map((h) => h.trim()) ?? [];
      const data: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]?.split(delimiter) ?? [];
        const row: Record<string, string> = {};
        for (const [idx, header] of headers.entries()) {
          row[header] = values[idx]?.trim() ?? '';
        }
        data.push(row);
      }
      return data;
    }
  }
};

// Convert data to output format
const convertTo = (data: unknown, format: Format, indent: number): string => {
  switch (format) {
    case 'json': {
      return JSON.stringify(data, null, indent);
    }
    case 'yaml': {
      return stringifyYaml(data, { indent });
    }
    case 'csv':
    case 'tsv': {
      const delimiter = format === 'csv' ? ',' : '\t';

      if (!Array.isArray(data)) {
        throw new TypeError('Data must be an array for CSV/TSV output');
      }

      if (data.length === 0) return '';

      const arrayData = data as unknown[];
      const firstItem = arrayData[0];
      if (typeof firstItem !== 'object' || firstItem === null) {
        throw new Error('Array items must be objects for CSV/TSV output');
      }

      const headers = Object.keys(firstItem as Record<string, unknown>);
      const lines: string[] = [headers.join(delimiter)];

      for (const item of arrayData) {
        if (typeof item !== 'object' || item === null) continue;
        const record = item as Record<string, unknown>;
        const row = headers.map((h) => {
          const val = record[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          if (typeof val === 'string') {
            if (val.includes(delimiter) || val.includes('"') || val.includes('\n')) {
              return `"${val.replaceAll('"', '""')}"`;
            }
            return val;
          }
          // number, boolean, bigint, symbol - convert via native toString
          return (val as number | boolean).toString();
        });
        lines.push(row.join(delimiter));
      }

      return lines.join('\n');
    }
  }
};

// Get sample data for template
const getSampleData = (format: Format): string => {
  switch (format) {
    case 'json': {
      return `[
  { "name": "Alice", "age": 30, "city": "New York" },
  { "name": "Bob", "age": 25, "city": "London" }
]`;
    }
    case 'yaml': {
      return `- name: Alice
  age: 30
  city: New York
- name: Bob
  age: 25
  city: London`;
    }
    case 'csv': {
      return `name,age,city
Alice,30,New York
Bob,25,London`;
    }
    case 'tsv': {
      return `name\tage\tcity
Alice\t30\tNew York
Bob\t25\tLondon`;
    }
  }
};

export const dataConverter: ToolPlugin = {
  id: 'data',
  label: 'Data Converter',
  description: 'Convert between JSON, YAML, CSV, and TSV formats online',
  category: 'format',
  icon: <ArrowLeftRight className="h-4 w-4" />,
  keywords: ['json', 'yaml', 'csv', 'tsv', 'convert', 'transform', 'data', 'format'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      placeholder: 'Paste your data here...',
      required: true,
      rows: 6,
    },
    {
      id: 'fromFormat',
      label: 'From',
      type: 'select',
      defaultValue: 'json',
      options: [
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'csv', label: 'CSV' },
        { value: 'tsv', label: 'TSV' },
      ],
      group: 'row1',
    },
    {
      id: 'toFormat',
      label: 'To',
      type: 'select',
      defaultValue: 'yaml',
      options: [
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'csv', label: 'CSV' },
        { value: 'tsv', label: 'TSV' },
      ],
      group: 'row1',
    },
    {
      id: 'indent',
      label: 'Indent',
      type: 'select',
      defaultValue: '2',
      options: [
        { value: '2', label: '2 sp' },
        { value: '4', label: '4 sp' },
      ],
      group: 'row1',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const fromFormat = getSelectInput(inputs, 'fromFormat', FORMAT_OPTIONS, 'json');
    const toFormat = getSelectInput(inputs, 'toFormat', FORMAT_OPTIONS, 'yaml');
    const indent = Number(inputs.indent) || 2;

    if (!input) {
      // Return sample data as hint
      const sample = getSampleData(fromFormat);
      return failure(`Please enter ${fromFormat.toUpperCase()} data. Example:\n\n${sample}`);
    }

    try {
      const data = parseInput(input, fromFormat);
      const output = convertTo(data, toFormat, indent);

      // Map format to highlight language
      const languageMap: Record<Format, string> = {
        json: 'json',
        yaml: 'yaml',
        csv: 'plain',
        tsv: 'plain',
      };

      return success(output, {
        _language: languageMap[toFormat],
        from: fromFormat.toUpperCase(),
        to: toFormat.toUpperCase(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversion failed';
      return failure(`Invalid ${fromFormat.toUpperCase()}: ${message}`);
    }
  },
};
