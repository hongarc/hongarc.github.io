import { convertToUppercase, convertToLowercase } from '../stringConverters';

describe('stringConverters', () => {
  describe('convertToUppercase', () => {
    it('should convert lowercase string to uppercase', () => {
      const input = 'hello world';
      const expected = 'HELLO WORLD';
      expect(convertToUppercase(input)).toBe(expected);
    });

    it('should return empty string when input is empty', () => {
      const input = '';
      const expected = '';
      expect(convertToUppercase(input)).toBe(expected);
    });

    it('should handle already uppercase string', () => {
      const input = 'HELLO WORLD';
      const expected = 'HELLO WORLD';
      expect(convertToUppercase(input)).toBe(expected);
    });

    it('should handle mixed case string', () => {
      const input = 'HeLLo WoRLd';
      const expected = 'HELLO WORLD';
      expect(convertToUppercase(input)).toBe(expected);
    });

    it('should handle string with numbers and special characters', () => {
      const input = 'hello123!@#world';
      const expected = 'HELLO123!@#WORLD';
      expect(convertToUppercase(input)).toBe(expected);
    });

    it('should handle single character', () => {
      const input = 'a';
      const expected = 'A';
      expect(convertToUppercase(input)).toBe(expected);
    });

    it('should handle string with spaces', () => {
      const input = '  hello  world  ';
      const expected = '  HELLO  WORLD  ';
      expect(convertToUppercase(input)).toBe(expected);
    });
  });

  describe('convertToLowercase', () => {
    it('should convert uppercase string to lowercase', () => {
      const input = 'HELLO WORLD';
      const expected = 'hello world';
      expect(convertToLowercase(input)).toBe(expected);
    });

    it('should return empty string when input is empty', () => {
      const input = '';
      const expected = '';
      expect(convertToLowercase(input)).toBe(expected);
    });

    it('should handle already lowercase string', () => {
      const input = 'hello world';
      const expected = 'hello world';
      expect(convertToLowercase(input)).toBe(expected);
    });

    it('should handle mixed case string', () => {
      const input = 'HeLLo WoRLd';
      const expected = 'hello world';
      expect(convertToLowercase(input)).toBe(expected);
    });

    it('should handle string with numbers and special characters', () => {
      const input = 'HELLO123!@#WORLD';
      const expected = 'hello123!@#world';
      expect(convertToLowercase(input)).toBe(expected);
    });

    it('should handle single character', () => {
      const input = 'A';
      const expected = 'a';
      expect(convertToLowercase(input)).toBe(expected);
    });

    it('should handle string with spaces', () => {
      const input = '  HELLO  WORLD  ';
      const expected = '  hello  world  ';
      expect(convertToLowercase(input)).toBe(expected);
    });

    it('should handle unicode characters', () => {
      const input = 'HÉLLÖ WÖRLD';
      const expected = 'héllö wörld';
      expect(convertToLowercase(input)).toBe(expected);
    });
  });
});