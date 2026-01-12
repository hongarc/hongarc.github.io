import { describe, expect, it } from 'vitest';

import { bufferToHex, computeHash, secureCompare } from '../domain/crypto/hash';
import {
  buildCharPool,
  calculatePasswordEntropy,
  generateMultiplePasswords,
  generateMultiplePassphrases,
  generatePassword,
  getSecureRandom,
  getStrengthLabel,
  getStrengthPercentage,
  getStrengthVariant,
  LOWERCASE,
  NUMBERS,
} from '../domain/crypto/password';

import { PasswordOptionsBuilder } from './builders/crypto-builder';

describe('Crypto Domain', () => {
  describe('Hash Service', () => {
    it('bufferToHex should convert ArrayBuffer to hex string', () => {
      const buffer = new Uint8Array([0, 255, 16, 128]).buffer;
      expect(bufferToHex(buffer)).toBe('00ff1080');
    });

    it('computeHash should compute correct hash', async () => {
      // Known SHA-256 for "hello"
      const expected = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
      const result = await computeHash('hello', 'SHA-256');
      expect(result).toBe(expected);
    });

    it('secureCompare should return true for identical strings', () => {
      expect(secureCompare('secret', 'secret')).toBe(true);
    });

    it('secureCompare should return false for different strings', () => {
      expect(secureCompare('secret', 'public')).toBe(false);
      expect(secureCompare('short', 'longer')).toBe(false);
    });
  });

  describe('Password Service', () => {
    describe('getSecureRandom', () => {
      it('should return number within range', () => {
        const max = 10;
        const result = getSecureRandom(max);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(max);
      });
    });

    describe('buildCharPool', () => {
      it('should build correct pool', () => {
        const options = new PasswordOptionsBuilder().withoutUppercase().withoutSymbols().build();

        // When using builder, we need to map options to arguments if function expects arguments
        // But buildCharPool expects individual params or an object?
        // Checking password.ts: export const buildCharPool = (options: PasswordOptions): string

        const result = buildCharPool(options);
        expect(result).toBe(LOWERCASE + NUMBERS);
      });
    });

    describe('generatePassword', () => {
      it('should generate password of specified length', () => {
        const length = 16;
        const pool = LOWERCASE;
        const result = generatePassword(length, pool);
        expect(result).toHaveLength(length);
      });

      it('should use characters from pool', () => {
        const length = 100;
        const pool = 'a';
        const result = generatePassword(length, pool);
        expect(result).toBe('a'.repeat(length));
      });
    });

    describe('calculatePasswordEntropy', () => {
      it('should calculate correct entropy', () => {
        // Pool size = 2 (1 bit), length = 8 -> 8 bits
        expect(calculatePasswordEntropy(8, 2)).toBe(8);
      });
    });

    describe('getStrengthLabel', () => {
      it('should return correct labels', () => {
        expect(getStrengthLabel(20)).toBe('Very Weak');
        expect(getStrengthLabel(30)).toBe('Weak');
        expect(getStrengthLabel(50)).toBe('Moderate');
        expect(getStrengthLabel(100)).toBe('Strong');
        expect(getStrengthLabel(130)).toBe('Very Strong');
      });
    });

    describe('getStrengthPercentage', () => {
      it('should calculate correct percentage', () => {
        expect(getStrengthPercentage(0)).toBe(0);
        expect(getStrengthPercentage(64)).toBe(50);
        expect(getStrengthPercentage(128)).toBe(100);
        expect(getStrengthPercentage(200)).toBe(100); // Max cap
      });
    });

    describe('getStrengthVariant', () => {
      it('should return correct variant', () => {
        expect(getStrengthVariant(10)).toBe('error');
        expect(getStrengthVariant(30)).toBe('warning');
        expect(getStrengthVariant(50)).toBe('default');
        expect(getStrengthVariant(100)).toBe('success');
      });
    });

    describe('generateMultiplePasswords', () => {
      it('should generate multiple passwords separated by newline', () => {
        const count = 3;
        const length = 5;
        const pool = LOWERCASE;
        const result = generateMultiplePasswords(count, length, pool);
        const passwords = result.split('\n');

        expect(passwords).toHaveLength(count);
        for (const pwd of passwords) {
          expect(pwd).toHaveLength(length);
        }
      });
    });

    describe('generateMultiplePassphrases', () => {
      it('should generate multiple passphrases', () => {
        const count = 2;
        const wordCount = 3;
        const separator = '-';
        const result = generateMultiplePassphrases(count, wordCount, separator, false);
        const phrases = result.split('\n');

        expect(phrases).toHaveLength(count);
        for (const phrase of phrases) {
          expect(phrase.split(separator)).toHaveLength(wordCount);
        }
      });
    });
  });
});
