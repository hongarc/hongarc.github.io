import { Braces } from 'lucide-react';
import { sortBy, identity } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import {
  getBooleanInput,
  getErrorMessage,
  getSelectInput,
  getTrimmedInput,
  success,
  failure,
} from '@/utils';

const INDENT_OPTIONS = ['2', '4', 'tab', '0'] as const;
type IndentType = (typeof INDENT_OPTIONS)[number];

const VIEW_OPTIONS = ['raw', 'tree'] as const;

/**
 * Type guard for plain objects
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Recursively sort object keys alphabetically
 */
const sortObjectKeys = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((item) => sortObjectKeys(item));
  }
  if (isPlainObject(obj)) {
    const sortedKeys = sortBy(identity, Object.keys(obj));
    const sorted: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      sorted[key] = sortObjectKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
};

/**
 * Get indentation value from option
 */
const getIndentValue = (indent: IndentType): string | number => {
  if (indent === 'tab') return '\t';
  return Number(indent);
};

export const jsonFormatter: ToolPlugin = {
  id: 'json-formatter',
  label: 'JSON Formatter',
  description: 'Format, minify, or validate JSON data',
  category: 'format',
  icon: <Braces className="h-4 w-4" />,
  keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty'],
  inputs: [
    {
      id: 'input',
      label: 'JSON Input',
      type: 'textarea',
      placeholder: '{"key": "value"}',
      required: true,
      rows: 8,
    },
    {
      id: 'viewMode',
      label: 'View',
      type: 'select',
      defaultValue: 'raw',
      options: [
        { value: 'raw', label: 'Raw' },
        { value: 'tree', label: 'Tree' },
      ],
    },
    {
      id: 'indent',
      label: 'Indent',
      type: 'select',
      defaultValue: '2',
      options: [
        { value: '2', label: '2' },
        { value: '4', label: '4' },
        { value: 'tab', label: 'Tab' },
        { value: '0', label: 'Min' },
      ],
    },
    {
      id: 'sortKeys',
      label: 'Sort Keys',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const viewMode = getSelectInput(inputs, 'viewMode', VIEW_OPTIONS, 'raw');
    const indent = getSelectInput(inputs, 'indent', INDENT_OPTIONS, '2');
    const sortKeys = getBooleanInput(inputs, 'sortKeys');

    if (!input) {
      return failure('Please enter JSON to format');
    }

    try {
      let parsed: unknown = JSON.parse(input);

      if (sortKeys) {
        parsed = sortObjectKeys(parsed);
      }

      const indentValue = getIndentValue(indent);
      const formatted = JSON.stringify(parsed, null, indentValue);

      return success(formatted, {
        _viewMode: viewMode,
        _parsedJson: parsed,
        characters: formatted.length,
        lines: formatted.split('\n').length,
      });
    } catch (error) {
      return failure(`Invalid JSON: ${getErrorMessage(error)}`);
    }
  },
};
