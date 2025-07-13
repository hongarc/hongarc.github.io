import {
  parseSize,
  toBytes,
  fromBytes,
  convertByteSize,
  getAvailableUnits,
  toHumanReadable,
  parseFriendlySize,
  getAvailableByteSizeFormats,
  byteSizeConverterExamples,
} from '../byte-size-converters';

describe('byteSizeConverters', () => {
  describe('parseSize', () => {
    it('should parse size with unit', () => {
      const result = parseSize('1024 KB');
      expect(result.value).toBe(1024);
      expect(result.unit).toBe('KB');
    });

    it('should parse size without spaces', () => {
      const result = parseSize('1.5MB');
      expect(result.value).toBe(1.5);
      expect(result.unit).toBe('MB');
    });

    it('should handle different units', () => {
      expect(parseSize('2GB')).toEqual({ value: 2, unit: 'GB' });
      expect(parseSize('500MB')).toEqual({ value: 500, unit: 'MB' });
      expect(parseSize('1000KB')).toEqual({ value: 1000, unit: 'KB' });
    });

    it('should handle bytes and bits', () => {
      expect(parseSize('1024B')).toEqual({ value: 1024, unit: 'B' });
      expect(parseSize('8B')).toEqual({ value: 8, unit: 'B' });
    });

    it('should assume bytes when no unit specified', () => {
      const result = parseSize('1024');
      expect(result.value).toBe(1024);
      expect(result.unit).toBe('B');
    });

    it('should throw error for invalid format', () => {
      expect(() => parseSize('invalid')).toThrow('Invalid size format');
    });
  });

  describe('toBytes', () => {
    it('should convert KB to bytes (binary)', () => {
      const result = toBytes('1024 KB', 'binary');
      expect(result).toBe(1_048_576); // 1024 * 1024
    });

    it('should convert KB to bytes (decimal)', () => {
      const result = toBytes('1000 KB', 'decimal');
      expect(result).toBe(1_000_000); // 1000 * 1000
    });

    it('should convert MB to bytes (binary)', () => {
      const result = toBytes('1 MB', 'binary');
      expect(result).toBe(1_048_576); // 1024 * 1024
    });

    it('should convert MB to bytes (decimal)', () => {
      const result = toBytes('1 MB', 'decimal');
      expect(result).toBe(1_000_000); // 1000 * 1000
    });

    it('should convert bits to bytes', () => {
      const result = toBytes('8 B');
      expect(result).toBe(64); // 8 bytes = 64 bits
    });

    it('should handle bytes directly', () => {
      const result = toBytes('1024 B');
      expect(result).toBe(8192); // 1024 * 8 bits
    });
  });

  describe('fromBytes', () => {
    it('should convert bytes to KB (binary)', () => {
      const result = fromBytes(1_048_576, 'KB', 'binary');
      expect(result).toBe('1024');
    });

    it('should convert bytes to KB (decimal)', () => {
      const result = fromBytes(1_000_000, 'KB', 'decimal');
      expect(result).toBe('1000');
    });

    it('should convert bytes to MB (binary)', () => {
      const result = fromBytes(1_048_576, 'MB', 'binary');
      expect(result).toBe('1.000');
    });

    it('should convert bytes to MB (decimal)', () => {
      const result = fromBytes(1_000_000, 'MB', 'decimal');
      expect(result).toBe('1.000');
    });

    it('should format with appropriate precision', () => {
      expect(fromBytes(1536, 'KB', 'binary')).toBe('1.500');
      expect(fromBytes(100, 'KB', 'binary')).toBe('0.098');
    });
  });

  describe('convertByteSize', () => {
    it('should convert KB to MB (binary)', () => {
      const result = convertByteSize('2048 KB', 'MB', 'binary');
      expect(result).toBe('2.000 MB');
    });

    it('should convert MB to KB (binary)', () => {
      const result = convertByteSize('1 MB', 'KB', 'binary');
      expect(result).toBe('1024 KB');
    });

    it('should convert using decimal base', () => {
      const result = convertByteSize('1000 KB', 'MB', 'decimal');
      expect(result).toBe('1.000 MB');
    });

    it('should handle bits and bytes', () => {
      const result = convertByteSize('8 B', 'B');
      expect(result).toBe('8.000 B');
    });

    it('should throw error for unknown unit', () => {
      expect(() => convertByteSize('1024 KB', 'INVALID')).toThrow(
        'Unknown target unit: INVALID'
      );
    });
  });

  describe('getAvailableUnits', () => {
    it('should return all available units', () => {
      const units = getAvailableUnits();
      expect(units).toContain('b');
      expect(units).toContain('B');
      expect(units).toContain('KB');
      expect(units).toContain('MB');
      expect(units).toContain('GB');
      expect(units).toContain('TB');
      expect(units).toContain('PB');
    });
  });

  describe('toHumanReadable', () => {
    it('should convert bytes to human readable', () => {
      expect(toHumanReadable(1024)).toBe('1.00 KB');
      expect(toHumanReadable(1_048_576)).toBe('1.00 MB');
      expect(toHumanReadable(1_073_741_824)).toBe('1.00 GB');
    });

    it('should handle small sizes', () => {
      expect(toHumanReadable(512)).toBe('512.00 B');
      expect(toHumanReadable(1536)).toBe('1.50 KB');
    });
  });

  describe('parseFriendlySize', () => {
    it('should parse friendly size strings', () => {
      expect(parseFriendlySize('1.5MB')).toBe(1_572_864); // 1.5 * 1024 * 1024
      expect(parseFriendlySize('2GB')).toBe(2_147_483_648); // 2 * 1024 * 1024 * 1024
    });
  });

  describe('getAvailableByteSizeFormats', () => {
    it('should return all available byte size formats', () => {
      const formats = getAvailableByteSizeFormats();
      expect(formats).toHaveLength(11);

      const formatNames = formats.map(f => f.name);
      expect(formatNames).toContain('Bits');
      expect(formatNames).toContain('Bytes');
      expect(formatNames).toContain('KB (Binary)');
      expect(formatNames).toContain('MB (Binary)');
      expect(formatNames).toContain('GB (Binary)');
      expect(formatNames).toContain('TB (Binary)');
      expect(formatNames).toContain('KB (Decimal)');
      expect(formatNames).toContain('MB (Decimal)');
      expect(formatNames).toContain('GB (Decimal)');
      expect(formatNames).toContain('TB (Decimal)');
      expect(formatNames).toContain('Human Readable');
    });

    it('should have valid descriptions', () => {
      const formats = getAvailableByteSizeFormats();
      for (const format of formats) {
        expect(format.description).toBeTruthy();
        expect(typeof format.description).toBe('string');
      }
    });

    it('should have working convert functions', () => {
      const formats = getAvailableByteSizeFormats();
      for (const format of formats) {
        const result = format.convert('1024 KB', 'MB');
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      }
    });
  });

  describe('examples', () => {
    it('should have valid bytes to KB example', () => {
      const example = byteSizeConverterExamples.bytesToKB;
      expect(example.input).toBe('2048 B');
      expect(example.output).toBe('2 KB');
      expect(example.description).toBe('Convert 2048 bytes to KB (binary)');
    });

    it('should have valid MB to bytes example', () => {
      const example = byteSizeConverterExamples.mbToBytes;
      expect(example.input).toBe('1.5 MB');
      expect(example.output).toBe('1572864 B');
      expect(example.description).toBe('Convert 1.5 MB to bytes');
    });

    it('should have valid GB to MB example', () => {
      const example = byteSizeConverterExamples.gbToMb;
      expect(example.input).toBe('2 GB');
      expect(example.output).toBe('2048 MB');
      expect(example.description).toBe('Convert 2 GB to MB (binary)');
    });

    it('should have valid human readable example', () => {
      const example = byteSizeConverterExamples.humanReadable;
      expect(example.input).toBe('1572864 B');
      expect(example.output).toBe('1.50 MB');
      expect(example.description).toBe('Convert to human readable format');
    });

    it('should have valid decimal conversion example', () => {
      const example = byteSizeConverterExamples.decimalConversion;
      expect(example.input).toBe('1000 KB');
      expect(example.output).toBe('1 MB');
      expect(example.description).toBe('Convert using decimal base (1000)');
    });
  });
});
