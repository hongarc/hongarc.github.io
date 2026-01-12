import { join, map, pipe, range } from 'ramda';

// Character sets for password
export const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
export const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMBERS = '0123456789';
export const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Word list for passphrase (EFF short wordlist subset)
export const WORDS = [
  'acid',
  'acorn',
  'acre',
  'acts',
  'afar',
  'affix',
  'aged',
  'agent',
  'agile',
  'aging',
  'agony',
  'ahead',
  'aide',
  'aids',
  'aim',
  'ajar',
  'alarm',
  'alias',
  'alibi',
  'alien',
  'alike',
  'alive',
  'alley',
  'allot',
  'allow',
  'alloy',
  'ally',
  'alma',
  'aloft',
  'alone',
  'alpha',
  'also',
  'altar',
  'alter',
  'amaze',
  'amber',
  'amend',
  'amino',
  'ample',
  'amuse',
  'angel',
  'anger',
  'angle',
  'ankle',
  'annex',
  'antic',
  'anvil',
  'apart',
  'apex',
  'apple',
  'april',
  'apron',
  'aqua',
  'area',
  'arena',
  'argue',
  'arise',
  'armor',
  'army',
  'aroma',
  'array',
  'arrow',
  'arson',
  'art',
  'ashen',
  'aside',
  'asked',
  'asset',
  'atom',
  'attic',
  'audio',
  'audit',
  'avoid',
  'awake',
  'award',
  'aware',
  'awful',
  'awoke',
  'axis',
  'bacon',
  'badge',
  'badly',
  'baker',
  'balmy',
  'banana',
  'banjo',
  'barge',
  'barn',
  'base',
  'basic',
  'basin',
  'batch',
  'bath',
  'baton',
  'beach',
  'beads',
  'beak',
  'beam',
  'beard',
  'beast',
  'beat',
  'begin',
  'being',
  'belly',
  'below',
  'bench',
  'bento',
  'berry',
  'bike',
  'bird',
  'birth',
  'black',
  'blade',
  'blame',
  'blank',
  'blast',
  'blaze',
  'bleak',
  'blend',
  'bless',
  'blimp',
  'blind',
  'bliss',
  'block',
  'blond',
  'blood',
  'bloom',
  'blown',
  'blue',
  'blunt',
  'board',
  'boat',
  'body',
  'bogus',
  'boil',
  'bolt',
  'bomb',
  'bonus',
  'book',
  'booth',
  'boots',
  'booze',
  'boss',
  'botch',
  'both',
  'boxer',
  'brain',
  'brake',
  'brand',
  'brass',
  'brave',
  'bread',
  'break',
  'breed',
  'brick',
  'bride',
  'brief',
  'bring',
  'brisk',
  'broad',
  'broil',
  'broke',
  'brook',
  'broom',
  'brush',
  'buddy',
  'budget',
  'bugs',
  'build',
  'built',
  'bulge',
  'bulk',
  'bully',
  'bunch',
  'bunny',
  'burn',
  'burst',
  'bush',
  'cabin',
  'cable',
  'cache',
  'cadet',
  'cage',
  'cake',
  'calm',
  'camel',
  'camp',
  'canal',
  'candy',
  'cane',
  'canon',
  'cape',
  'card',
  'cargo',
  'carol',
  'carry',
  'carve',
  'case',
  'cash',
  'cast',
];

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

// Pure function: generate single password
export const generatePassword = (length: number, pool: string): string =>
  pipe(
    () => range(0, length),
    map(() => getRandomChar(pool)),
    join('')
  )();

// Pure function: generate single passphrase
export const generatePassphrase = (
  wordCount: number,
  separator: string,
  capitalize: boolean
): string =>
  pipe(
    () => range(0, wordCount),
    map(() => {
      const word = getRandomWord();
      return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    }),
    join(separator)
  )();

// Pure function: calculate password entropy
export const calculatePasswordEntropy = (length: number, poolSize: number): number => {
  if (poolSize === 0) return 0;
  return Math.floor(length * Math.log2(poolSize));
};

// Pure function: calculate passphrase entropy
export const calculatePassphraseEntropy = (wordCount: number): number => {
  return Math.floor(wordCount * Math.log2(WORDS.length));
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
export const generateMultiplePassphrases = (
  count: number,
  wordCount: number,
  separator: string,
  capitalize: boolean
): string =>
  pipe(
    () => range(0, count),
    map(() => generatePassphrase(wordCount, separator, capitalize)),
    join('\n')
  )();
