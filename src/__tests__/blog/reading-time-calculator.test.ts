import { beforeEach, describe, expect, it } from 'vitest';

import {
  calculateReadingTime,
  formatReadingTime,
  ReadingTimeCalculator,
} from '@/blog/reading-time-calculator';

describe('Reading Time Calculator', () => {
  describe('calculateReadingTime', () => {
    it('should calculate reading time for simple text', () => {
      // 200 words at 200 WPM = 1 minute
      const words = Array.from({ length: 200 }, (_, i) => `word${String(i)}`).join(' ');
      const result = calculateReadingTime(words);

      expect(result.minutes).toBe(1);
      expect(result.words).toBe(200);
      expect(result.codeBlocks).toBe(0);
      expect(result.images).toBe(0);
    });

    it('should handle code blocks with slower reading speed', () => {
      const content = `Some regular text with about twenty words here to test the calculation.

\`\`\`javascript
// This code block has about twenty words
const example = "code";
function test() { return true; }
\`\`\`

More regular text with twenty words to complete the test case.`;

      const result = calculateReadingTime(content);

      expect(result.words).toBeGreaterThan(40); // Regular text + code words
      expect(result.codeBlocks).toBe(1);
      expect(result.minutes).toBeGreaterThan(0);
    });

    it('should count images and add reading time', () => {
      const content = `Text content here.

![Image 1](image1.jpg)
![Image 2](image2.jpg)

More text content.`;

      const result = calculateReadingTime(content);

      expect(result.images).toBe(2);
      expect(result.minutes).toBeGreaterThanOrEqual(1); // At least 1 minute due to images
    });

    it('should remove frontmatter before calculation', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "2024-01-15"
---

This is the actual content that should be counted for reading time.`;

      const result = calculateReadingTime(content);

      expect(result.words).toBe(12); // Only content words, not frontmatter
    });

    it('should handle inline code differently from code blocks', () => {
      const content = `Regular text with \`inline code\` should be treated as regular text.

\`\`\`
This is a code block
with multiple lines
\`\`\`

More regular text.`;

      const result = calculateReadingTime(content);

      expect(result.codeBlocks).toBe(1);
      expect(result.words).toBeGreaterThan(0);
    });

    it('should return minimum 1 minute for very short content', () => {
      const content = 'Short.';
      const result = calculateReadingTime(content);

      expect(result.minutes).toBe(1);
    });

    it('should handle custom configuration', () => {
      const content = Array.from({ length: 300 }, (_, i) => `word${String(i)}`).join(' ');
      const result = calculateReadingTime(content, { wordsPerMinute: 300 });

      expect(result.minutes).toBe(1); // 300 words at 300 WPM = 1 minute
    });

    it('should remove markdown formatting for word counting', () => {
      const content = `# Header

This is **bold** and *italic* text with [links](url) and \`inline code\`.

- List item 1
- List item 2

> Blockquote text here`;

      const result = calculateReadingTime(content);

      // Should count words without markdown syntax
      expect(result.words).toBeGreaterThan(10);
      expect(result.words).toBeLessThan(30); // Shouldn't count markdown syntax
    });
  });

  describe('formatReadingTime', () => {
    it('should format single minute', () => {
      expect(formatReadingTime(1)).toBe('1 min read');
    });

    it('should format multiple minutes', () => {
      expect(formatReadingTime(5)).toBe('5 min read');
    });

    it('should handle zero minutes', () => {
      expect(formatReadingTime(0)).toBe('0 min read');
    });
  });

  describe('ReadingTimeCalculator class', () => {
    let calculator: ReadingTimeCalculator;

    beforeEach(() => {
      calculator = new ReadingTimeCalculator();
    });

    it('should calculate reading time using class method', () => {
      const content = Array.from({ length: 200 }, (_, i) => `word${String(i)}`).join(' ');
      const result = calculator.calculate(content);

      expect(result.minutes).toBe(1);
      expect(result.words).toBe(200);
    });

    it('should format reading time using class method', () => {
      expect(calculator.format(3)).toBe('3 min read');
    });

    it('should use custom configuration', () => {
      const customCalculator = new ReadingTimeCalculator({ wordsPerMinute: 100 });
      const content = Array.from({ length: 200 }, (_, i) => `word${String(i)}`).join(' ');
      const result = customCalculator.calculate(content);

      expect(result.minutes).toBe(2); // 200 words at 100 WPM = 2 minutes
    });
  });
});
