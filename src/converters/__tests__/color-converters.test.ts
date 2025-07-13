import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToCmyk,
  convertColor,
  detectColorFormat,
  invertColor,
  lightenColor,
  darkenColor,
  getAvailableColorFormats,
} from '../color-converters';

describe('Color Converters', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle hex without #', () => {
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should handle shorthand hex', () => {
      expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#00f')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle decimal values', () => {
      expect(hexToRgb('#804020')).toEqual({ r: 128, g: 64, b: 32 });
    });

    it('should throw error for invalid hex', () => {
      expect(() => hexToRgb('#invalid')).toThrow();
      expect(() => hexToRgb('#12345')).toThrow();
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });

    it('should handle decimal values', () => {
      expect(rgbToHex(128.5, 64.7, 32.3)).toBe('#814120');
    });

    it('should handle edge cases', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });
  });

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL', () => {
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
      expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
      expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
    });

    it('should handle grayscale', () => {
      expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
    });
  });

  describe('hslToRgb', () => {
    it('should convert HSL to RGB', () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle edge cases', () => {
      expect(hslToRgb(360, 100, 50)).toEqual({ r: 0, g: 0, b: 0 });
      expect(hslToRgb(180, 50, 25)).toEqual({ r: 32, g: 96, b: 96 });
    });
  });

  describe('rgbToHsv', () => {
    it('should convert RGB to HSV', () => {
      expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 });
      expect(rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 });
      expect(rgbToHsv(0, 0, 255)).toEqual({ h: 240, s: 100, v: 100 });
    });
  });

  describe('hsvToRgb', () => {
    it('should convert HSV to RGB', () => {
      expect(hsvToRgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hsvToRgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 });
      expect(hsvToRgb(240, 100, 100)).toEqual({ r: 0, g: 0, b: 255 });
    });
  });

  describe('rgbToCmyk', () => {
    it('should convert RGB to CMYK', () => {
      expect(rgbToCmyk(255, 0, 0)).toEqual({ c: 0, m: 100, y: 100, k: 0 });
      expect(rgbToCmyk(0, 255, 0)).toEqual({ c: 100, m: 0, y: 100, k: 0 });
      expect(rgbToCmyk(0, 0, 255)).toEqual({ c: 100, m: 100, y: 0, k: 0 });
      expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });
      expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });
    });
  });

  describe('convertColor', () => {
    it('should convert hex to RGB', () => {
      expect(convertColor('#ff0000', 'rgb')).toBe('rgb(255, 0, 0)');
      expect(convertColor('#00ff00', 'rgb')).toBe('rgb(0, 255, 0)');
    });

    it('should convert RGB to hex', () => {
      expect(convertColor('rgb(255, 0, 0)', 'hex')).toBe('#ff0000');
      expect(convertColor('rgb(0, 255, 0)', 'hex')).toBe('#00ff00');
    });

    it('should convert hex to HSL', () => {
      expect(convertColor('#ff0000', 'hsl')).toBe('hsl(0, 100%, 50%)');
      expect(convertColor('#00ff00', 'hsl')).toBe('hsl(120, 100%, 50%)');
    });

    it('should convert HSL to hex', () => {
      expect(convertColor('hsl(0, 100%, 50%)', 'hex')).toBe('#ff0000');
      expect(convertColor('hsl(120, 100%, 50%)', 'hex')).toBe('#00ff00');
    });

    it('should convert hex to HSV', () => {
      expect(convertColor('#ff0000', 'hsv')).toBe('hsv(0, 100%, 100%)');
      expect(convertColor('#00ff00', 'hsv')).toBe('hsv(120, 100%, 100%)');
    });

    it('should convert hex to CMYK', () => {
      expect(convertColor('#ff0000', 'cmyk')).toBe('cmyk(0%, 100%, 100%, 0%)');
      expect(convertColor('#00ff00', 'cmyk')).toBe('cmyk(100%, 0%, 100%, 0%)');
    });

    it('should throw error for unsupported format', () => {
      expect(() => convertColor('#ff0000', 'invalid')).toThrow();
    });
  });

  describe('detectColorFormat', () => {
    it('should detect hex format', () => {
      expect(detectColorFormat('#ff0000')).toBe('hex');
      expect(detectColorFormat('ff0000')).toBe('hex');
      expect(detectColorFormat('#f00')).toBe('hex');
    });

    it('should detect RGB format', () => {
      expect(detectColorFormat('rgb(255, 0, 0)')).toBe('rgb');
      expect(detectColorFormat('rgba(255, 0, 0, 1)')).toBe('rgb');
    });

    it('should detect HSL format', () => {
      expect(detectColorFormat('hsl(0, 100%, 50%)')).toBe('hsl');
      expect(detectColorFormat('hsla(0, 100%, 50%, 1)')).toBe('hsl');
    });

    it('should detect HSV format', () => {
      expect(detectColorFormat('hsv(0, 100%, 100%)')).toBe('hsv');
    });

    it('should return undefined for unknown format', () => {
      expect(detectColorFormat('invalid')).toBeUndefined();
    });
  });

  describe('invertColor', () => {
    it('should invert colors', () => {
      expect(invertColor('#ff0000')).toBe('#00ffff');
      expect(invertColor('#00ff00')).toBe('#ff00ff');
      expect(invertColor('#0000ff')).toBe('#ffff00');
    });

    it('should handle black and white', () => {
      expect(invertColor('#000000')).toBe('#ffffff');
      expect(invertColor('#ffffff')).toBe('#000000');
    });
  });

  describe('lightenColor', () => {
    it('should lighten colors', () => {
      expect(lightenColor('#000000')).toBe('#1a1a1a');
      expect(lightenColor('#ff0000')).toBe('#ff3333');
      expect(lightenColor('#00ff00')).toBe('#33ff33');
    });

    it('should handle custom amount', () => {
      expect(lightenColor('#000000', 20)).toBe('#333333');
      expect(lightenColor('#ff0000', 50)).toBe('#ffffff');
    });

    it('should not exceed 100% lightness', () => {
      expect(lightenColor('#ffffff')).toBe('#ffffff');
    });
  });

  describe('darkenColor', () => {
    it('should darken colors', () => {
      expect(darkenColor('#ffffff')).toBe('#e6e6e6');
      expect(darkenColor('#ff0000')).toBe('#cc0000');
      expect(darkenColor('#00ff00')).toBe('#00cc00');
    });

    it('should handle custom amount', () => {
      expect(darkenColor('#ffffff', 20)).toBe('#cccccc');
      expect(darkenColor('#ff0000', 50)).toBe('#000000');
    });

    it('should not go below 0% lightness', () => {
      expect(darkenColor('#000000')).toBe('#000000');
    });
  });

  describe('getAvailableColorFormats', () => {
    it('should return available formats', () => {
      const formats = getAvailableColorFormats();
      expect(formats.length).toBeGreaterThan(0);
      expect(formats[0].name).toBe('HEX');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle edge case CMYK values', () => {
      expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });
      expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });
    });

    it('should handle out of range values', () => {
      expect(rgbToHex(300, -50, 500)).toBe('#12c-321f4');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('should handle malformed input', () => {
      expect(() => convertColor('invalid', 'hex')).toThrow();
      expect(() => convertColor('rgb(invalid)', 'hex')).toThrow();
    });

    it('should handle empty input', () => {
      expect(detectColorFormat('')).toBeUndefined();
      expect(() => convertColor('', 'hex')).toThrow();
    });

    it('should handle special characters', () => {
      expect(() => convertColor('#ff0000', 'hex')).not.toThrow();
      expect(() => convertColor('rgb(255, 0, 0)', 'hex')).not.toThrow();
    });
  });
});
