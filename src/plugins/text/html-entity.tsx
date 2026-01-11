import { Code } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getSelectInput, getTrimmedInput, success } from '@/utils';

const MODE_OPTIONS = ['encode', 'decode'] as const;

// HTML entity map for named entities
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
  '!': '&#33;',
  '@': '&#64;',
  $: '&#36;',
  '%': '&#37;',
  '(': '&#40;',
  ')': '&#41;',
  '=': '&#61;',
  '+': '&#43;',
  '{': '&#123;',
  '}': '&#125;',
  '[': '&#91;',
  ']': '&#93;',
  '\\': '&#92;',
  '|': '&#124;',
  ';': '&#59;',
  ':': '&#58;',
  ',': '&#44;',
  '.': '&#46;',
  '/': '&#47;',
  '?': '&#63;',
  '#': '&#35;',
  '~': '&#126;',
  '^': '&#94;',
  '*': '&#42;',
  ' ': '&nbsp;',
  '\n': '&#10;',
  '\t': '&#9;',
};

// Reverse map for decoding
const REVERSE_ENTITIES: Record<string, string> = Object.fromEntries(
  Object.entries(HTML_ENTITIES).map(([char, entity]) => [entity, char])
);

// Add common named entities for decoding
const NAMED_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&bull;': '•',
  '&middot;': '·',
  '&laquo;': '«',
  '&raquo;': '»',
};

// Pure function: encode basic HTML entities (minimal - only required ones)
const encodeBasic = (text: string): string => {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

// Pure function: encode all special characters
const encodeAll = (text: string): string => {
  let result = '';
  for (const char of text) {
    result += HTML_ENTITIES[char] ?? char;
  }
  return result;
};

// Pure function: encode to numeric entities
const encodeNumeric = (text: string): string => {
  let result = '';
  for (const char of text) {
    const code = char.codePointAt(0);
    result +=
      code !== undefined && (code < 32 || code > 126 || '<>&"\''.includes(char))
        ? `&#${String(code)};`
        : char;
  }
  return result;
};

// Pure function: decode HTML entities
const decodeEntities = (text: string): string => {
  let result = text;

  // Decode named entities
  for (const [entity, char] of Object.entries({ ...REVERSE_ENTITIES, ...NAMED_ENTITIES })) {
    result = result.replaceAll(entity, char);
  }

  // Decode numeric entities (decimal)
  result = result.replaceAll(/&#(\d+);/g, (_, num: string) => {
    const code = Number.parseInt(num, 10);
    return String.fromCodePoint(code);
  });

  // Decode numeric entities (hex)
  result = result.replaceAll(/&#x([\da-f]+);/gi, (_, hex: string) => {
    const code = Number.parseInt(hex, 16);
    return String.fromCodePoint(code);
  });

  return result;
};

// Pure function: count entities in text
const countEntities = (text: string): number => {
  const matches = text.match(/&[#\w]+;/g);
  return matches?.length ?? 0;
};

export const htmlEntity: ToolPlugin = {
  id: 'html-entity',
  label: 'HTML Entity',
  description: 'Encode and decode HTML entities',
  category: 'text',
  icon: <Code className="h-4 w-4" />,
  keywords: ['html', 'entity', 'encode', 'decode', 'escape', 'unescape', 'special', 'characters'],
  inputs: [
    {
      id: 'input',
      label: 'Input',
      type: 'textarea',
      placeholder: 'Enter text to encode or HTML entities to decode...',
      required: true,
      rows: 5,
    },
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'encode',
      options: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
      ],
    },
    {
      id: 'encodeAll',
      label: 'Encode all special characters',
      type: 'checkbox',
      defaultValue: false,
      helpText: 'Encode all special characters, not just HTML-required ones',
    },
    {
      id: 'useNumeric',
      label: 'Use numeric entities',
      type: 'checkbox',
      defaultValue: false,
      helpText: 'Use &#123; format instead of named entities',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'encode');
    const encodeAllChars = getBooleanInput(inputs, 'encodeAll');
    const useNumeric = getBooleanInput(inputs, 'useNumeric');

    if (!input) {
      return failure('Please enter text to process');
    }

    let output: string;
    const isEncode = mode === 'encode';

    if (isEncode) {
      if (useNumeric) {
        output = encodeNumeric(input);
      } else if (encodeAllChars) {
        output = encodeAll(input);
      } else {
        output = encodeBasic(input);
      }
    } else {
      output = decodeEntities(input);
    }

    const entityCount = isEncode ? countEntities(output) : countEntities(input);
    const modeLabel = isEncode ? 'Encoded' : 'Decoded';

    const sectionStats: { label: string; value: string }[] = [
      { label: 'Mode', value: modeLabel },
      ...(isEncode
        ? [
            { label: 'Scope', value: encodeAllChars ? 'All chars' : 'Basic' },
            { label: 'Format', value: useNumeric ? 'Numeric' : 'Named' },
          ]
        : []),
      { label: 'Entities', value: String(entityCount) },
      { label: 'Input', value: `${String(input.length)} chars` },
      { label: 'Output', value: `${String(output.length)} chars` },
    ];

    return success(output, {
      _viewMode: 'sections',
      _sections: {
        stats: sectionStats,
        content: output,
        contentLabel: modeLabel,
      },
    });
  },
};
