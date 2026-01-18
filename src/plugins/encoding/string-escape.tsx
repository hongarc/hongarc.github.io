import { Quote } from 'lucide-react';

import {
  escapeHtml,
  escapeJs,
  escapeJson,
  escapeSql,
  escapeUrl,
  unescapeHtml,
  unescapeJs,
  unescapeJson,
  unescapeSql,
  unescapeUrl,
} from '@/domain/encoding/escape';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, success } from '@/utils';

const MODE_OPTIONS = ['escape', 'unescape'] as const;
const FORMAT_OPTIONS = ['javascript', 'json', 'html', 'url', 'sql'] as const;

export const stringEscape: ToolPlugin = {
  id: 'string-escape',
  label: 'String Escape',
  description: 'Escape and unescape strings',
  category: 'encoding',
  icon: <Quote className="h-4 w-4" />,
  keywords: ['escape', 'unescape', 'string', 'quote', 'javascript', 'json', 'html', 'sql'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      placeholder: 'Enter string to escape or unescape...',
      required: true,
      rows: 4,
    },
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'escape',
      options: [
        { value: 'escape', label: 'Escape' },
        { value: 'unescape', label: 'Unescape' },
      ],
      group: 'options',
    },
    {
      id: 'format',
      label: 'Format',
      type: 'select',
      defaultValue: 'javascript',
      options: [
        { value: 'javascript', label: 'JS' },
        { value: 'json', label: 'JSON' },
        { value: 'html', label: 'HTML' },
        { value: 'url', label: 'URL' },
        { value: 'sql', label: 'SQL' },
      ],
      group: 'options',
    },
  ],
  transformer: (inputs) => {
    const input = (inputs.input as string | undefined) ?? '';
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'escape');
    const format = getSelectInput(inputs, 'format', FORMAT_OPTIONS, 'javascript');

    if (!input) {
      return failure('Please enter a string');
    }

    let output: string;
    const isEscape = mode === 'escape';

    switch (format) {
      case 'javascript': {
        output = isEscape ? escapeJs(input) : unescapeJs(input);
        break;
      }
      case 'json': {
        output = isEscape ? escapeJson(input) : unescapeJson(input);
        break;
      }
      case 'html': {
        output = isEscape ? escapeHtml(input) : unescapeHtml(input);
        break;
      }
      case 'url': {
        output = isEscape ? escapeUrl(input) : unescapeUrl(input);
        break;
      }
      case 'sql': {
        output = isEscape ? escapeSql(input) : unescapeSql(input);
        break;
      }
    }

    const modeLabel = isEscape ? 'Escaped' : 'Unescaped';
    const formatLabel = format.charAt(0).toUpperCase() + format.slice(1);

    return success(output, {
      _viewMode: 'sections',
      _sections: {
        stats: [
          { label: 'Mode', value: modeLabel },
          { label: 'Format', value: formatLabel },
          { label: 'Input', value: `${String(input.length)} chars` },
          { label: 'Output', value: `${String(output.length)} chars` },
        ],
        content: output,
        contentLabel: modeLabel,
      },
    });
  },
};
