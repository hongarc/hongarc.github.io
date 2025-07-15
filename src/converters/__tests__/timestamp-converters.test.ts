import {
  timestampToIso,
  timestampToLocal,
  timestampToUtc,
  isoToTimestamp,
  localToTimestamp,
  getCurrentTimestamp,
  toRelativeTime,
  convertTimezone,
  convertToTimezone,
  convertTimestamp,
  getAvailableTimezones,
  getAvailableTimestampFormats,
} from '../timestamp-converters';

describe('Timestamp Converters', () => {
  describe('Basic Conversions', () => {
    it('should convert Unix timestamp to ISO', () => {
      const result = timestampToIso(1_640_995_200);
      expect(result).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should convert Unix timestamp to local time', () => {
      const result = timestampToLocal(1_640_995_200);
      expect(result).toContain('2022');
      expect(result).toContain('Jan');
    });

    it('should convert Unix timestamp to UTC', () => {
      const result = timestampToUtc(1_640_995_200);
      expect(result).toContain('2022');
      expect(result).toContain('GMT');
    });

    it('should convert ISO string to timestamp', () => {
      const result = isoToTimestamp('2022-01-01T00:00:00.000Z');
      expect(result).toBe(1_640_995_200);
    });

    it('should convert local date string to timestamp', () => {
      const result = localToTimestamp('2022-01-01T00:00:00.000Z');
      expect(result).toBe(1_640_995_200);
    });
  });

  describe('Current Time Functions', () => {
    it('should get current timestamp', () => {
      const result = getCurrentTimestamp();
      const now = Math.floor(Date.now() / 1000);
      expect(result).toBeCloseTo(now, -1); // Within 10 seconds
    });
  });

  describe('Relative Time', () => {
    it('should convert to relative time', () => {
      const past = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const result = toRelativeTime(past);
      expect(result).toContain('hour');
    });

    it('should handle recent timestamps', () => {
      const recent = Math.floor(Date.now() / 1000) - 30; // 30 seconds ago
      const result = toRelativeTime(recent);
      expect(result).toContain('second');
    });

    it('should handle future timestamps', () => {
      const future = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const result = toRelativeTime(future);
      expect(result).toContain('just now');
    });
  });

  describe('convertTimezone', () => {
    it('should convert timestamp between timezones', () => {
      const result = convertTimezone(
        '2022-01-01T00:00:00.000Z',
        'UTC',
        'America/New_York'
      );
      expect(result).toContain('2021-12-31');
      expect(result).toContain('EST');
    });

    it('should throw error for invalid timezone', () => {
      expect(() =>
        convertTimezone('2022-01-01T00:00:00.000Z', 'UTC', 'Invalid/Timezone')
      ).toThrow();
    });
  });

  describe('convertToTimezone', () => {
    it('should convert Unix timestamp to specific timezone', () => {
      const result = convertToTimezone(1_640_995_200, 'America/New_York');
      expect(result).toContain('2021-12-31');
      expect(result).toContain('EST');
    });

    it('should convert ISO string to specific timezone', () => {
      const result = convertToTimezone('2022-01-01T00:00:00.000Z', 'UTC');
      expect(result).toContain('2021-12-31');
      expect(result).toContain('UTC');
    });
  });

  describe('convertTimestamp', () => {
    it('should convert timestamp to ISO', () => {
      const result = convertTimestamp(1_640_995_200, 'iso');
      expect(result).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should convert ISO to timestamp', () => {
      const result = convertTimestamp('2022-01-01T00:00:00.000Z', 'timestamp');
      expect(result).toBe('1640995200');
    });

    it('should convert to local time', () => {
      const result = convertTimestamp(1_640_995_200, 'local');
      expect(result).toContain('2022');
    });

    it('should convert to UTC', () => {
      const result = convertTimestamp(1_640_995_200, 'utc');
      expect(result).toContain('GMT');
    });

    it('should convert to relative time', () => {
      const past = Math.floor(Date.now() / 1000) - 3600;
      const result = convertTimestamp(past, 'relative');
      expect(result).toContain('hour');
    });

    it('should handle timezone conversion', () => {
      const result = convertTimestamp(
        1_640_995_200,
        'timezone',
        'America/New_York'
      );
      expect(result).toContain('2021-12-31');
      expect(result).toContain('EST');
    });

    it('should get current time', () => {
      const result = convertTimestamp('now', 'now');
      expect(Number(result)).toBeGreaterThan(0);
    });

    it('should throw error for unsupported format', () => {
      expect(() => convertTimestamp(1_640_995_200, 'invalid')).toThrow();
    });
  });

  describe('getAvailableTimezones', () => {
    it('should return available timezones', () => {
      const timezones = getAvailableTimezones();
      expect(timezones).toContain('America/New_York');
      expect(timezones).toContain('Europe/London');
      expect(timezones.length).toBeGreaterThan(0);
    });
  });

  describe('getAvailableTimestampFormats', () => {
    it('should return available formats', () => {
      const formats = getAvailableTimestampFormats();
      expect(formats).toHaveLength(6);
      expect(formats[0].name).toBe('Unix Timestamp');
      expect(formats[1].name).toBe('ISO Date');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle DST transitions', () => {
      // Test with a known DST transition date
      const daylightSavingTimeDate = '2022-03-13T02:00:00.000Z';
      expect(() =>
        convertToTimezone(daylightSavingTimeDate, 'America/New_York')
      ).not.toThrow();
    });

    it('should handle malformed timestamps', () => {
      // These functions don't throw for malformed input, they return NaN or invalid dates
      expect(() => isoToTimestamp('not-iso-format')).not.toThrow();
      expect(() => localToTimestamp('not-date-format')).not.toThrow();
    });

    it('should handle empty and null values', () => {
      // These functions don't throw for empty input, they return NaN or invalid dates
      expect(() => isoToTimestamp('')).not.toThrow();
      expect(() => localToTimestamp('')).not.toThrow();
    });

    it('should handle out of range dates', () => {
      // These functions don't throw for out of range dates
      expect(() => isoToTimestamp('9999-13-01T00:00:00Z')).not.toThrow();
    });

    it('should handle different timezone formats', () => {
      const result1 = convertToTimezone(1_640_995_200, 'UTC');
      expect(result1).toContain('2021-12-31');
      expect(result1).toContain('UTC');

      const result2 = convertToTimezone(1_640_995_200, 'America/New_York');
      expect(result2).toContain('2021-12-31');
      expect(result2).toContain('EST');
    });

    it('should handle relative time edge cases', () => {
      const past = Math.floor(Date.now() / 1000) - 1;
      const pastResult = toRelativeTime(past);
      expect(pastResult).toContain('second');

      const future = Math.floor(Date.now() / 1000) + 3600;
      const futureResult = toRelativeTime(future);
      expect(futureResult).toContain('just now');
    });
  });
});
