import { Braces } from 'lucide-react';

import type { IndentType } from '@/domain/format/json';
import { formatJson } from '@/domain/format/json';
import type { ToolPlugin } from '@/types/plugin';
import {
  failure,
  getBooleanInput,
  getErrorMessage,
  getSelectInput,
  getTrimmedInput,
  success,
} from '@/utils';

const INDENT_OPTIONS = ['2', '4', 'tab', '0'] as const;
const VIEW_OPTIONS = ['raw', 'tree'] as const;

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
      sensitive: true,
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
      const formatted = formatJson(input, indent as IndentType, sortKeys);
      const parsed: unknown = JSON.parse(formatted);

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
