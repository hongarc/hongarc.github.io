import { describe, expect, it } from 'vitest';

import {
  generateCuid,
  generateId,
  generateMongoId,
  generateUuidV4,
  generateUuidV7,
} from '../domain/generators/id';
import {
  generateParagraph,
  generateParagraphs,
  generateSentence,
  generateWords,
  LOREM_WORDS,
} from '../domain/generators/lorem';
import { createSlug, removeAccents, separators } from '../domain/generators/slug';

describe('Generators Domain', () => {
  describe('ID Service', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateUuidV4();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate valid UUID v7', () => {
      const uuid = generateUuidV7();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate valid CUID', () => {
      const cuid = generateCuid();
      expect(cuid).toMatch(/^c[0-9a-z]+$/);
      expect(cuid.length).toBeGreaterThan(20);
    });

    it('should generate valid MongoDB ObjectID', () => {
      const mongoId = generateMongoId();
      expect(mongoId).toMatch(/^[0-9a-f]{24}$/);
    });

    it('should generate correct ID type', () => {
      expect(generateId('uuidv4')).toMatch(/^[0-9a-f-]{36}$/);
      expect(generateId('mongodb')).toMatch(/^[0-9a-f]{24}$/);
    });
  });

  describe('Lorem Service', () => {
    it('should generate specified number of words', () => {
      const words = generateWords(10);
      expect(words.split(' ')).toHaveLength(10);
    });

    it('should generate words from word list', () => {
      const words = generateWords(5);
      for (const word of words.split(' ')) {
        expect(LOREM_WORDS).toContain(word);
      }
    });

    it('should generate sentence with period', () => {
      const sentence = generateSentence();
      expect(sentence).toMatch(/^[A-Z].*\.$/);
    });

    it('should generate paragraph with multiple sentences', () => {
      const paragraph = generateParagraph();
      const sentences = paragraph.split('. ');
      expect(sentences.length).toBeGreaterThanOrEqual(4);
    });

    it('should generate multiple paragraphs', () => {
      const paragraphs = generateParagraphs(3);
      expect(paragraphs.split('\n\n')).toHaveLength(3);
    });

    it('should generate multiple paragraphs with wrapped lines', () => {
      const paragraphs = generateParagraphs(2, true);
      expect(paragraphs.split('\n\n')).toHaveLength(2);
      expect(paragraphs).toContain('\n');
    });
  });

  describe('Slug Service', () => {
    it('should convert text to lowercase slug', () => {
      const slug = createSlug(separators.dash)('Hello World');
      expect(slug).toBe('hello-world');
    });

    it('should remove accents', () => {
      expect(removeAccents('café')).toBe('cafe');
      expect(removeAccents('naïve')).toBe('naive');
    });

    it('should handle special characters', () => {
      const slug = createSlug(separators.dash)('Hello, World! This is a Test.');
      expect(slug).toBe('hello-world-this-is-a-test');
    });

    it('should use different separators', () => {
      const dashSlug = createSlug(separators.dash)('Hello World');
      const underscoreSlug = createSlug(separators.underscore)('Hello World');
      const dotSlug = createSlug(separators.dot)('Hello World');

      expect(dashSlug).toBe('hello-world');
      expect(underscoreSlug).toBe('hello_world');
      expect(dotSlug).toBe('hello.world');
    });

    it('should collapse multiple spaces and separators', () => {
      const slug = createSlug(separators.dash)('Hello    World   Test');
      expect(slug).toBe('hello-world-test');
    });
  });
});
