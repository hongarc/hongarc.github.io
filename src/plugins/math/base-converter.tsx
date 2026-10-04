import { Binary } from 'lucide-react';

import { convertBase, type NumberBase } from '@/domain/math/base';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const BASE_OPTIONS = ['binary', 'octal', 'decimal', 'hex'] as const satisfies readonly NumberBase[];

const baseLabels: Record<NumberBase, string> = {
  binary: 'Binary (base 2)',
  octal: 'Octal (base 8)',
  decimal: 'Decimal (base 10)',
  hex: 'Hexadecimal (base 16)',
};

export const baseConverter: ToolPlugin = {
  id: 'base',
  label: 'Number Base Converter',
  description: 'Convert between binary, octal, decimal, and hex online',
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

    const conversions = convertBase(input, fromBase);

    if ('error' in conversions) {
      return failure(conversions.error);
    }

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
          { label: 'Decimal', value: conversions.decimal },
        ],
        content,
        contentLabel: 'All Bases',
      },
    });
  },
};
