import { Hash } from 'lucide-react';
import { filter, length, pipe, split, trim } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import { getStringInput, success } from '@/utils';

// Pure functions for counting
const countCharacters = (text: string): number => text.length;

const countCharactersNoSpaces = (text: string): number =>
  pipe(
    split(''),
    filter((c: string) => c !== ' ' && c !== '\n' && c !== '\t'),
    length
  )(text);

const countWords = (text: string): number =>
  pipe(
    trim,
    split(/\s+/),
    filter((w: string) => w.length > 0),
    length
  )(text);

const countLines = (text: string): number => pipe(split('\n'), length)(text);

const countParagraphs = (text: string): number =>
  pipe(
    split(/\n\s*\n/),
    filter((p: string) => p.trim().length > 0),
    length
  )(text);

const countSentences = (text: string): number =>
  pipe(
    split(/[.!?]+/),
    filter((s: string) => s.trim().length > 0),
    length
  )(text);

// Calculate reading time (average 200 words per minute)
const calculateReadingTime = (wordCount: number): string => {
  const minutes = Math.ceil(wordCount / 200);
  if (minutes < 1) return '< 1 min';
  return `${String(minutes)} min`;
};

// Calculate speaking time (average 150 words per minute)
const calculateSpeakingTime = (wordCount: number): string => {
  const minutes = Math.ceil(wordCount / 150);
  if (minutes < 1) return '< 1 min';
  return `${String(minutes)} min`;
};

// Get all stats
interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  readingTime: string;
  speakingTime: string;
}

const getTextStats = (text: string): TextStats => {
  const words = countWords(text);
  return {
    chars: countCharacters(text),
    charsNoSpaces: countCharactersNoSpaces(text),
    words,
    lines: countLines(text),
    paragraphs: countParagraphs(text),
    sentences: countSentences(text),
    readingTime: calculateReadingTime(words),
    speakingTime: calculateSpeakingTime(words),
  };
};

export const wordCounter: ToolPlugin = {
  id: 'word-counter',
  label: 'Word Counter',
  description: 'Count words, characters, sentences, and paragraphs',
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
          { label: 'No Spaces', value: stats.charsNoSpaces.toLocaleString() },
          { label: 'Sentences', value: stats.sentences.toLocaleString() },
          { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
          { label: 'Lines', value: stats.lines.toLocaleString() },
        ],
        content: timeInfo,
        contentLabel: 'Reading Time',
      },
    });
  },
};
