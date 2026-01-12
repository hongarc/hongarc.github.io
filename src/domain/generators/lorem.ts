import { join, map, pipe, range } from 'ramda';

export const LOREM_WORDS = [
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

export type LoremType = 'words' | 'sentences' | 'paragraphs';

// Pure function: get random word
export const getRandomWord = (): string =>
  LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)] ?? 'lorem';

// Pure function: capitalize first letter
export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// Pure function: generate N words
export const generateWords = (count: number): string =>
  pipe(() => range(0, count), map(getRandomWord), join(' '))();

// Pure function: generate a sentence (8-15 words)
export const generateSentence = (): string => {
  const wordCount = 8 + Math.floor(Math.random() * 8);
  return `${capitalize(generateWords(wordCount))}.`;
};

// Pure function: generate N sentences
export const generateSentences = (count: number, wrapLine = false): string =>
  pipe(() => range(0, count), map(generateSentence), join(wrapLine ? '\n' : ' '))();

// Pure function: generate a paragraph (4-7 sentences)
export const generateParagraph = (wrapLine = false): string => {
  const sentenceCount = 4 + Math.floor(Math.random() * 4);
  return generateSentences(sentenceCount, wrapLine);
};

// Pure function: generate N paragraphs
export const generateParagraphs = (count: number, wrapLine = false): string =>
  pipe(
    () => range(0, count),
    map(() => generateParagraph(wrapLine)),
    join('\n\n')
  )();

// Strategy pattern for generators
export const loremGenerators: Record<LoremType, (count: number, wrapLine?: boolean) => string> = {
  words: generateWords,
  sentences: generateSentences,
  paragraphs: generateParagraphs,
};
