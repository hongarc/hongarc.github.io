import { Binary } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const BASE_OPTIONS = ['binary', 'octal', 'decimal', 'hex'] as const;
type BaseType = (typeof BASE_OPTIONS)[number];

const baseValues: Record<BaseType, number> = {
  binary: 2,
  octal: 8,
  decimal: 10,
  hex: 16,
};

const baseLabels: Record<BaseType, string> = {
  binary: 'Binary (base 2)',
  octal: 'Octal (base 8)',
  decimal: 'Decimal (base 10)',
  hex: 'Hexadecimal (base 16)',
};

const basePrefixes: Record<BaseType, string> = {
  binary: '0b',
  octal: '0o',
  decimal: '',
  hex: '0x',
};

// Pure function: remove common prefixes
const removePrefix = (str: string): string => str.replace(/^(0x|0X|0b|0B|0o|0O)/, '');

// Pure function: validate input for given base
const isValidForBase = (str: string, base: number): boolean => {
  const cleaned = removePrefix(str.toLowerCase());
  const validChars = new Set('0123456789abcdef'.slice(0, base));
  // eslint-disable-next-line unicorn/prefer-spread -- Safe for ASCII hex chars
  return cleaned.split('').every((c) => validChars.has(c));
};

// Pure function: parse string to number with given base
const parseNumber = (str: string, base: number): number => {
  const cleaned = removePrefix(str);
  return Number.parseInt(cleaned, base);
};

// Pure function: convert number to string with given base
const toString = (num: number, base: number): string => {
  return num.toString(base).toUpperCase();
};

// Pure function: format binary with spacing
const formatBinary = (str: string): string => {
  const padded = str.padStart(Math.ceil(str.length / 4) * 4, '0');
  return padded.match(/.{1,4}/g)?.join(' ') ?? str;
};

// Pure function: format hex with spacing
const formatHex = (str: string): string => {
  const padded = str.padStart(Math.ceil(str.length / 2) * 2, '0');
  return padded.match(/.{1,2}/g)?.join(' ') ?? str;
};

// Generate conversions object
interface BaseConversions {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
}

const convertToAllBases = (num: number): BaseConversions => {
  return {
    binary: basePrefixes.binary + formatBinary(toString(num, 2)),
    octal: basePrefixes.octal + toString(num, 8),
    decimal: toString(num, 10),
    hex: basePrefixes.hex + formatHex(toString(num, 16)),
  };
};

export const baseConverter: ToolPlugin = {
  id: 'base-converter',
  label: 'Number Base Converter',
  description: 'Convert between binary, octal, decimal, and hexadecimal',
  category: 'math',
  icon: <Binary className="h-4 w-4" />,
  keywords: ['binary', 'hex', 'octal', 'decimal', 'convert', 'base', 'number'],
  inputs: [
    {
      id: 'input',
      label: 'Input Number',
      type: 'text',
      placeholder: 'Enter a number (e.g., 255, 0xFF, 0b1010, 0o777)',
      required: true,
      helpText: 'Use 0x for hex, 0b for binary, 0o for octal, or plain number for decimal',
    },
    {
      id: 'fromBase',
      label: 'Input Base',
      type: 'select',
      defaultValue: 'decimal',
      options: [
        { value: 'binary', label: 'Binary (2)' },
        { value: 'octal', label: 'Octal (8)' },
        { value: 'decimal', label: 'Decimal (10)' },
        { value: 'hex', label: 'Hexadecimal (16)' },
      ],
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const fromBase = getSelectInput(inputs, 'fromBase', BASE_OPTIONS, 'decimal');

    if (!input) {
      return failure('Please enter a number to convert');
    }

    const base = baseValues[fromBase];

    if (!isValidForBase(input, base)) {
      return failure(`Invalid ${fromBase} number`);
    }

    try {
      const num = parseNumber(input, base);

      if (Number.isNaN(num) || !Number.isFinite(num)) {
        return failure('Invalid number');
      }

      if (num < 0) {
        return failure('Negative numbers are not supported');
      }

      const conversions = convertToAllBases(num);
      const content = [
        `Binary:  ${conversions.binary}`,
        `Octal:   ${conversions.octal}`,
        `Decimal: ${conversions.decimal}`,
        `Hex:     ${conversions.hex}`,
      ].join('\n');

      return success(content, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            { label: 'Input Base', value: baseLabels[fromBase] },
            { label: 'Decimal', value: String(num) },
          ],
          content,
          contentLabel: 'All Bases',
        },
      });
    } catch {
      return failure('Failed to convert number');
    }
  },
};
