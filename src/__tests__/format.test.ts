import { describe, expect, it } from 'vitest';

import { isPlainObject, sortObjectKeys } from '../domain/format/json';
import { countStatements } from '../domain/format/sql';

import { JsonFormatterBuilder, SqlFormatterBuilder } from './builders/format-builder';

describe('Format Domain', () => {
  describe('JSON Service', () => {
    it('should identify plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ key: 'value' })).toBe(true);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject('string')).toBe(false);
    });

    it('should sort object keys alphabetically', () => {
      const input = { z: 1, a: 2, m: 3 };
      const sorted = sortObjectKeys(input) as Record<string, number>;
      expect(Object.keys(sorted)).toEqual(['a', 'm', 'z']);
    });

    it('should sort nested object keys', () => {
      const input = { z: { y: 1, x: 2 }, a: 1 };
      const sorted = sortObjectKeys(input) as Record<string, unknown>;
      expect(Object.keys(sorted)).toEqual(['a', 'z']);
      expect(Object.keys(sorted.z as Record<string, number>)).toEqual(['x', 'y']);
    });

    it('should format JSON with indentation', () => {
      const input = '{"b":2,"a":1}';
      const formatted = new JsonFormatterBuilder().withJson(input).withSpace(2).format();

      expect(formatted).toContain('  ');
      expect(JSON.parse(formatted)).toEqual({ b: 2, a: 1 });
    });

    it('should format JSON with sorted keys', () => {
      const input = '{"b":2,"a":1}';
      const formatted = new JsonFormatterBuilder()
        .withJson(input)
        .withSpace(2)
        .withSort(true)
        .format();

      const lines = formatted.split('\n');
      expect(lines[1]).toContain('"a"');
      expect(lines[2]).toContain('"b"');
    });

    it('should sort keys inside arrays', () => {
      const input = '[{"b":2,"a":1}]';
      const formatted = new JsonFormatterBuilder().withJson(input).withSort(true).format();

      const lines = formatted.split('\n');
      expect(lines).toContain('    "a": 1,');
      expect(lines).toContain('    "b": 2');
    });

    it('should minify JSON when indent is 0', () => {
      const formatted = new JsonFormatterBuilder()
        .withJson('{\n  "key": "value"\n}')
        .withSpace(0)
        .format();
      expect(formatted).toBe('{"key":"value"}');
    });
  });

  describe('SQL Service', () => {
    it('should format SQL query', () => {
      const formatted = new SqlFormatterBuilder()
        .withSql('SELECT * FROM users WHERE id=1')
        .format();

      expect(formatted).toContain('SELECT');
      expect(formatted).toContain('FROM');
      expect(formatted).toContain('WHERE');
    });

    it('should count SQL statements', () => {
      const query = 'SELECT * FROM users; DELETE FROM logs;';
      expect(countStatements(query)).toBe(2);
    });

    it('should handle queries without semicolons', () => {
      const query = 'SELECT * FROM users';
      expect(countStatements(query)).toBe(0);
    });
  });
});
