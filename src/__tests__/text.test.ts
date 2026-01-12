import { describe, expect, it } from 'vitest';

import { caseConverters, convertLines } from '../domain/text/case';
import { countWords, getTextStats } from '../domain/text/counter';

describe('Text Domain', () => {
  describe('Case Service', () => {
    it('should convert to camelCase', () => {
      expect(caseConverters.camel('hello world')).toBe('helloWorld');
      expect(caseConverters.camel('hello_world')).toBe('helloWorld');
    });

    it('should convert to PascalCase', () => {
      expect(caseConverters.pascal('hello world')).toBe('HelloWorld');
    });

    it('should convert to snake_case', () => {
      expect(caseConverters.snake('helloWorld')).toBe('hello_world');
    });

    it('should convert to kebab-case', () => {
      expect(caseConverters.kebab('helloWorld')).toBe('hello-world');
    });

    it('should convert to CONSTANT_CASE', () => {
      expect(caseConverters.constant('helloWorld')).toBe('HELLO_WORLD');
    });

    it('should convert lines', () => {
      const input = 'hello world\nfoo bar';
      const result = convertLines('camel')(input);
      expect(result).toBe('helloWorld\nfooBar');
    });
  });

  describe('Counter Service', () => {
    it('should count words', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('  hello   world  ')).toBe(2);
      expect(countWords('')).toBe(0);
    });

    it('should get comprehensive text stats', () => {
      const text = 'Hello world.\nThis is a test.';
      const stats = getTextStats(text);

      expect(stats.words).toBe(6);
      expect(stats.sentences).toBe(2);
      expect(stats.lines).toBe(2);
      expect(stats.chars).toBe(text.length);
      expect(stats.readingTime).toBeDefined();
      expect(stats.speakingTime).toBeDefined();
    });

    it('should calculate reading time', () => {
      const text = 'word '.repeat(200); // 200 words
      const stats = getTextStats(text);
      expect(stats.readingTime).toBe('1 min');
    });
  });
});
