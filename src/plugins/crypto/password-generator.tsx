import { KeyRound } from 'lucide-react';

import {
  buildCharPool,
  calculatePasswordEntropy,
  calculatePassphraseEntropy,
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
