export interface ColorConverter {
  name: string;
  convert: (input: string) => string;
  description: string;
}

// Color format detection
export function detectColorFormat(input: string): string {
  const color = input.trim().toLowerCase();

  if (color.startsWith('#')) return 'hex';
  if (color.startsWith('rgb(') || color.startsWith('rgba(')) return 'rgb';
  if (color.startsWith('hsl(') || color.startsWith('hsla(')) return 'hsl';

  // Check for named colors
  const namedColors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'black', 'white', 'gray', 'grey'];
  if (namedColors.includes(color)) return 'named';

  return 'unknown';
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  return [r, g, b];
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper function to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Helper function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert HEX to other formats
export function convertFromHex(hex: string): Record<string, any> {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  return {
    hex: hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, 1)`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    hsla: `hsla(${h}, ${s}%, ${l}%, 1)`
  };
}

// Convert RGB to other formats
export function convertFromRgb(rgbString: string): Record<string, any> {
  const match = rgbString.match(/rgba?\(([^)]+)\)/);
  if (!match) throw new Error('Invalid RGB format');

  const values = match[1].split(',').map(v => parseInt(v.trim()));
  const [r, g, b] = values;

  const hex = rgbToHex(r, g, b);
  const [h, s, l] = rgbToHsl(r, g, b);

  return {
    hex: hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, 1)`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    hsla: `hsla(${h}, ${s}%, ${l}%, 1)`
  };
}

// Convert HSL to other formats
export function convertFromHsl(hslString: string): Record<string, any> {
  const match = hslString.match(/hsla?\(([^)]+)\)/);
  if (!match) throw new Error('Invalid HSL format');

  const values = match[1].split(',').map(v => parseFloat(v.trim()));
  const [h, s, l] = values;

  const [r, g, b] = hslToRgb(h, s, l);
  const hex = rgbToHex(r, g, b);

  return {
    hex: hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, 1)`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    hsla: `hsla(${h}, ${s}%, ${l}%, 1)`
  };
}

// Color transformations
export function invertColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const inverted = [255 - r, 255 - g, 255 - b];
  return rgbToHex(inverted[0], inverted[1], inverted[2]);
}

export function lightenColor(hex: string, amount: number = 10): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  // Lighten by increasing lightness
  const newL = Math.min(100, l + amount);
  const [newR, newG, newB] = hslToRgb(h, s, newL);

  return rgbToHex(newR, newG, newB);
}

export function darkenColor(hex: string, amount: number = 10): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  // Darken by decreasing lightness
  const newL = Math.max(0, l - amount);
  const [newR, newG, newB] = hslToRgb(h, s, newL);

  return rgbToHex(newR, newG, newB);
}

// Main color converter function
export function convertColor(input: string, targetFormat: string): string {
  const format = detectColorFormat(input);

  let conversions: Record<string, any>;

  switch (format) {
    case 'hex':
      conversions = convertFromHex(input);
      break;
    case 'rgb':
      conversions = convertFromRgb(input);
      break;
    case 'hsl':
      conversions = convertFromHsl(input);
      break;
    default:
      throw new Error(`Unsupported color format: ${format}`);
  }

  const target = targetFormat.toLowerCase();

  switch (target) {
    case 'hex':
      return conversions.hex;
    case 'rgb':
      return conversions.rgb;
    case 'rgba':
      return conversions.rgba;
    case 'hsl':
      return conversions.hsl;
    case 'hsla':
      return conversions.hsla;
    case 'invert':
      return invertColor(conversions.hex);
    case 'lighten':
      return lightenColor(conversions.hex, 10);
    case 'darken':
      return darkenColor(conversions.hex, 10);
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Get all available color formats
export function getAvailableColorFormats(): ColorConverter[] {
  return [
    {
      name: 'HEX',
      convert: (input) => convertColor(input, 'hex'),
      description: 'Convert to hexadecimal color'
    },
    {
      name: 'RGB',
      convert: (input) => convertColor(input, 'rgb'),
      description: 'Convert to RGB color'
    },
    {
      name: 'HSL',
      convert: (input) => convertColor(input, 'hsl'),
      description: 'Convert to HSL color'
    },
    {
      name: 'Invert',
      convert: (input) => convertColor(input, 'invert'),
      description: 'Invert the color'
    },
    {
      name: 'Lighten',
      convert: (input) => convertColor(input, 'lighten'),
      description: 'Lighten the color by 10%'
    },
    {
      name: 'Darken',
      convert: (input) => convertColor(input, 'darken'),
      description: 'Darken the color by 10%'
    }
  ];
}

// Examples
export const colorConverterExamples = {
  hexToRgb: {
    input: '#ff0000',
    output: 'rgb(255, 0, 0)',
    description: 'Convert HEX to RGB'
  },
  rgbToHex: {
    input: 'rgb(255, 0, 0)',
    output: '#ff0000',
    description: 'Convert RGB to HEX'
  },
  hexToHsl: {
    input: '#ff0000',
    output: 'hsl(0, 100%, 50%)',
    description: 'Convert HEX to HSL'
  },
  invertColor: {
    input: '#ff0000',
    output: '#00ffff',
    description: 'Invert red color to cyan'
  },
  lightenColor: {
    input: '#ff0000',
    output: '#ff3333',
    description: 'Lighten red color'
  }
};