import { FileText } from 'lucide-react';

import { loremGenerators } from '@/domain/generators/lorem';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getNumberInput, getSelectInput, success } from '@/utils';

const TYPE_OPTIONS = ['words', 'sentences', 'paragraphs'] as const;

export const loremIpsum: ToolPlugin = {
  id: 'lorem',
  label: 'Lorem Ipsum Generator',
  description: 'Generate lorem ipsum placeholder text online',
  category: 'text',
  icon: <FileText className="h-4 w-4" />,
  keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy', 'generate'],
  preferFresh: true,
  inputs: [
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      defaultValue: 'paragraphs',
      options: [
        { value: 'words', label: 'Words' },
        { value: 'sentences', label: 'Sentences' },
        { value: 'paragraphs', label: 'Paragraphs' },
      ],
      group: 'row1',
    },
    {
      id: 'count',
      label: 'Count',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100,
      required: true,
      group: 'row1',
    },
    {
      id: 'wrapLine',
      label: 'Wrap lines',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  transformer: (inputs) => {
    const type = getSelectInput(inputs, 'type', TYPE_OPTIONS, 'paragraphs');
    const count = getNumberInput(inputs, 'count', 3);
    const wrapLine = getBooleanInput(inputs, 'wrapLine');

    if (count < 1 || count > 100) {
      return failure('Count must be between 1 and 100');
    }

    try {
      const result = loremGenerators[type](count, wrapLine);
      const wordCount = result.split(/\s+/).length;
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

      return success(result, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            { label: 'Type', value: typeLabel },
            { label: 'Words', value: String(wordCount) },
            { label: 'Characters', value: String(result.length) },
          ],
          content: result,
          contentLabel: 'Generated Text',
        },
      });
    } catch {
      return failure('Failed to generate lorem ipsum');
    }
  },
};
