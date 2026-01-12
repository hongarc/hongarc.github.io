import { KeyRound } from 'lucide-react';
import { join, map, pipe, range } from 'ramda';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getNumberInput, getSelectInput, success } from '@/utils';

// Mode options
const MODE_OPTIONS = ['password', 'passphrase'] as const;

// Character sets for password
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Word list for passphrase (EFF short wordlist subset)
const WORDS = [
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
const getSecureRandom = (max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] ?? 0) % max;
};

// Pure function: build character pool based on options
const buildCharPool = (options: {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): string => {
  let pool = '';
  if (options.lowercase) pool += LOWERCASE;
  if (options.uppercase) pool += UPPERCASE;
  if (options.numbers) pool += NUMBERS;
  if (options.symbols) pool += SYMBOLS;
  return pool;
};

// Pure function: get random character from pool
const getRandomChar = (pool: string): string => {
  const index = getSecureRandom(pool.length);
  return pool[index] ?? '';
};

// Pure function: get random word from list
const getRandomWord = (): string => {
  const index = getSecureRandom(WORDS.length);
  return WORDS[index] ?? 'word';
};

// Pure function: generate single password
const generatePassword = (length: number, pool: string): string =>
  pipe(
    () => range(0, length),
    map(() => getRandomChar(pool)),
    join('')
  )();

// Pure function: generate single passphrase
const generatePassphrase = (wordCount: number, separator: string, capitalize: boolean): string =>
  pipe(
    () => range(0, wordCount),
    map(() => {
      const word = getRandomWord();
      return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    }),
    join(separator)
  )();

// Pure function: calculate password entropy
const calculatePasswordEntropy = (length: number, poolSize: number): number => {
  return Math.floor(length * Math.log2(poolSize));
};

// Pure function: calculate passphrase entropy
const calculatePassphraseEntropy = (wordCount: number): number => {
  return Math.floor(wordCount * Math.log2(WORDS.length));
};

// Pure function: get strength label
const getStrengthLabel = (entropy: number): string => {
  if (entropy < 28) return 'Very Weak';
  if (entropy < 36) return 'Weak';
  if (entropy < 60) return 'Moderate';
  if (entropy < 128) return 'Strong';
  return 'Very Strong';
};

// Pure function: get strength percentage (0-100)
const getStrengthPercentage = (entropy: number): number => {
  const maxEntropy = 128;
  return Math.min(100, Math.round((entropy / maxEntropy) * 100));
};

// Pure function: get strength variant
const getStrengthVariant = (entropy: number): 'error' | 'warning' | 'default' | 'success' => {
  if (entropy < 28) return 'error';
  if (entropy < 36) return 'warning';
  if (entropy < 60) return 'default';
  return 'success';
};

// Generate multiple passwords
const generateMultiplePasswords = (count: number, length: number, pool: string): string =>
  pipe(
    () => range(0, count),
    map(() => generatePassword(length, pool)),
    join('\n')
  )();

// Generate multiple passphrases
const generateMultiplePassphrases = (
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

export const passwordGenerator: ToolPlugin = {
  id: 'password-generator',
  label: 'Password Generator',
  description: 'Generate secure passwords or passphrases',
  category: 'crypto',
  icon: <KeyRound className="h-4 w-4" />,
  keywords: ['password', 'passphrase', 'generate', 'random', 'secure', 'key', 'words'],
  preferFresh: true,
  inputs: [
    {
      id: 'mode',
      label: 'Type',
      type: 'select',
      defaultValue: 'password',
      options: [
        { value: 'password', label: 'Password' },
        { value: 'passphrase', label: 'Passphrase' },
      ],
    },
    {
      id: 'length',
      label: 'Length',
      type: 'number',
      defaultValue: 16,
      min: 4,
      max: 128,
      required: true,
      helpText: 'Password length (4-128 chars) or word count (3-12 words)',
    },
    {
      id: 'count',
      label: 'Count',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 20,
    },
    {
      id: 'lowercase',
      label: 'Lowercase (a-z)',
      type: 'checkbox',
      defaultValue: true,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    {
      id: 'uppercase',
      label: 'Uppercase (A-Z)',
      type: 'checkbox',
      defaultValue: true,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    {
      id: 'numbers',
      label: 'Numbers (0-9)',
      type: 'checkbox',
      defaultValue: true,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    {
      id: 'symbols',
      label: 'Symbols (!@#$...)',
      type: 'checkbox',
      defaultValue: false,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
  ],
  transformer: (inputs) => {
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'password');
    const length = getNumberInput(inputs, 'length', 16);
    const count = getNumberInput(inputs, 'count', 5);

    if (count < 1 || count > 20) {
      return failure('Count must be between 1 and 20');
    }

    try {
      if (mode === 'passphrase') {
        // Passphrase mode
        const wordCount = Math.min(Math.max(length, 3), 12);
        const separator = '-';
        const capitalize = true;

        const passphrases = generateMultiplePassphrases(count, wordCount, separator, capitalize);
        const entropy = calculatePassphraseEntropy(wordCount);
        const strength = getStrengthLabel(entropy);

        return success(passphrases, {
          _viewMode: 'sections',
          _sections: {
            stats: [
              {
                label: 'Strength',
                value: strength,
                type: 'progress',
                progress: getStrengthPercentage(entropy),
                variant: getStrengthVariant(entropy),
              },
              { label: 'Entropy', value: `${String(entropy)} bits` },
              {
                label: 'Words',
                value: `${String(wordCount)} (from ${String(WORDS.length)} word list)`,
              },
            ],
            content: passphrases,
            contentLabel: `Passphrases (${String(count)})`,
          },
        });
      }
      // Password mode
      const lowercase = getBooleanInput(inputs, 'lowercase', true);
      const uppercase = getBooleanInput(inputs, 'uppercase', true);
      const numbers = getBooleanInput(inputs, 'numbers', true);
      const symbols = getBooleanInput(inputs, 'symbols', false);

      if (length < 4 || length > 128) {
        return failure('Length must be between 4 and 128');
      }

      const pool = buildCharPool({ lowercase, uppercase, numbers, symbols });

      if (pool.length === 0) {
        return failure('Please select at least one character type');
      }

      const passwords = generateMultiplePasswords(count, length, pool);
      const entropy = calculatePasswordEntropy(length, pool.length);
      const strength = getStrengthLabel(entropy);

      return success(passwords, {
        _viewMode: 'sections',
        _sections: {
          stats: [
            {
              label: 'Strength',
              value: strength,
              type: 'progress',
              progress: getStrengthPercentage(entropy),
              variant: getStrengthVariant(entropy),
            },
            { label: 'Entropy', value: `${String(entropy)} bits` },
            { label: 'Pool', value: `${String(pool.length)} characters` },
          ],
          content: passwords,
          contentLabel: `Passwords (${String(count)})`,
        },
      });
    } catch {
      return failure('Failed to generate');
    }
  },
};
