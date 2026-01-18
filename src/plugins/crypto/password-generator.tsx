import { KeyRound } from 'lucide-react';

import {
  buildCharPool,
  calculatePasswordEntropy,
  calculatePassphraseEntropy,
  estimateCrackTime,
  generateMultiplePassphrases,
  generateMultiplePasswords,
  getStrengthLabel,
  getStrengthPercentage,
  getStrengthVariant,
  WORDS,
} from '@/domain/crypto/password';
import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getNumberInput, getSelectInput, success } from '@/utils';

// Mode options
const MODE_OPTIONS = ['password', 'passphrase'] as const;
const SEPARATOR_OPTIONS = ['dash', 'space', 'dot', 'underscore', 'none'] as const;

export const passwordGenerator: ToolPlugin = {
  id: 'password',
  label: 'Password Generator',
  description: 'Generate secure random passwords and passphrases online',
  category: 'crypto',
  icon: <KeyRound className="h-4 w-4" />,
  keywords: ['password', 'passphrase', 'generate', 'random', 'secure', 'key', 'words', 'diceware'],
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
      group: 'row1',
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    {
      id: 'wordCount',
      label: 'Words',
      type: 'number',
      defaultValue: 5,
      min: 3,
      max: 10,
      required: true,
      group: 'row1',
      visibleWhen: { inputId: 'mode', value: 'passphrase' },
    },
    {
      id: 'count',
      label: 'Count',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 20,
      group: 'row1',
    },
    // Password options
    {
      id: 'lowercase',
      label: 'a-z',
      type: 'checkbox',
      defaultValue: true,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    {
      id: 'uppercase',
      label: 'A-Z',
      type: 'checkbox',
      defaultValue: true,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    {
      id: 'numbers',
      label: '0-9',
      type: 'checkbox',
      defaultValue: true,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    {
      id: 'symbols',
      label: '!@#$',
      type: 'checkbox',
      defaultValue: false,
      visibleWhen: { inputId: 'mode', value: 'password' },
    },
    // Passphrase options
    {
      id: 'separator',
      label: 'Separator',
      type: 'select',
      defaultValue: 'dash',
      options: [
        { value: 'dash', label: '-' },
        { value: 'space', label: '␣' },
        { value: 'dot', label: '.' },
        { value: 'underscore', label: '_' },
        { value: 'none', label: '∅' },
      ],
      visibleWhen: { inputId: 'mode', value: 'passphrase' },
      group: 'row2',
    },
    {
      id: 'capitalize',
      label: 'Capitalize',
      type: 'checkbox',
      defaultValue: true,
      visibleWhen: { inputId: 'mode', value: 'passphrase' },
    },
    {
      id: 'includeNumber',
      label: 'Add Number',
      type: 'checkbox',
      defaultValue: false,
      visibleWhen: { inputId: 'mode', value: 'passphrase' },
    },
  ],
  transformer: (inputs) => {
    const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'password');
    const count = getNumberInput(inputs, 'count', 5);

    if (count < 1 || count > 20) {
      return failure('Count must be between 1 and 20');
    }

    try {
      if (mode === 'passphrase') {
        // Passphrase mode
        const wordCount = getNumberInput(inputs, 'wordCount', 5);
        const separator = getSelectInput(inputs, 'separator', SEPARATOR_OPTIONS, 'dash');
        const capitalize = getBooleanInput(inputs, 'capitalize', true);
        const includeNumber = getBooleanInput(inputs, 'includeNumber', false);

        if (wordCount < 3 || wordCount > 10) {
          return failure('Word count must be between 3 and 10');
        }

        const passphrases = generateMultiplePassphrases(count, {
          wordCount,
          separator,
          capitalize,
          includeNumber,
        });
        const entropy = calculatePassphraseEntropy(wordCount, includeNumber);
        const strength = getStrengthLabel(entropy);
        const crackTime = estimateCrackTime(entropy);

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
              {
                label: 'Entropy',
                value: `${String(entropy)} bits`,
                tooltip:
                  'Measure of randomness. Higher = harder to guess. 128+ bits is very strong.',
              },
              {
                label: 'Crack Time',
                value: crackTime,
                tooltip:
                  'Estimated time to crack assuming 10 billion guesses per second (GPU cluster).',
              },
              { label: 'Wordlist', value: `${String(WORDS.length).toLocaleString()} words` },
            ],
            content: passphrases,
            contentLabel: `Passphrases (${String(count)})`,
            perLineCopy: true,
          },
        });
      }

      // Password mode
      const length = getNumberInput(inputs, 'length', 16);
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
      const crackTime = estimateCrackTime(entropy);

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
            {
              label: 'Entropy',
              value: `${String(entropy)} bits`,
              tooltip: 'Measure of randomness. Higher = harder to guess. 128+ bits is very strong.',
            },
            {
              label: 'Crack Time',
              value: crackTime,
              tooltip:
                'Estimated time to crack assuming 10 billion guesses per second (GPU cluster).',
            },
            {
              label: 'Pool',
              value: `${String(pool.length)} chars`,
              tooltip:
                'Number of unique characters used. More characters = more entropy per character.',
            },
          ],
          content: passwords,
          contentLabel: `Passwords (${String(count)})`,
          perLineCopy: true,
        },
      });
    } catch {
      return failure('Failed to generate');
    }
  },
};
