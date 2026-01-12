import { filter, length, pipe, split, trim } from 'ramda';

export const countCharacters = (text: string): number => text.length;

export const countCharactersNoSpaces = (text: string): number =>
  pipe(
    split(''),
    filter((c: string) => c !== ' ' && c !== '\n' && c !== '\t'),
    length
  )(text);

export const countWords = (text: string): number =>
  pipe(
    trim,
    split(/\s+/),
    filter((w: string) => w.length > 0),
    length
  )(text);

export const countLines = (text: string): number => pipe(split('\n'), length)(text);

export const countParagraphs = (text: string): number =>
  pipe(
    split(/\n\s*\n/),
    filter((p: string) => p.trim().length > 0),
    length
  )(text);

export const countSentences = (text: string): number =>
  pipe(
    split(/[.!?]+/),
    filter((s: string) => s.trim().length > 0),
    length
  )(text);

// Calculate reading time (average 200 words per minute)
export const calculateReadingTime = (wordCount: number): string => {
  const minutes = Math.ceil(wordCount / 200);
  if (minutes < 1) return '< 1 min';
  return `${String(minutes)} min`;
};

// Calculate speaking time (average 150 words per minute)
export const calculateSpeakingTime = (wordCount: number): string => {
  const minutes = Math.ceil(wordCount / 150);
  if (minutes < 1) return '< 1 min';
  return `${String(minutes)} min`;
};

export interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  readingTime: string;
  speakingTime: string;
}

export const getTextStats = (text: string): TextStats => {
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
