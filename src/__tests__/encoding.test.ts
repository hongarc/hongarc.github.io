import { describe, expect, it } from 'vitest';

import { decodeBase64, encodeBase64 } from '../domain/encoding/base64';
import {
  escapeHtml,
  escapeJs,
  escapeJson,
  escapeSql,
  escapeUrl,
  unescapeHtml,
  unescapeJs,
  unescapeJson,
  unescapeSql,
  unescapeUrl,
} from '../domain/encoding/escape';
import { processUrl } from '../domain/encoding/url';

describe('Encoding Domain', () => {
  describe('Base64 Service', () => {
    it('should encode and decode standard string', () => {
      const input = 'Hello World';
      const encoded = encodeBase64(input, false);
      expect(encoded).toBe('SGVsbG8gV29ybGQ=');
      expect(decodeBase64(encoded, false)).toBe(input);
    });

    it('should handle UTF-8 characters', () => {
      const input = '👋🌍';
      const encoded = encodeBase64(input, false);
      expect(decodeBase64(encoded, false)).toBe(input);
    });

    it('should handle URL safe encoding', () => {
      const input = 'Subject?'; // In standard base64: U3ViamVjdD8=
      const encoded = encodeBase64(input, true);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
      expect(decodeBase64(encoded, true)).toBe(input);
    });

    it('should decode url-safe base64 with required padding', () => {
      // "M" -> "TQ==" (Base64) -> "TQ" (Base64URL)
      // Length 2. %4 = 2. Padding required = 2.
      const encoded = 'TQ';
      expect(decodeBase64(encoded, true)).toBe('M');
    });

    it('should decode base64 without padding', () => {
      const encoded = 'TWFu'; // "Man" -> "TWFu" (length 4, no padding)
      expect(decodeBase64(encoded, true)).toBe('Man');
    });
  });

  describe('URL Service', () => {
    it('should encode and decode URI', () => {
      const input = 'https://example.com/path space';
      const encoded = processUrl(input, 'encode');
      expect(encoded).toBe('https://example.com/path%20space');
      expect(processUrl(encoded, 'decode')).toBe(input);
    });

    it('should encode and decode URI component', () => {
      const input = 'path/to/resource?query=val';
      const encoded = processUrl(input, 'encodeComponent');
      expect(encoded).toBe('path%2Fto%2Fresource%3Fquery%3Dval');
      expect(processUrl(encoded, 'decodeComponent')).toBe(input);
    });
  });

  describe('Escape Service', () => {
    describe('JavaScript', () => {
      it('should escape JS special chars', () => {
        const input = "console.log('test')";
        const escaped = escapeJs(input);
        expect(escaped).toContain(String.raw`\'`);
        expect(unescapeJs(escaped)).toBe(input);
      });
    });

    describe('JSON', () => {
      it('should escape JSON string', () => {
        const input = 'Line 1\nLine 2';
        const escaped = escapeJson(input);
        expect(escaped).toContain(String.raw`\n`);
        expect(unescapeJson(escaped)).toBe(input);
      });
    });

    describe('HTML', () => {
      it('should escape HTML entities', () => {
        const input = '<div class="test"> & \'</div>';
        const escaped = escapeHtml(input);
        expect(escaped).toBe('&lt;div class=&quot;test&quot;&gt; &amp; &#39;&lt;/div&gt;');
        expect(unescapeHtml(escaped)).toBe(input);
      });
    });

    describe('URL', () => {
      it('should escape URL', () => {
        const input = 'hello world';
        const escaped = escapeUrl(input);
        expect(escaped).toBe('hello%20world');
        expect(unescapeUrl(escaped)).toBe(input);
      });
    });

    describe('SQL', () => {
      it('should escape SQL quotes', () => {
        const input = "O'Connor";
        const escaped = escapeSql(input);
        expect(escaped).toBe("O''Connor");
        expect(unescapeSql(escaped)).toBe(input);
      });
    });
  });
});
