import { join, map, pipe, range } from 'ramda';

import effWordlist from './eff-wordlist.json';

// Character sets for password
export const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
export const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMBERS = '0123456789';
export const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// EFF Long Wordlist (7,776 words = 12.9 bits per word)
export const WORDS: string[] = effWordlist;

// Separator options for passphrase
export const SEPARATORS = {
  dash: '-',
  space: ' ',
  dot: '.',
  underscore: '_',
  none: '',
} as const;

export type SeparatorType = keyof typeof SEPARATORS;

// Pure function: generate secure random number
export const getSecureRandom = (max: number): number => {
  if (max === 0) return 0;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] ?? 0) % max;
};

// Pure function: build character pool based on options
export interface PasswordOptions {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export const buildCharPool = (options: PasswordOptions): string => {
  let pool = '';
  if (options.lowercase) pool += LOWERCASE;
  if (options.uppercase) pool += UPPERCASE;
  if (options.numbers) pool += NUMBERS;
  if (options.symbols) pool += SYMBOLS;
  return pool;
};

// Pure function: get random character from pool
export const getRandomChar = (pool: string): string => {
  if (!pool) return '';
  const index = getSecureRandom(pool.length);
  return pool[index] ?? '';
};

// Pure function: get random word from list
export const getRandomWord = (): string => {
  const index = getSecureRandom(WORDS.length);
  return WORDS[index] ?? 'word';
};

// Pure function: get random number (0-99)
export const getRandomNumber = (): string => {
  return String(getSecureRandom(100)).padStart(2, '0');
};

// Pure function: generate single password
export const generatePassword = (length: number, pool: string): string =>
  pipe(
    () => range(0, length),
    map(() => getRandomChar(pool)),
    join('')
  )();

// Passphrase options
export interface PassphraseOptions {
  wordCount: number;
  separator: SeparatorType;
  capitalize: boolean;
  includeNumber: boolean;
}

// Pure function: generate single passphrase
export const generatePassphrase = (options: PassphraseOptions): string => {
  const { wordCount, separator, capitalize, includeNumber } = options;
  const sep = SEPARATORS[separator];

  const words = pipe(
    () => range(0, wordCount),
    map(() => {
      const word = getRandomWord();
      return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
  )();

  // Optionally add a random number at random position
  if (includeNumber) {
    const numPosition = getSecureRandom(words.length + 1);
    words.splice(numPosition, 0, getRandomNumber());
  }

  return words.join(sep);
};

// Pure function: calculate password entropy
export const calculatePasswordEntropy = (length: number, poolSize: number): number => {
  if (poolSize === 0) return 0;
  return Math.floor(length * Math.log2(poolSize));
};

// Pure function: calculate passphrase entropy
export const calculatePassphraseEntropy = (wordCount: number, includeNumber: boolean): number => {
  // Each word: log2(7776) ≈ 12.9 bits
  // Number (00-99): log2(100) ≈ 6.6 bits
  const wordEntropy = wordCount * Math.log2(WORDS.length);
  const numberEntropy = includeNumber ? Math.log2(100) : 0;
  return Math.floor(wordEntropy + numberEntropy);
};

// Pure function: estimate crack time
export const estimateCrackTime = (entropy: number): string => {
  // Assuming 10 billion guesses per second (modern GPU cluster)
  const guessesPerSecond = 10_000_000_000;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond / 2; // Average case

  const MINUTE = 60;
  const HOUR = 3600;
  const DAY = 86_400;
  const YEAR = 31_536_000;
  const THOUSAND_YEARS = YEAR * 1000;
  const MILLION_YEARS = YEAR * 1_000_000;
  const BILLION_YEARS = YEAR * 1_000_000_000;

  if (seconds < 1) return 'Instant';
  if (seconds < MINUTE) return `${String(Math.floor(seconds))} seconds`;
  if (seconds < HOUR) return `${String(Math.floor(seconds / MINUTE))} minutes`;
  if (seconds < DAY) return `${String(Math.floor(seconds / HOUR))} hours`;
  if (seconds < YEAR) return `${String(Math.floor(seconds / DAY))} days`;
  if (seconds < THOUSAND_YEARS) return `${String(Math.floor(seconds / YEAR))} years`;
  if (seconds < MILLION_YEARS)
    return `${String(Math.floor(seconds / THOUSAND_YEARS))} thousand years`;
  if (seconds < BILLION_YEARS)
    return `${String(Math.floor(seconds / MILLION_YEARS))} million years`;
  return `${(seconds / BILLION_YEARS).toExponential(1)} billion years`;
};

// Pure function: get strength label
export const getStrengthLabel = (entropy: number): string => {
  if (entropy < 28) return 'Very Weak';
  if (entropy < 36) return 'Weak';
  if (entropy < 60) return 'Moderate';
  if (entropy < 128) return 'Strong';
  return 'Very Strong';
};

// Pure function: get strength percentage (0-100)
export const getStrengthPercentage = (entropy: number): number => {
  const maxEntropy = 128;
  return Math.min(100, Math.round((entropy / maxEntropy) * 100));
};

// Pure function: get strength variant
export const getStrengthVariant = (
  entropy: number
): 'error' | 'warning' | 'default' | 'success' => {
  if (entropy < 28) return 'error';
  if (entropy < 36) return 'warning';
  if (entropy < 60) return 'default';
  return 'success';
};

// Generate multiple passwords
export const generateMultiplePasswords = (count: number, length: number, pool: string): string =>
  pipe(
    () => range(0, count),
    map(() => generatePassword(length, pool)),
    join('\n')
  )();

// Generate multiple passphrases
export const generateMultiplePassphrases = (count: number, options: PassphraseOptions): string =>
  pipe(
    () => range(0, count),
    map(() => generatePassphrase(options)),
    join('\n')
  )();
