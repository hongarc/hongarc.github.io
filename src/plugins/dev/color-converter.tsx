import { Palette } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getTrimmedInput, success } from '@/utils';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Pure function: parse hex color
const parseHex = (hex: string): RGB | null => {
  const clean = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (clean.length === 3) {
    const c0 = clean[0] ?? '0';
    const c1 = clean[1] ?? '0';
    const c2 = clean[2] ?? '0';
    r = Number.parseInt(c0 + c0, 16);
    g = Number.parseInt(c1 + c1, 16);
    b = Number.parseInt(c2 + c2, 16);
  } else if (clean.length === 6) {
    r = Number.parseInt(clean.slice(0, 2), 16);
    g = Number.parseInt(clean.slice(2, 4), 16);
    b = Number.parseInt(clean.slice(4, 6), 16);
  } else {
    return null;
  }

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
};

// Pure function: parse rgb() format
const parseRgb = (str: string): RGB | null => {
  const match = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(str);
  if (!match) return null;

  const r = Number.parseInt(match[1] ?? '0', 10);
  const g = Number.parseInt(match[2] ?? '0', 10);
  const b = Number.parseInt(match[3] ?? '0', 10);

  if (r > 255 || g > 255 || b > 255) return null;
  return { r, g, b };
};

// Pure function: parse hsl() format
const parseHsl = (str: string): HSL | null => {
  const match = /hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i.exec(str);
  if (!match) return null;

  const h = Number.parseInt(match[1] ?? '0', 10) % 360;
  const s = Number.parseInt(match[2] ?? '0', 10);
  const l = Number.parseInt(match[3] ?? '0', 10);

  if (s > 100 || l > 100) return null;
  return { h, s, l };
};

// Pure function: number to hex string
const toHex = (n: number): string => n.toString(16).padStart(2, '0');

// Pure function: RGB to Hex
const rgbToHex = ({ r, g, b }: RGB): string => {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// Pure function: RGB to HSL
const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === rNorm) {
    h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
  } else if (max === gNorm) {
    h = ((bNorm - rNorm) / d + 2) / 6;
  } else {
    h = ((rNorm - gNorm) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// Pure function: hue to RGB component
const hue2rgb = (p: number, q: number, t: number): number => {
  let tNorm = t;
  if (tNorm < 0) tNorm += 1;
  if (tNorm > 1) tNorm -= 1;
  if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
  if (tNorm < 1 / 2) return q;
  if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
  return p;
};

// Pure function: HSL to RGB
const hslToRgb = ({ h, s, l }: HSL): RGB => {
  const sNorm = s / 100;
  const lNorm = l / 100;

  if (sNorm === 0) {
    const v = Math.round(lNorm * 255);
    return { r: v, g: v, b: v };
  }

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const hNorm = h / 360;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
};

// Pure function: detect and parse color
const parseColor = (input: string): RGB | null => {
  const trimmed = input.trim();

  // Try hex
  if (trimmed.startsWith('#') || /^[\da-f]{3,6}$/i.test(trimmed)) {
    return parseHex(trimmed);
  }

  // Try rgb()
  if (trimmed.toLowerCase().startsWith('rgb')) {
    return parseRgb(trimmed);
  }

  // Try hsl()
  if (trimmed.toLowerCase().startsWith('hsl')) {
    const hsl = parseHsl(trimmed);
    if (hsl) return hslToRgb(hsl);
  }

  // Try plain numbers (r,g,b or r g b)
  const nums = trimmed.split(/[\s,]+/).map((n) => Number.parseInt(n, 10));
  if (nums.length === 3 && nums.every((n) => !Number.isNaN(n) && n >= 0 && n <= 255)) {
    return { r: nums[0] ?? 0, g: nums[1] ?? 0, b: nums[2] ?? 0 };
  }

  return null;
};

// Pure function: format CSS output
const formatCssOutput = (rgb: RGB, hsl: HSL, hex: string): string => {
  return [
    `--color: ${hex};`,
    `--color: rgb(${String(rgb.r)} ${String(rgb.g)} ${String(rgb.b)});`,
    `--color: hsl(${String(hsl.h)} ${String(hsl.s)}% ${String(hsl.l)}%);`,
  ].join('\n');
};

export const colorConverter: ToolPlugin = {
  id: 'color-converter',
  label: 'Color Converter',
  description: 'Convert colors between HEX, RGB, and HSL formats',
  category: 'dev',
  icon: <Palette className="h-4 w-4" />,
  keywords: ['color', 'hex', 'rgb', 'hsl', 'convert', 'css', 'palette'],
  inputs: [
    {
      id: 'input',
      label: 'Color Value',
      type: 'text',
      placeholder: '#3B82F6, rgb(59, 130, 246), or hsl(217, 91%, 60%)',
      required: true,
      helpText: 'Enter HEX, RGB, or HSL color',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');

    if (!input) {
      return failure('Please enter a color value');
    }

    const rgb = parseColor(input);
    if (!rgb) {
      return failure('Invalid color format. Try: #3B82F6, rgb(59,130,246), or hsl(217,91%,60%)');
    }

    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    const cssOutput = formatCssOutput(rgb, hsl, hex);

    return success(cssOutput, {
      _viewMode: 'sections',
      _sections: {
        stats: [
          { label: 'HEX', value: hex },
          { label: 'RGB', value: `rgb(${String(rgb.r)}, ${String(rgb.g)}, ${String(rgb.b)})` },
          { label: 'HSL', value: `hsl(${String(hsl.h)}, ${String(hsl.s)}%, ${String(hsl.l)}%)` },
        ],
        content: cssOutput,
        contentLabel: 'CSS Variables',
      },
    });
  },
};
