import { FileText } from 'lucide-react';
import { join, map, pipe, range } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getNumberInput, getSelectInput, success } from '@/utils';

const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'perspiciatis',
  'unde',
  'omnis',
  'iste',
  'natus',
  'error',
  'voluptatem',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
];

const TYPE_OPTIONS = ['words', 'sentences', 'paragraphs'] as const;
type GenerateType = (typeof TYPE_OPTIONS)[number];

// Pure function: get random word
const getRandomWord = (): string => WORDS[Math.floor(Math.random() * WORDS.length)] ?? 'lorem';

// Pure function: capitalize first letter
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// Pure function: generate N words
const generateWords = (count: number): string =>
  pipe(() => range(0, count), map(getRandomWord), join(' '))();

// Pure function: generate a sentence (8-15 words)
const generateSentence = (): string => {
  const wordCount = 8 + Math.floor(Math.random() * 8);
  return `${capitalize(generateWords(wordCount))}.`;
};

// Pure function: generate N sentences
const generateSentences = (count: number, wrapLine = false): string =>
  pipe(() => range(0, count), map(generateSentence), join(wrapLine ? '\n' : ' '))();

// Pure function: generate a paragraph (4-7 sentences)
const generateParagraph = (wrapLine = false): string => {
  const sentenceCount = 4 + Math.floor(Math.random() * 4);
  return generateSentences(sentenceCount, wrapLine);
};

// Pure function: generate N paragraphs
const generateParagraphs = (count: number, wrapLine = false): string =>
  pipe(
    () => range(0, count),
    map(() => generateParagraph(wrapLine)),
    join('\n\n')
  )();

// Strategy pattern for generators
const generators: Record<GenerateType, (count: number, wrapLine?: boolean) => string> = {
  words: generateWords,
  sentences: generateSentences,
  paragraphs: generateParagraphs,
};

export const loremIpsum: ToolPlugin = {
  id: 'lorem-ipsum',
  label: 'Lorem Ipsum',
  description: 'Generate placeholder text for design mockups',
  category: 'text',
  icon: <FileText className="h-4 w-4" />,
  keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy', 'generate'],
  inputs: [
    {
      id: 'type',
      label: 'Generate',
      type: 'select',
      defaultValue: 'paragraphs',
      options: [
        { value: 'words', label: 'Words' },
        { value: 'sentences', label: 'Sentences' },
        { value: 'paragraphs', label: 'Paragraphs' },
      ],
    },
    {
      id: 'count',
      label: 'Count',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100,
      required: true,
    },
    {
      id: 'wrapLine',
      label: 'Wrap lines',
      type: 'checkbox',
      defaultValue: false,
      placeholder: 'Add line breaks between sentences',
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
      const result = generators[type](count, wrapLine);
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
