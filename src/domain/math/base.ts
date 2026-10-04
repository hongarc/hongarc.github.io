export type NumberBase = 'binary' | 'octal' | 'decimal' | 'hex';

export interface BaseConversions {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
}

const DIGIT_PATTERNS: Record<NumberBase, RegExp> = {
  binary: /^[01]+$/,
  octal: /^[0-7]+$/,
  decimal: /^\d+$/,
  hex: /^[\da-f]+$/i,
};

const PREFIXES: Record<NumberBase, string> = {
  binary: '0b',
  octal: '0o',
  decimal: '',
  hex: '0x',
};

const formatBinary = (digits: string): string => {
  const padded = digits.padStart(Math.ceil(digits.length / 4) * 4, '0');
  return padded.match(/.{1,4}/g)?.join(' ') ?? digits;
};

const formatHex = (digits: string): string => {
  const padded = digits.padStart(Math.ceil(digits.length / 2) * 2, '0');
  return padded.match(/.{1,2}/g)?.join(' ') ?? digits;
};

export const convertBase = (
  text: string,
  from: NumberBase
): BaseConversions | { error: string } => {
  const compact = text.replaceAll(/[\s_]/g, '');

  if (compact.startsWith('-')) {
    return { error: 'Negative numbers are not supported' };
  }

  const prefix = PREFIXES[from];
  const hasPrefix = prefix !== '' && compact.toLowerCase().startsWith(prefix);
  const digits = hasPrefix ? compact.slice(prefix.length) : compact;

  if (digits === '') {
    return { error: 'Invalid number' };
  }

  if (!DIGIT_PATTERNS[from].test(digits)) {
    return { error: `Invalid ${from} number` };
  }

  const value = BigInt(`${prefix}${digits}`);

  return {
    binary: `0b${formatBinary(value.toString(2))}`,
    octal: `0o${value.toString(8)}`,
    decimal: value.toString(10),
    hex: `0x${formatHex(value.toString(16).toUpperCase())}`,
  };
};
