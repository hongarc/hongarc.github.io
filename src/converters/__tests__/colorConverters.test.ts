import {
  detectColorFormat,
  convertFromHex,
  convertFromRgb,
  convertFromHsl,
  invertColor,
  lightenColor,
  darkenColor,
  convertColor,
  getAvailableColorFormats,
  colorConverterExamples
} from '../colorConverters';

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

    it('should detect named colors', () => {
      expect(detectColorFormat('red')).toBe('named');
      expect(detectColorFormat('blue')).toBe('named');
      expect(detectColorFormat('green')).toBe('named');
    });

    it('should return unknown for unrecognized format', () => {
      expect(detectColorFormat('invalid')).toBe('unknown');
    });
  });

  describe('convertFromHex', () => {
    it('should convert HEX to all formats', () => {
      const result = convertFromHex('#ff0000');
      expect(result.hex).toBe('#ff0000');
      expect(result.rgb).toBe('rgb(255, 0, 0)');
      expect(result.rgba).toBe('rgba(255, 0, 0, 1)');
      expect(result.hsl).toBe('hsl(0, 100%, 50%)');
      expect(result.hsla).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should handle different HEX colors', () => {
      const result = convertFromHex('#00ff00');
      expect(result.rgb).toBe('rgb(0, 255, 0)');
      expect(result.hsl).toBe('hsl(120, 100%, 50%)');
    });
  });

  describe('convertFromRgb', () => {
    it('should convert RGB to all formats', () => {
      const result = convertFromRgb('rgb(255, 0, 0)');
      expect(result.hex).toBe('#ff0000');
      expect(result.rgb).toBe('rgb(255, 0, 0)');
      expect(result.rgba).toBe('rgba(255, 0, 0, 1)');
      expect(result.hsl).toBe('hsl(0, 100%, 50%)');
      expect(result.hsla).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should handle RGBA format', () => {
      const result = convertFromRgb('rgba(255, 0, 0, 0.5)');
      expect(result.hex).toBe('#ff0000');
      expect(result.rgb).toBe('rgb(255, 0, 0)');
    });

    it('should throw error for invalid RGB format', () => {
      expect(() => convertFromRgb('invalid')).toThrow('Invalid RGB format');
    });
  });

  describe('convertFromHsl', () => {
    it('should convert HSL to all formats', () => {
      const result = convertFromHsl('hsl(0, 100%, 50%)');
      expect(result.hex).toBe('#ff0000');
      expect(result.rgb).toBe('rgb(255, 0, 0)');
      expect(result.rgba).toBe('rgba(255, 0, 0, 1)');
      expect(result.hsl).toBe('hsl(0, 100%, 50%)');
      expect(result.hsla).toBe('hsla(0, 100%, 50%, 1)');
    });

    it('should handle HSLA format', () => {
      const result = convertFromHsl('hsla(0, 100%, 50%, 0.5)');
      expect(result.hex).toBe('#ff0000');
      expect(result.hsl).toBe('hsl(0, 100%, 50%)');
    });

    it('should throw error for invalid HSL format', () => {
      expect(() => convertFromHsl('invalid')).toThrow('Invalid HSL format');
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

    it('should invert color', () => {
      const result = convertColor('#ff0000', 'invert');
      expect(result).toBe('#00ffff');
    });

    it('should lighten color', () => {
      const result = convertColor('#ff0000', 'lighten');
      expect(result).toBe('#ff3333');
    });

    it('should darken color', () => {
      const result = convertColor('#ff0000', 'darken');
      expect(result).toBe('#cc0000');
    });

    it('should throw error for unsupported format', () => {
      expect(() => convertColor('#ff0000', 'invalid')).toThrow('Unsupported target format: invalid');
    });

    it('should throw error for unsupported color format', () => {
      expect(() => convertColor('invalid', 'rgb')).toThrow('Unsupported color format: unknown');
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
      formats.forEach(format => {
        expect(format.description).toBeTruthy();
        expect(typeof format.description).toBe('string');
      });
    });

    it('should have working convert functions', () => {
      const formats = getAvailableColorFormats();
      formats.forEach(format => {
        const result = format.convert('#ff0000');
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('examples', () => {
    it('should have valid HEX to RGB example', () => {
      const example = colorConverterExamples.hexToRgb;
      expect(example.input).toBe('#ff0000');
      expect(example.output).toBe('rgb(255, 0, 0)');
      expect(example.description).toBe('Convert HEX to RGB');
    });

    it('should have valid RGB to HEX example', () => {
      const example = colorConverterExamples.rgbToHex;
      expect(example.input).toBe('rgb(255, 0, 0)');
      expect(example.output).toBe('#ff0000');
      expect(example.description).toBe('Convert RGB to HEX');
    });

    it('should have valid HEX to HSL example', () => {
      const example = colorConverterExamples.hexToHsl;
      expect(example.input).toBe('#ff0000');
      expect(example.output).toBe('hsl(0, 100%, 50%)');
      expect(example.description).toBe('Convert HEX to HSL');
    });

    it('should have valid invert color example', () => {
      const example = colorConverterExamples.invertColor;
      expect(example.input).toBe('#ff0000');
      expect(example.output).toBe('#00ffff');
      expect(example.description).toBe('Invert red color to cyan');
    });

    it('should have valid lighten color example', () => {
      const example = colorConverterExamples.lightenColor;
      expect(example.input).toBe('#ff0000');
      expect(example.output).toBe('#ff3333');
      expect(example.description).toBe('Lighten red color');
    });
  });
});