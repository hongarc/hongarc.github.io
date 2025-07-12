import {
  convertToUppercase,
  convertToLowercase,
  convertToCamelCase,
  convertToKebabCase,
  convertToStartCase,
  convertToSnakeCase,
  convertToCapitalize,
  convertToUpperCase,
  convertToLowerCase,
  convertToTrim,
  convertToDeburr,
  convertToEscape,
  convertToUnescape
} from '../string-converter';

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

  describe('convertToCamelCase', () => {
    it('should convert space-separated words to camelCase', () => {
      const input = 'hello world';
      const expected = 'helloWorld';
      expect(convertToCamelCase(input)).toBe(expected);
    });

    it('should handle single word', () => {
      const input = 'hello';
      const expected = 'hello';
      expect(convertToCamelCase(input)).toBe(expected);
    });

    it('should handle multiple words', () => {
      const input = 'hello world test';
      const expected = 'helloWorldTest';
      expect(convertToCamelCase(input)).toBe(expected);
    });

    it('should handle words with hyphens', () => {
      const input = 'hello-world';
      const expected = 'helloWorld';
      expect(convertToCamelCase(input)).toBe(expected);
    });

    it('should handle words with underscores', () => {
      const input = 'hello_world';
      const expected = 'helloWorld';
      expect(convertToCamelCase(input)).toBe(expected);
    });

    it('should handle mixed separators', () => {
      const input = 'hello-world_test';
      const expected = 'helloWorldTest';
      expect(convertToCamelCase(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToCamelCase(input)).toBe(expected);
    });
  });

  describe('convertToKebabCase', () => {
    it('should convert space-separated words to kebab-case', () => {
      const input = 'hello world';
      const expected = 'hello-world';
      expect(convertToKebabCase(input)).toBe(expected);
    });

    it('should handle single word', () => {
      const input = 'hello';
      const expected = 'hello';
      expect(convertToKebabCase(input)).toBe(expected);
    });

    it('should handle multiple words', () => {
      const input = 'hello world test';
      const expected = 'hello-world-test';
      expect(convertToKebabCase(input)).toBe(expected);
    });

    it('should handle camelCase input', () => {
      const input = 'helloWorld';
      const expected = 'hello-world';
      expect(convertToKebabCase(input)).toBe(expected);
    });

    it('should handle snake_case input', () => {
      const input = 'hello_world';
      const expected = 'hello-world';
      expect(convertToKebabCase(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToKebabCase(input)).toBe(expected);
    });
  });

  describe('convertToStartCase', () => {
    it('should convert space-separated words to Start Case', () => {
      const input = 'hello world';
      const expected = 'Hello World';
      expect(convertToStartCase(input)).toBe(expected);
    });

    it('should handle single word', () => {
      const input = 'hello';
      const expected = 'Hello';
      expect(convertToStartCase(input)).toBe(expected);
    });

    it('should handle multiple words', () => {
      const input = 'hello world test';
      const expected = 'Hello World Test';
      expect(convertToStartCase(input)).toBe(expected);
    });

    it('should handle camelCase input', () => {
      const input = 'helloWorld';
      const expected = 'Hello World';
      expect(convertToStartCase(input)).toBe(expected);
    });

    it('should handle snake_case input', () => {
      const input = 'hello_world';
      const expected = 'Hello World';
      expect(convertToStartCase(input)).toBe(expected);
    });

    it('should handle kebab-case input', () => {
      const input = 'hello-world';
      const expected = 'Hello World';
      expect(convertToStartCase(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToStartCase(input)).toBe(expected);
    });
  });

  describe('convertToSnakeCase', () => {
    it('should convert space-separated words to snake_case', () => {
      const input = 'hello world';
      const expected = 'hello_world';
      expect(convertToSnakeCase(input)).toBe(expected);
    });

    it('should handle single word', () => {
      const input = 'hello';
      const expected = 'hello';
      expect(convertToSnakeCase(input)).toBe(expected);
    });

    it('should handle multiple words', () => {
      const input = 'hello world test';
      const expected = 'hello_world_test';
      expect(convertToSnakeCase(input)).toBe(expected);
    });

    it('should handle camelCase input', () => {
      const input = 'helloWorld';
      const expected = 'hello_world';
      expect(convertToSnakeCase(input)).toBe(expected);
    });

    it('should handle kebab-case input', () => {
      const input = 'hello-world';
      const expected = 'hello_world';
      expect(convertToSnakeCase(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToSnakeCase(input)).toBe(expected);
    });
  });

  describe('convertToCapitalize', () => {
    it('should capitalize first letter of string', () => {
      const input = 'hello world';
      const expected = 'Hello world';
      expect(convertToCapitalize(input)).toBe(expected);
    });

    it('should handle single word', () => {
      const input = 'hello';
      const expected = 'Hello';
      expect(convertToCapitalize(input)).toBe(expected);
    });

    it('should handle already capitalized string', () => {
      const input = 'Hello world';
      const expected = 'Hello world';
      expect(convertToCapitalize(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToCapitalize(input)).toBe(expected);
    });

    it('should handle string with special characters', () => {
      const input = 'hello-world';
      const expected = 'Hello-world';
      expect(convertToCapitalize(input)).toBe(expected);
    });
  });

  describe('convertToUpperCase', () => {
    it('should convert text to UPPER CASE', () => {
      const input = 'hello world';
      const expected = 'HELLO WORLD';
      expect(convertToUpperCase(input)).toBe(expected);
    });

    it('should handle single word', () => {
      const input = 'hello';
      const expected = 'HELLO';
      expect(convertToUpperCase(input)).toBe(expected);
    });

    it('should handle already uppercase string', () => {
      const input = 'HELLO WORLD';
      const expected = 'HELLO WORLD';
      expect(convertToUpperCase(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToUpperCase(input)).toBe(expected);
    });

    it('should handle string with special characters', () => {
      const input = 'hello-world';
      const expected = 'HELLO WORLD';
      expect(convertToUpperCase(input)).toBe(expected);
    });
  });

  describe('convertToLowerCase', () => {
    it('should convert text to lower case', () => {
      const input = 'HELLO WORLD';
      const expected = 'hello world';
      expect(convertToLowerCase(input)).toBe(expected);
    });

    it('should handle single word', () => {
      const input = 'HELLO';
      const expected = 'hello';
      expect(convertToLowerCase(input)).toBe(expected);
    });

    it('should handle already lowercase string', () => {
      const input = 'hello world';
      const expected = 'hello world';
      expect(convertToLowerCase(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToLowerCase(input)).toBe(expected);
    });

    it('should handle string with special characters', () => {
      const input = 'HELLO-WORLD';
      const expected = 'hello world';
      expect(convertToLowerCase(input)).toBe(expected);
    });
  });

  describe('convertToTrim', () => {
    it('should remove whitespace from both ends', () => {
      const input = ' hello ';
      const expected = 'hello';
      expect(convertToTrim(input)).toBe(expected);
    });

    it('should handle string with only leading spaces', () => {
      const input = '  hello';
      const expected = 'hello';
      expect(convertToTrim(input)).toBe(expected);
    });

    it('should handle string with only trailing spaces', () => {
      const input = 'hello  ';
      const expected = 'hello';
      expect(convertToTrim(input)).toBe(expected);
    });

    it('should handle string with no spaces', () => {
      const input = 'hello';
      const expected = 'hello';
      expect(convertToTrim(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToTrim(input)).toBe(expected);
    });

    it('should handle string with only spaces', () => {
      const input = '   ';
      const expected = '';
      expect(convertToTrim(input)).toBe(expected);
    });
  });

  describe('convertToDeburr', () => {
    it('should remove accents from text', () => {
      const input = 'café';
      const expected = 'cafe';
      expect(convertToDeburr(input)).toBe(expected);
    });

    it('should handle text with multiple accents', () => {
      const input = 'naïve résumé';
      const expected = 'naive resume';
      expect(convertToDeburr(input)).toBe(expected);
    });

    it('should handle text without accents', () => {
      const input = 'hello world';
      const expected = 'hello world';
      expect(convertToDeburr(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToDeburr(input)).toBe(expected);
    });

    it('should handle special characters', () => {
      const input = 'café & résumé';
      const expected = 'cafe & resume';
      expect(convertToDeburr(input)).toBe(expected);
    });
  });

  describe('convertToEscape', () => {
    it('should escape HTML entities', () => {
      const input = '<div>';
      const expected = '&lt;div&gt;';
      expect(convertToEscape(input)).toBe(expected);
    });

    it('should handle multiple HTML tags', () => {
      const input = '<div><span>text</span></div>';
      const expected = '&lt;div&gt;&lt;span&gt;text&lt;/span&gt;&lt;/div&gt;';
      expect(convertToEscape(input)).toBe(expected);
    });

    it('should handle text without HTML', () => {
      const input = 'hello world';
      const expected = 'hello world';
      expect(convertToEscape(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToEscape(input)).toBe(expected);
    });

    it('should handle special characters', () => {
      const input = '<div class="test">';
      const expected = '&lt;div class=&quot;test&quot;&gt;';
      expect(convertToEscape(input)).toBe(expected);
    });
  });

  describe('convertToUnescape', () => {
    it('should unescape HTML entities', () => {
      const input = '&lt;div&gt;';
      const expected = '<div>';
      expect(convertToUnescape(input)).toBe(expected);
    });

    it('should handle multiple HTML entities', () => {
      const input = '&lt;div&gt;&lt;span&gt;text&lt;/span&gt;&lt;/div&gt;';
      const expected = '<div><span>text</span></div>';
      expect(convertToUnescape(input)).toBe(expected);
    });

    it('should handle text without entities', () => {
      const input = 'hello world';
      const expected = 'hello world';
      expect(convertToUnescape(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      expect(convertToUnescape(input)).toBe(expected);
    });

    it('should handle special characters', () => {
      const input = '&lt;div class=&quot;test&quot;&gt;';
      const expected = '<div class="test">';
      expect(convertToUnescape(input)).toBe(expected);
    });
  });
});