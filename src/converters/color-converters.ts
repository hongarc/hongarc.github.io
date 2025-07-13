export interface ColorConverter {
  name: string;
  convert: (input: string) => string;
  description: string;
}

// Color conversion utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle shorthand hex (#fff -> #ffffff)
  if (hex.length === 3) {
    hex = [...hex].map(char => char + char).join('');
  }

  if (hex.length !== 6) {
    throw new Error('Invalid hex color format');
  }

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    throw new TypeError('Invalid hex color values');
  }

  return { r, g, b };
}

const toHex = (n: number) => {
  const hex = Math.round(n).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: {
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      }
      case g: {
        h = (b - r) / d + 2;
        break;
      }
      case b: {
        h = (r - g) / d + 4;
        break;
      }
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: {
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      }
      case g: {
        h = (b - r) / d + 2;
        break;
      }
      case b: {
        h = (r - g) / d + 4;
        break;
      }
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function hsvToRgb(
  h: number,
  s: number,
  v: number
): { r: number; g: number; b: number } {
  s /= 100;
  v /= 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToCmyk(
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Main color converter function
export function convertColor(input: string, targetFormat: string): string {
  // Detect input format
  const inputFormat = detectColorFormat(input);
  if (!inputFormat) {
    throw new Error('Unable to detect color format');
  }

  // Parse input to RGB
  let rgb: { r: number; g: number; b: number };

  switch (inputFormat) {
    case 'hex': {
      rgb = hexToRgb(input);
      break;
    }
    case 'rgb': {
      rgb = parseRgb(input);
      break;
    }
    case 'hsl': {
      const hsl = parseHsl(input);
      rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      break;
    }
    case 'hsv': {
      const hsv = parseHsv(input);
      rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      break;
    }
    default: {
      throw new Error(`Unsupported input format: ${inputFormat}`);
    }
  }

  // Convert to target format
  switch (targetFormat.toLowerCase()) {
    case 'hex': {
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    case 'rgb': {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    case 'rgba': {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    }
    case 'hsl': {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case 'hsla': {
      const hsl2 = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return `hsla(${hsl2.h}, ${hsl2.s}%, ${hsl2.l}%, 1)`;
    }
    case 'hsv': {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    }
    case 'cmyk': {
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    }
    default: {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }
}

// Helper functions for parsing
export function detectColorFormat(input: string): string | undefined {
  const trimmed = input.trim();

  if (trimmed.startsWith('#')) {
    return 'hex';
  }

  if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
    return 'rgb';
  }

  if (trimmed.startsWith('hsl(') || trimmed.startsWith('hsla(')) {
    return 'hsl';
  }

  if (trimmed.startsWith('hsv(')) {
    return 'hsv';
  }

  return undefined;
}

function parseRgb(input: string): { r: number; g: number; b: number } {
  const match = input.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    throw new Error('Invalid RGB format');
  }

  const values = match[1].split(',').map(v => Number.parseInt(v.trim()));
  if (values.length < 3 || values.some(value => Number.isNaN(value))) {
    throw new Error('Invalid RGB values');
  }

  return { r: values[0], g: values[1], b: values[2] };
}

function parseHsl(input: string): { h: number; s: number; l: number } {
  const match = input.match(/hsla?\(([^)]+)\)/);
  if (!match) {
    throw new Error('Invalid HSL format');
  }

  const values = match[1].split(',').map(v => Number.parseFloat(v.trim()));
  if (values.length < 3 || values.some(value => Number.isNaN(value))) {
    throw new Error('Invalid HSL values');
  }

  return { h: values[0], s: values[1], l: values[2] };
}

function parseHsv(input: string): { h: number; s: number; v: number } {
  const match = input.match(/hsv\(([^)]+)\)/);
  if (!match) {
    throw new Error('Invalid HSV format');
  }

  const values = match[1].split(',').map(v => Number.parseFloat(v.trim()));
  if (values.length < 3 || values.some(value => Number.isNaN(value))) {
    throw new Error('Invalid HSV values');
  }

  return { h: values[0], s: values[1], v: values[2] };
}

// Color transformations
export function invertColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const inverted = [255 - rgb.r, 255 - rgb.g, 255 - rgb.b];
  return rgbToHex(inverted[0], inverted[1], inverted[2]);
}

export function lightenColor(hex: string, amount: number = 10): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Lighten by increasing lightness
  const newL = Math.min(100, hsl.l + amount);
  const newRgb = hslToRgb(hsl.h, hsl.s, newL);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

export function darkenColor(hex: string, amount: number = 10): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Darken by decreasing lightness
  const newL = Math.max(0, hsl.l - amount);
  const newRgb = hslToRgb(hsl.h, hsl.s, newL);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Get all available color formats
export function getAvailableColorFormats(): ColorConverter[] {
  return [
    {
      name: 'HEX',
      convert: input => convertColor(input, 'hex'),
      description: 'Convert to hexadecimal color',
    },
    {
      name: 'RGB',
      convert: input => convertColor(input, 'rgb'),
      description: 'Convert to RGB color',
    },
    {
      name: 'HSL',
      convert: input => convertColor(input, 'hsl'),
      description: 'Convert to HSL color',
    },
    {
      name: 'Invert',
      convert: input => convertColor(input, 'invert'),
      description: 'Invert the color',
    },
    {
      name: 'Lighten',
      convert: input => convertColor(input, 'lighten'),
      description: 'Lighten the color by 10%',
    },
    {
      name: 'Darken',
      convert: input => convertColor(input, 'darken'),
      description: 'Darken the color by 10%',
    },
  ];
}

// Examples
export const colorConverterExamples = {
  hex: {
    input: '#ff0000',
    output: 'rgb(255, 0, 0)',
    description: 'Convert HEX to RGB',
  },
  rgb: {
    input: 'rgb(255, 0, 0)',
    output: '#ff0000',
    description: 'Convert RGB to HEX',
  },
  hsl: {
    input: 'hsl(0, 100%, 50%)',
    output: '#ff0000',
    description: 'Convert HSL to HEX',
  },
};
