import { describe, expect, it } from 'vitest';

import {
  bufferToHex,
  CHECKSUM_ALGOS,
  computeAllHashes,
  computeHash,
  matchChecksum,
  secureCompare,
} from '../domain/crypto/hash';
import {
  buildCharPool,
  calculatePassphraseEntropy,
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

  describe('Checksum Verifier', () => {
    // Canonical known vectors for 'abc'
    const ABC_MD5 = '900150983cd24fb0d6963f7d28e17f72';
    const ABC_SHA1 = 'a9993e364706816aba3e25717850c26c9cd0d89d';
    const ABC_SHA256 = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    const ABC_SHA512 =
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f';

    it('computeAllHashes returns correct shape and known vectors for "abc"', async () => {
      const result = await computeAllHashes('abc');
      expect(Object.keys(result)).toHaveLength(4);
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(['md5', 'sha1', 'sha256', 'sha512'])
      );
      expect(result.md5).toBe(ABC_MD5);
      expect(result.sha1).toBe(ABC_SHA1);
      expect(result.sha256).toBe(ABC_SHA256);
      expect(result.sha512).toBe(ABC_SHA512);
    });

    it('computeAllHashes accepts Uint8Array and returns same result as string', async () => {
      const fromString = await computeAllHashes('abc');
      const fromBytes = await computeAllHashes(new TextEncoder().encode('abc'));
      expect(fromBytes).toEqual(fromString);
    });

    it('computeAllHashes returns correct hashes for empty string', async () => {
      const result = await computeAllHashes('');
      expect(result.md5).toBe('d41d8cd98f00b204e9800998ecf8427e');
      expect(result.sha256).toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      );
    });

    it('matchChecksum detects SHA-256', async () => {
      const hashes = await computeAllHashes('abc');
      expect(matchChecksum(ABC_SHA256, hashes).algo).toBe('SHA-256');
    });

    it('matchChecksum detects each algorithm by its known vector', async () => {
      const hashes = await computeAllHashes('abc');
      const vectors: Record<string, string> = {
        MD5: ABC_MD5,
        'SHA-1': ABC_SHA1,
        'SHA-256': ABC_SHA256,
        'SHA-512': ABC_SHA512,
      };
      for (const algo of CHECKSUM_ALGOS) {
        const vec = vectors[algo] ?? '';
        expect(matchChecksum(vec, hashes).algo).toBe(algo);
      }
    });

    it('matchChecksum is case-insensitive', async () => {
      const hashes = await computeAllHashes('abc');
      expect(matchChecksum(ABC_SHA256.toUpperCase(), hashes).algo).toBe('SHA-256');
    });

    it('matchChecksum tolerates leading and trailing whitespace', async () => {
      const hashes = await computeAllHashes('abc');
      expect(matchChecksum(`  ${ABC_SHA1}\n`, hashes).algo).toBe('SHA-1');
    });

    it('matchChecksum returns null for a wrong value', async () => {
      const hashes = await computeAllHashes('abc');
      expect(matchChecksum('deadbeef', hashes).algo).toBeNull();
    });

    it('matchChecksum returns null for empty expected', async () => {
      const hashes = await computeAllHashes('abc');
      expect(matchChecksum('', hashes).algo).toBeNull();
      expect(matchChecksum(' '.repeat(3), hashes).algo).toBeNull();
    });

    it('matchChecksum returns null for wrong-length-but-right-format garbage (64 chars, no match)', async () => {
      const hashes = await computeAllHashes('abc');
      // 64 hex chars — same length as SHA-256, but wrong value
      const garbage = '0'.repeat(64);
      expect(matchChecksum(garbage, hashes).algo).toBeNull();
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

    describe('Entropy Calculation', () => {
      it('should calculate password entropy', () => {
        const entropy = calculatePasswordEntropy(10, 26);
        expect(entropy).toBeGreaterThan(0);
      });

      it('should return 0 entropy for empty pool', () => {
        expect(calculatePasswordEntropy(10, 0)).toBe(0);
      });

      it('should build partial char pool', () => {
        const pool = buildCharPool({
          lowercase: true,
          uppercase: false,
          numbers: false,
          symbols: false,
        });
        expect(pool).toBe(LOWERCASE);
      });

      it('should calculate passphrase entropy', () => {
        const entropy = calculatePassphraseEntropy(4, false); // 4 words, no number
        expect(entropy).toBeGreaterThan(0);
      });
    });

    describe('Secure Random', () => {
      it('should return 0 if max is 0', () => {
        expect(getSecureRandom(0)).toBe(0);
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
        const result = generateMultiplePassphrases(count, {
          wordCount,
          separator: 'dash',
          capitalize: false,
          includeNumber: false,
        });
        const phrases = result.split('\n');

        expect(phrases).toHaveLength(count);
        for (const phrase of phrases) {
          expect(phrase.split('-')).toHaveLength(wordCount);
        }
      });
    });
  });
});
