import { Hash } from 'lucide-react';

import { getTextStats } from '@/domain/text/counter';
import type { ToolPlugin } from '@/types/plugin';
import { getStringInput, success } from '@/utils';

export const wordCounter: ToolPlugin = {
  id: 'word-count',
  label: 'Word Counter',
  description: 'Count words, characters, sentences, and paragraphs online',
  category: 'text',
  icon: <Hash className="h-4 w-4" />,
  keywords: ['word', 'count', 'character', 'line', 'paragraph', 'sentence'],
  inputs: [
    {
      id: 'input',
      label: 'Input Text',
      type: 'textarea',
      placeholder: 'Paste or type your text here...',
      required: true,
      rows: 8,
    },
  ],
  transformer: (inputs) => {
    const input = getStringInput(inputs, 'input');

    if (!input) {
      return success('Enter text to count', {});
    }

    const stats = getTextStats(input);
    const timeInfo = [`Reading:  ${stats.readingTime}`, `Speaking: ${stats.speakingTime}`].join(
      '\n'
    );

    return success(timeInfo, {
      _viewMode: 'sections',
      _sections: {
        stats: [
          { label: 'Words', value: stats.words.toLocaleString() },
          { label: 'Characters', value: stats.chars.toLocaleString() },
          {
            label: 'No Spaces',
            value: stats.charsNoSpaces.toLocaleString(),
            tooltip: 'Character count excluding spaces, tabs, and newlines.',
          },
          {
            label: 'Sentences',
            value: stats.sentences.toLocaleString(),
            tooltip: 'Detected by periods, exclamation marks, and question marks.',
          },
          {
            label: 'Paragraphs',
            value: stats.paragraphs.toLocaleString(),
            tooltip: 'Text blocks separated by blank lines.',
          },
          { label: 'Lines', value: stats.lines.toLocaleString() },
        ],
        content: timeInfo,
        contentLabel: 'Reading Time',
      },
    });
  },
};
