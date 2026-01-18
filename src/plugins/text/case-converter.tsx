import { camelCase, constantCase, kebabCase, pascalCase, snakeCase } from 'change-case';
import { CaseSensitive } from 'lucide-react';
import { join, map, pipe, split } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import { getErrorMessage, getSelectInput, getTrimmedInput, success, failure } from '@/utils';

const CASE_OPTIONS = ['camel', 'pascal', 'snake', 'kebab', 'constant', 'upper', 'lower'] as const;
type CaseType = (typeof CASE_OPTIONS)[number];

const caseConverters: Record<CaseType, (s: string) => string> = {
  camel: camelCase,
  pascal: pascalCase,
  snake: snakeCase,
  kebab: kebabCase,
  constant: constantCase,
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
};

/**
 * Convert each line using the selected case converter
 * Uses Ramda pipe for functional composition
 */
const convertLines = (caseType: CaseType) =>
  pipe(split('\n'), map(caseConverters[caseType]), join('\n'));

export const caseConverter: ToolPlugin = {
  id: 'case',
  label: 'Case Converter',
  description: 'Convert text to camelCase, snake_case, PascalCase, kebab-case online',
  category: 'text',
  icon: <CaseSensitive className="h-4 w-4" />,
  keywords: ['case', 'camel', 'snake', 'pascal', 'kebab', 'constant', 'convert'],
  inputs: [
    {
      id: 'input',
      label: 'Input Text',
      type: 'textarea',
      placeholder: 'Enter text to convert (e.g., hello_world)',
      required: true,
      rows: 3,
    },
    {
      id: 'targetCase',
      label: 'Target Case',
      type: 'select',
      defaultValue: 'camel',
      options: [
        { value: 'camel', label: 'camelCase' },
        { value: 'pascal', label: 'PascalCase' },
        { value: 'snake', label: 'snake_case' },
        { value: 'kebab', label: 'kebab-case' },
        { value: 'constant', label: 'CONSTANT' },
        { value: 'upper', label: 'UPPER' },
        { value: 'lower', label: 'lower' },
      ],
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const targetCase = getSelectInput(inputs, 'targetCase', CASE_OPTIONS, 'camel');

    if (!input) {
      return failure('Please enter text to convert');
    }

    try {
      const result = convertLines(targetCase)(input);
      const caseLabels: Record<CaseType, string> = {
        camel: 'camelCase',
        pascal: 'PascalCase',
        snake: 'snake_case',
        kebab: 'kebab-case',
        constant: 'CONSTANT_CASE',
        upper: 'UPPER CASE',
        lower: 'lower case',
      };

      return success(result, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            { label: 'Target Case', value: caseLabels[targetCase] },
            { label: 'Lines', value: String(input.split('\n').length) },
          ],
          content: result,
          contentLabel: 'Converted',
        },
      });
    } catch (error) {
      return failure(getErrorMessage(error));
    }
  },
};
