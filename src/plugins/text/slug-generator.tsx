import { Link } from 'lucide-react';

import { createSlug, type SeparatorType, separators } from '@/domain/generators/slug';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, success } from '@/utils';

const SEPARATOR_OPTIONS = ['dash', 'underscore', 'dot'] as const;

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
