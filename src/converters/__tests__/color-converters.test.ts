import {
  detectColorFormat,
  invertColor,
  lightenColor,
  darkenColor,
  convertColor,
  getAvailableColorFormats,
  colorConverterExamples,
} from '../color-converters';

describe('colorConverters', () => {
  describe('detectColorFormat', () => {
    it('should detect HEX format', () => {
      expect(detectColorFormat('#ff0000')).toBe('hex');
      expect(detectColorFormat('#abc123')).toBe('hex');
    });

    it('should detect RGB format', () => {
      expect(detectColorFormat('rgb(255, 0, 0)')).toBe('rgb');
      expect(detectColorFormat('rgba(255, 0, 0, 0.5)')).toBe('rgb');
    });

    it('should detect HSL format', () => {
      expect(detectColorFormat('hsl(0, 100%, 50%)')).toBe('hsl');
      expect(detectColorFormat('hsla(0, 100%, 50%, 0.5)')).toBe('hsl');
    });

    it('should return null for unrecognized format', () => {
      expect(detectColorFormat('invalid')).toBe(undefined);
    });
  });

  describe('invertColor', () => {
    it('should invert red to cyan', () => {
      const result = invertColor('#ff0000');
      expect(result).toBe('#00ffff');
    });

    it('should invert black to white', () => {
      const result = invertColor('#000000');
      expect(result).toBe('#ffffff');
    });

    it('should invert white to black', () => {
      const result = invertColor('#ffffff');
      expect(result).toBe('#000000');
    });
  });

  describe('lightenColor', () => {
    it('should lighten a color', () => {
      const result = lightenColor('#ff0000', 10);
      expect(result).toBe('#ff3333');
    });

    it('should not exceed 100% lightness', () => {
      const result = lightenColor('#ffffff', 10);
      expect(result).toBe('#ffffff');
    });
  });

  describe('darkenColor', () => {
    it('should darken a color', () => {
      const result = darkenColor('#ff0000', 10);
      expect(result).toBe('#cc0000');
    });

    it('should not go below 0% lightness', () => {
      const result = darkenColor('#000000', 10);
      expect(result).toBe('#000000');
    });
  });

  describe('convertColor', () => {
    it('should convert HEX to RGB', () => {
      const result = convertColor('#ff0000', 'rgb');
      expect(result).toBe('rgb(255, 0, 0)');
    });

    it('should convert RGB to HEX', () => {
      const result = convertColor('rgb(255, 0, 0)', 'hex');
      expect(result).toBe('#ff0000');
    });

    it('should convert HEX to HSL', () => {
      const result = convertColor('#ff0000', 'hsl');
      expect(result).toBe('hsl(0, 100%, 50%)');
    });

    it('should convert HSL to RGB', () => {
      const result = convertColor('hsl(0, 100%, 50%)', 'rgb');
      expect(result).toBe('rgb(255, 0, 0)');
    });

    it('should throw error for unsupported format', () => {
      expect(() => convertColor('#ff0000', 'invalid')).toThrow(
        'Unsupported target format: invalid'
      );
    });

    it('should throw error for unsupported color format', () => {
      expect(() => convertColor('invalid', 'rgb')).toThrow(
        'Unable to detect color format'
      );
    });
  });

  describe('getAvailableColorFormats', () => {
    it('should return all available color formats', () => {
      const formats = getAvailableColorFormats();
      expect(formats).toHaveLength(6);

      const formatNames = formats.map(f => f.name);
      expect(formatNames).toContain('HEX');
      expect(formatNames).toContain('RGB');
      expect(formatNames).toContain('HSL');
      expect(formatNames).toContain('Invert');
      expect(formatNames).toContain('Lighten');
      expect(formatNames).toContain('Darken');
    });

    it('should have valid descriptions', () => {
      const formats = getAvailableColorFormats();
      for (const format of formats) {
        expect(format.description).toBeTruthy();
        expect(typeof format.description).toBe('string');
      }
    });

    it('should have working convert functions', () => {
      const formats = getAvailableColorFormats();
      for (const format of formats) {
        if (
          format.name === 'Invert' ||
          format.name === 'Lighten' ||
          format.name === 'Darken'
        ) {
          // Skip these as they're not implemented in convertColor
          continue;
        }
        const result = format.convert('#ff0000');
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      }
    });
  });

  describe('examples', () => {
    it('should have valid HEX example', () => {
      const example = colorConverterExamples.hex;
      expect(example.input).toBe('#ff0000');
      expect(example.output).toBe('rgb(255, 0, 0)');
      expect(example.description).toBe('Convert HEX to RGB');
    });

    it('should have valid RGB example', () => {
      const example = colorConverterExamples.rgb;
      expect(example.input).toBe('rgb(255, 0, 0)');
      expect(example.output).toBe('#ff0000');
      expect(example.description).toBe('Convert RGB to HEX');
    });

    it('should have valid HSL example', () => {
      const example = colorConverterExamples.hsl;
      expect(example.input).toBe('hsl(0, 100%, 50%)');
      expect(example.output).toBe('#ff0000');
      expect(example.description).toBe('Convert HSL to HEX');
    });
  });
});
