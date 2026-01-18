import { Link } from 'lucide-react';
import { pipe, toLower, trim } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const SEPARATOR_OPTIONS = ['dash', 'underscore', 'dot'] as const;
type SeparatorType = (typeof SEPARATOR_OPTIONS)[number];

const separators: Record<SeparatorType, string> = {
  dash: '-',
  underscore: '_',
  dot: '.',
};

// Pure function: remove accents/diacritics
const removeAccents = (str: string): string =>
  str.normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '');

// Pure function: remove special characters
const removeSpecialChars = (str: string): string => str.replaceAll(/[^\w\s-]/g, '');

// Pure function: collapse whitespace
const collapseWhitespace = (str: string): string => str.replaceAll(/\s+/g, ' ');

// Pure function: replace spaces with separator
const replaceSpaces =
  (separator: string) =>
  (str: string): string =>
    str.replaceAll(/\s/g, separator);

// Pure function: collapse repeated separators
const collapseSeparators =
  (separator: string) =>
  (str: string): string =>
    str.replaceAll(new RegExp(`${separator}+`, 'g'), separator);

// Pure function: trim separators from ends
const trimSeparators =
  (separator: string) =>
  (str: string): string =>
    str.replaceAll(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

// Compose slug transformation using Ramda pipe
const createSlug = (separator: string) =>
  pipe(
    trim,
    toLower,
    removeAccents,
    removeSpecialChars,
    collapseWhitespace,
    replaceSpaces(separator),
    collapseSeparators(separator),
    trimSeparators(separator)
  );

export const slugGenerator: ToolPlugin = {
  id: 'slug',
  label: 'Slug Generator',
  description: 'Convert text to URL-friendly slugs online',
  category: 'text',
  icon: <Link className="h-4 w-4" />,
  keywords: ['slug', 'url', 'seo', 'friendly', 'permalink', 'kebab'],
  inputs: [
    {
      id: 'input',
      label: 'Input Text',
      type: 'textarea',
      placeholder: 'Enter title or text to convert (e.g., "Hello World! This is a Test")',
      required: true,
      rows: 3,
    },
    {
      id: 'separator',
      label: 'Separator',
      type: 'select',
      defaultValue: 'dash',
      options: [
        { value: 'dash', label: 'Dash (kebab-case)' },
        { value: 'underscore', label: 'Underscore (snake_case)' },
        { value: 'dot', label: 'Dot (dot.case)' },
      ],
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const separator = getSelectInput(inputs, 'separator', SEPARATOR_OPTIONS, 'dash');

    if (!input) {
      return failure('Please enter text to convert');
    }

    try {
      const sep = separators[separator];
      const slug = createSlug(sep)(input);
      const sepLabels: Record<SeparatorType, string> = {
        dash: 'Dash (-)',
        underscore: 'Underscore (_)',
        dot: 'Dot (.)',
      };

      return success(slug, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            { label: 'Separator', value: sepLabels[separator] },
            { label: 'Original', value: `${String(input.length)} chars` },
            { label: 'Slug', value: `${String(slug.length)} chars` },
          ],
          content: slug,
          contentLabel: 'Generated Slug',
        },
      });
    } catch {
      return failure('Failed to generate slug');
    }
  },
};
