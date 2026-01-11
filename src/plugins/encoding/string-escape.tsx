import { Quote } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, success } from '@/utils';

const MODE_OPTIONS = ['escape', 'unescape'] as const;
const FORMAT_OPTIONS = ['javascript', 'json', 'html', 'url', 'sql'] as const;

// Pure function: escape for JavaScript
const escapeJs = (str: string): string => {
  return str
    .replaceAll('\\', '\\\\')
    .replaceAll("'", String.raw`\'`)
    .replaceAll('"', String.raw`\"`)
    .replaceAll('\n', String.raw`\n`)
    .replaceAll('\r', String.raw`\r`)
    .replaceAll('\t', String.raw`\t`)
    .replaceAll('\b', String.raw`\b`)
    .replaceAll('\f', String.raw`\f`);
};

// Pure function: unescape JavaScript
const unescapeJs = (str: string): string => {
  return str
    .replaceAll(String.raw`\n`, '\n')
    .replaceAll(String.raw`\r`, '\r')
    .replaceAll(String.raw`\t`, '\t')
    .replaceAll(String.raw`\b`, '\b')
    .replaceAll(String.raw`\f`, '\f')
    .replaceAll(String.raw`\'`, "'")
    .replaceAll(String.raw`\"`, '"')
    .replaceAll('\\\\', '\\');
};

// Pure function: escape for JSON
const escapeJson = (str: string): string => {
  return JSON.stringify(str).slice(1, -1);
};

// Pure function: unescape JSON
const unescapeJson = (str: string): string => {
  try {
    return JSON.parse(`"${str}"`) as string;
  } catch {
    return str;
  }
};

// Pure function: escape HTML
const escapeHtml = (str: string): string => {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

// Pure function: unescape HTML
const unescapeHtml = (str: string): string => {
  return str
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ');
};

// Pure function: escape URL
const escapeUrl = (str: string): string => {
  return encodeURIComponent(str);
};

// Pure function: unescape URL
const unescapeUrl = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
};

// Pure function: escape SQL
const escapeSql = (str: string): string => {
  return str.replaceAll("'", "''").replaceAll('\\', '\\\\');
};

// Pure function: unescape SQL
const unescapeSql = (str: string): string => {
  return str.replaceAll("''", "'").replaceAll('\\\\', '\\');
};

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
      rows: 6,
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
    },
    {
      id: 'format',
      label: 'Format',
      type: 'select',
      defaultValue: 'javascript',
      options: [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'json', label: 'JSON' },
        { value: 'html', label: 'HTML' },
        { value: 'url', label: 'URL' },
        { value: 'sql', label: 'SQL' },
      ],
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
