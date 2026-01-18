import { Hash } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const FORMAT_OPTIONS = ['thousands', 'currency', 'percent', 'scientific', 'bytes'] as const;
const LOCALE_OPTIONS = ['en-US', 'de-DE', 'fr-FR', 'ja-JP', 'vi-VN'] as const;

// Pure function: format with thousands separator
const formatThousands = (num: number, locale: string): string => {
  return num.toLocaleString(locale);
};

// Pure function: format as currency
const formatCurrency = (num: number, locale: string): string => {
  const currencyMap: Record<string, string> = {
    'en-US': 'USD',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'ja-JP': 'JPY',
    'vi-VN': 'VND',
  };
  return num.toLocaleString(locale, {
    style: 'currency',
    currency: currencyMap[locale] ?? 'USD',
  });
};

// Pure function: format as percent
const formatPercent = (num: number, locale: string): string => {
  return num.toLocaleString(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Pure function: format as scientific
const formatScientific = (num: number): string => {
  return num.toExponential(4);
};

// Pure function: format as bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const base = 1024;
  const exponent = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(base)),
    units.length - 1
  );
  const value = bytes / Math.pow(base, exponent);

  return `${value.toFixed(2)} ${units[exponent] ?? 'B'}`;
};

// Pure function: parse number from string
const parseNumber = (input: string): number | null => {
  // Remove common separators and try to parse
  const cleaned = input.replaceAll(/[\s,_]/g, '').replace(',', '.');
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
};

export const numberFormatter: ToolPlugin = {
  id: 'number',
  label: 'Number Formatter',
  description: 'Format numbers with currency, percentage, and locale options online',
  category: 'math',
  icon: <Hash className="h-4 w-4" />,
  keywords: ['number', 'format', 'currency', 'percent', 'bytes', 'thousands', 'comma'],
  inputs: [
    {
      id: 'input',
      label: 'Number',
      type: 'text',
      placeholder: '1234567.89',
      required: true,
    },
    {
      id: 'format',
      label: 'Format',
      type: 'select',
      defaultValue: 'thousands',
      options: [
        { value: 'thousands', label: 'Thousands' },
        { value: 'currency', label: 'Currency' },
        { value: 'percent', label: 'Percent' },
        { value: 'scientific', label: 'Scientific' },
        { value: 'bytes', label: 'Bytes' },
      ],
    },
    {
      id: 'locale',
      label: 'Locale',
      type: 'select',
      defaultValue: 'en-US',
      options: [
        { value: 'en-US', label: 'English (US)' },
        { value: 'de-DE', label: 'German' },
        { value: 'fr-FR', label: 'French' },
        { value: 'ja-JP', label: 'Japanese' },
        { value: 'vi-VN', label: 'Vietnamese' },
      ],
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const format = getSelectInput(inputs, 'format', FORMAT_OPTIONS, 'thousands');
    const locale = getSelectInput(inputs, 'locale', LOCALE_OPTIONS, 'en-US');

    if (!input) {
      return failure('Please enter a number');
    }

    const num = parseNumber(input);
    if (num === null) {
      return failure('Invalid number format');
    }

    const allFormats = {
      thousands: formatThousands(num, locale),
      currency: formatCurrency(num, locale),
      percent: formatPercent(num, locale),
      scientific: formatScientific(num),
      bytes: formatBytes(num),
    };

    const output = allFormats[format];
    const formatLabels: Record<typeof format, string> = {
      thousands: 'Thousands',
      currency: 'Currency',
      percent: 'Percent',
      scientific: 'Scientific',
      bytes: 'Bytes',
    };

    const otherFormats = [
      `Thousands:  ${allFormats.thousands}`,
      `Currency:   ${allFormats.currency}`,
      `Percent:    ${allFormats.percent}`,
      `Scientific: ${allFormats.scientific}`,
      `Bytes:      ${allFormats.bytes}`,
    ].join('\n');

    return success(otherFormats, {
      _viewMode: 'sections',
      _sections: {
        stats: [
          { label: 'Format', value: formatLabels[format] },
          { label: 'Locale', value: locale },
          { label: 'Result', value: output },
        ],
        content: otherFormats,
        contentLabel: 'All Formats',
      },
    });
  },
};
