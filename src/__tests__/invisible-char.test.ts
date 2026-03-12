import { describe, expect, it } from 'vitest';

import {
  analyzeText,
  buildSegments,
  CHAR_LOOKUP,
  INVISIBLE_CHARS,
  removeInvisibleChars,
} from '../domain/text/invisible-char';

describe('Invisible Char Domain', () => {
  describe('INVISIBLE_CHARS database', () => {
    it('should have unique code points', () => {
      const codePoints = INVISIBLE_CHARS.map((c) => c.codePoint);
      expect(new Set(codePoints).size).toBe(codePoints.length);
    });

    it('should have matching unicode strings', () => {
      for (const c of INVISIBLE_CHARS) {
        const expected = `U+${c.codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
        expect(c.unicode).toBe(expected);
      }
    });

    it('should build lookup map for all entries', () => {
      expect(CHAR_LOOKUP.size).toBe(INVISIBLE_CHARS.length);
    });
  });

  describe('analyzeText', () => {
    it('should return zero findings for clean text', () => {
      const result = analyzeText('hello world');
      expect(result.invisibleChars).toBe(0);
      expect(result.visibleChars).toBe(11);
      expect(result.totalChars).toBe(11);
      expect(result.findings).toHaveLength(0);
      expect(result.grouped).toHaveLength(0);
    });

    it('should return zero findings for empty string', () => {
      const result = analyzeText('');
      expect(result.totalChars).toBe(0);
      expect(result.invisibleChars).toBe(0);
    });

    it('should detect zero-width space', () => {
      const result = analyzeText('hello\u200Bworld');
      expect(result.invisibleChars).toBe(1);
      expect(result.visibleChars).toBe(10);
      expect(result.totalChars).toBe(11);
      expect(result.findings).toMatchObject([
        { index: 5, info: { unicode: 'U+200B' } },
      ]);
    });

    it('should detect word joiner', () => {
      const result = analyzeText('hidden:\u2060email@test.com');
      expect(result.invisibleChars).toBe(1);
      expect(result.findings).toMatchObject([
        { index: 7, info: { name: 'Word Joiner' } },
      ]);
    });

    it('should detect BOM', () => {
      const result = analyzeText('\uFEFFhello');
      expect(result.invisibleChars).toBe(1);
      expect(result.findings).toMatchObject([
        { index: 0, info: { unicode: 'U+FEFF' } },
      ]);
    });

    it('should not flag non-breaking space (has visible width)', () => {
      const result = analyzeText('hello\u00A0world');
      expect(result.invisibleChars).toBe(0);
    });

    it('should detect multiple different invisible chars', () => {
      const result = analyzeText('a\u200Bb\u2060c\uFEFFd');
      expect(result.invisibleChars).toBe(3);
      expect(result.visibleChars).toBe(4);
      expect(result.grouped).toHaveLength(3);
    });

    it('should group repeated invisible chars', () => {
      const result = analyzeText('\u200Bhello\u200Bworld\u200B');
      expect(result.invisibleChars).toBe(3);
      expect(result.grouped).toHaveLength(1);
      expect(result.grouped).toMatchObject([
        { count: 3, positions: [0, 6, 12] },
      ]);
    });

    it('should detect variation selectors', () => {
      const result = analyzeText('a\uFE0Fb');
      expect(result.invisibleChars).toBe(1);
      expect(result.findings).toMatchObject([
        { info: { name: 'Variation Selector 16' } },
      ]);
    });

    it('should detect bidi formatting chars', () => {
      const result = analyzeText('hello\u202Aworld\u202C');
      expect(result.invisibleChars).toBe(2);
      expect(result.grouped).toHaveLength(2);
    });

    it('should not flag normal whitespace (space, newline, tab)', () => {
      const result = analyzeText('hello world\n\ttab');
      expect(result.invisibleChars).toBe(0);
    });
  });

  describe('removeInvisibleChars', () => {
    it('should return same string when no invisible chars', () => {
      expect(removeInvisibleChars('hello world')).toBe('hello world');
    });

    it('should return empty string for empty input', () => {
      expect(removeInvisibleChars('')).toBe('');
    });

    it('should remove zero-width space', () => {
      expect(removeInvisibleChars('hello\u200Bworld')).toBe('helloworld');
    });

    it('should remove BOM', () => {
      expect(removeInvisibleChars('\uFEFFhello')).toBe('hello');
    });

    it('should remove multiple invisible chars', () => {
      expect(removeInvisibleChars('\u200Bh\u2060e\uFEFFllo')).toBe('hello');
    });

    it('should remove all occurrences of same char', () => {
      expect(removeInvisibleChars('\u200Ba\u200Bb\u200B')).toBe('ab');
    });

    it('should preserve normal whitespace', () => {
      expect(removeInvisibleChars('hello world\n\ttab')).toBe('hello world\n\ttab');
    });

    it('should handle string of only invisible chars', () => {
      expect(removeInvisibleChars('\u200B\u200C\u200D\u2060\uFEFF')).toBe('');
    });
  });

  describe('buildSegments', () => {
    it('should return empty array for empty string', () => {
      expect(buildSegments('')).toEqual([]);
    });

    it('should return single text segment for clean text', () => {
      const segments = buildSegments('hello');
      expect(segments).toHaveLength(1);
      expect(segments).toMatchObject([{ type: 'text', value: 'hello' }]);
    });

    it('should split around invisible char', () => {
      const segments = buildSegments('hello\u200Bworld');
      expect(segments).toHaveLength(3);
      expect(segments).toMatchObject([
        { type: 'text', value: 'hello' },
        { type: 'invisible', info: { unicode: 'U+200B' } },
        { type: 'text', value: 'world' },
      ]);
    });

    it('should handle invisible char at start', () => {
      const segments = buildSegments('\u200Bhello');
      expect(segments).toHaveLength(2);
      expect(segments).toMatchObject([
        { type: 'invisible' },
        { type: 'text', value: 'hello' },
      ]);
    });

    it('should handle invisible char at end', () => {
      const segments = buildSegments('hello\u200B');
      expect(segments).toHaveLength(2);
      expect(segments).toMatchObject([
        { type: 'text', value: 'hello' },
        { type: 'invisible' },
      ]);
    });

    it('should handle consecutive invisible chars', () => {
      const segments = buildSegments('a\u200B\u2060b');
      expect(segments).toHaveLength(4);
      expect(segments).toMatchObject([
        { type: 'text', value: 'a' },
        { type: 'invisible' },
        { type: 'invisible' },
        { type: 'text', value: 'b' },
      ]);
    });

    it('should handle string of only invisible chars', () => {
      const segments = buildSegments('\u200B\u2060');
      expect(segments).toHaveLength(2);
      expect(segments.every((s) => s.type === 'invisible')).toBe(true);
    });
  });
});
