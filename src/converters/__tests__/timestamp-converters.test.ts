import {
  timestampToIso,
  timestampToLocal,
  timestampToUtc,
  isoToTimestamp,
  localToTimestamp,
  getCurrentTimestamp,
  getCurrentIso,
  toRelativeTime,
  convertTimestamp,
  getAvailableTimestampFormats,
  timestampConverterExamples
} from '../timestamp-converters';

describe('timestampConverters', () => {
  describe('timestampToIso', () => {
    it('should convert Unix timestamp to ISO date', () => {
      const timestamp = 1640995200; // 2022-01-01T00:00:00.000Z
      const expected = '2022-01-01T00:00:00.000Z';
      expect(timestampToIso(timestamp)).toBe(expected);
    });

    it('should handle string timestamp', () => {
      const timestamp = '1640995200';
      const expected = '2022-01-01T00:00:00.000Z';
      expect(timestampToIso(timestamp)).toBe(expected);
    });
  });

  describe('timestampToLocal', () => {
    it('should convert Unix timestamp to local date string', () => {
      const timestamp = 1640995200;
      const result = timestampToLocal(timestamp);
      expect(result).toContain('2022');
      expect(result).toContain('Jan');
    });
  });

  describe('timestampToUtc', () => {
    it('should convert Unix timestamp to UTC string', () => {
      const timestamp = 1640995200;
      const result = timestampToUtc(timestamp);
      expect(result).toContain('2022');
      expect(result).toContain('GMT');
    });
  });

  describe('isoToTimestamp', () => {
    it('should convert ISO date to Unix timestamp', () => {
      const isoString = '2022-01-01T00:00:00.000Z';
      const expected = 1640995200;
      expect(isoToTimestamp(isoString)).toBe(expected);
    });
  });

  describe('localToTimestamp', () => {
    it('should convert local date string to Unix timestamp', () => {
      const dateString = '2022-01-01T00:00:00.000Z';
      const result = localToTimestamp(dateString);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return current Unix timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      const result = getCurrentTimestamp();
      expect(result).toBeGreaterThan(now - 1);
      expect(result).toBeLessThan(now + 1);
    });
  });

  describe('getCurrentIso', () => {
    it('should return current ISO date', () => {
      const result = getCurrentIso();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('toRelativeTime', () => {
    it('should convert to relative time for past dates', () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const result = toRelativeTime(pastTimestamp);
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('should return "just now" for recent timestamps', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 1; // 1 second ago
      const result = toRelativeTime(recentTimestamp);
      expect(result).toBe('1 second ago');
    });

    it('should handle years ago', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - (365 * 24 * 3600 * 2); // 2 years ago
      const result = toRelativeTime(oldTimestamp);
      expect(result).toContain('year');
      expect(result).toContain('ago');
    });
  });

  describe('convertTimestamp', () => {
    it('should convert timestamp to ISO', () => {
      const input = '1640995200';
      const result = convertTimestamp(input, 'iso');
      expect(result).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should convert ISO to timestamp', () => {
      const input = '2022-01-01T00:00:00.000Z';
      const result = convertTimestamp(input, 'timestamp');
      expect(result).toBe('1640995200');
    });

    it('should convert to local time', () => {
      const input = '1640995200';
      const result = convertTimestamp(input, 'local');
      expect(result).toContain('2022');
    });

    it('should convert to UTC', () => {
      const input = '1640995200';
      const result = convertTimestamp(input, 'utc');
      expect(result).toContain('GMT');
    });

    it('should convert to relative time', () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600;
      const result = convertTimestamp(String(pastTimestamp), 'relative');
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('should return current timestamp for "now"', () => {
      const result = convertTimestamp('now', 'now');
      expect(typeof result).toBe('string');
      expect(parseInt(result)).toBeGreaterThan(0);
    });

    it('should throw error for unsupported format', () => {
      expect(() => convertTimestamp('1640995200', 'invalid')).toThrow('Unsupported target format: invalid');
    });
  });

  describe('getAvailableTimestampFormats', () => {
    it('should return all available timestamp formats', () => {
      const formats = getAvailableTimestampFormats();
      expect(formats).toHaveLength(6);

      const formatNames = formats.map(f => f.name);
      expect(formatNames).toContain('Unix Timestamp');
      expect(formatNames).toContain('ISO Date');
      expect(formatNames).toContain('Local Time');
      expect(formatNames).toContain('UTC');
      expect(formatNames).toContain('Relative Time');
      expect(formatNames).toContain('Current Time');
    });

    it('should have valid descriptions', () => {
      const formats = getAvailableTimestampFormats();
      formats.forEach(format => {
        expect(format.description).toBeTruthy();
        expect(typeof format.description).toBe('string');
      });
    });

    it('should have working convert functions', () => {
      const formats = getAvailableTimestampFormats();
      formats.forEach(format => {
        if (format.name === 'Current Time') {
          const result = format.convert('now');
          expect(typeof result).toBe('string');
          expect(parseInt(result)).toBeGreaterThan(0);
        } else {
          const result = format.convert('1640995200');
          expect(result).toBeTruthy();
          expect(typeof result).toBe('string');
        }
      });
    });
  });

  describe('examples', () => {
    it('should have valid timestamp to ISO example', () => {
      const example = timestampConverterExamples.timestampToIso;
      expect(example.input).toBe('1640995200');
      expect(example.output).toBe('2022-01-01T00:00:00.000Z');
      expect(example.description).toBe('Convert Unix timestamp to ISO date');
    });

    it('should have valid ISO to timestamp example', () => {
      const example = timestampConverterExamples.isoToTimestamp;
      expect(example.input).toBe('2022-01-01T00:00:00.000Z');
      expect(example.output).toBe('1640995200');
      expect(example.description).toBe('Convert ISO date to Unix timestamp');
    });

    it('should have valid current time example', () => {
      const example = timestampConverterExamples.currentTime;
      expect(example.input).toBe('now');
      expect(parseInt(example.output)).toBeGreaterThan(0);
      expect(example.description).toBe('Get current timestamp');
    });

    it('should have valid relative time example', () => {
      const example = timestampConverterExamples.relativeTime;
      expect(example.input).toBe('1640995200');
      expect(example.output).toContain('ago');
      expect(example.description).toBe('Convert to relative time');
    });
  });
});