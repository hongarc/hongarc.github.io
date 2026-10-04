import { ArrowLeftRight } from 'lucide-react';

import { parseDelimited } from '@/domain/format/csv';
import { toDelimited } from '@/domain/format/delimited';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const FORMAT_OPTIONS = ['json', 'yaml', 'csv', 'tsv'] as const;
type Format = (typeof FORMAT_OPTIONS)[number];

// yaml is ~260 kB of source and only the formats below need it, so it loads on
// demand — which makes parsing and conversion async.
const loadYaml = () => import('yaml');

// Parse input based on format
const parseInput = async (input: string, format: Format): Promise<unknown> => {
  switch (format) {
    case 'json': {
      return JSON.parse(input);
    }
    case 'yaml': {
      const { parse } = await loadYaml();
      return parse(input);
    }
    case 'csv':
    case 'tsv': {
      return parseDelimited(input, format === 'csv' ? ',' : '\t');
    }
  }
};

// Convert data to output format
const convertTo = async (data: unknown, format: Format, indent: number): Promise<string> => {
  switch (format) {
    case 'json': {
      return JSON.stringify(data, null, indent);
    }
    case 'yaml': {
      const { stringify } = await loadYaml();
      return stringify(data, { indent });
    }
    case 'csv':
    case 'tsv': {
      return toDelimited(data, format === 'csv' ? ',' : '\t');
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
  isAsync: true,
  transformer: async (inputs) => {
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
      const data = await parseInput(input, fromFormat);
      const output = await convertTo(data, toFormat, indent);

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
