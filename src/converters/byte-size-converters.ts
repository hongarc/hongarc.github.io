export interface ByteSizeConverter {
  name: string;
  convert: (input: string, targetUnit: string) => string;
  description: string;
}

// Storage units and their multipliers (case-insensitive mapping)
const UNITS = {
  // Binary units (1024 base)
  b: 1,
  B: 8,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
  PB: 1024 * 1024 * 1024 * 1024 * 1024,

  // Decimal units (1000 base)
  'KB (decimal)': 1000,
  'MB (decimal)': 1000 * 1000,
  'GB (decimal)': 1000 * 1000 * 1000,
  'TB (decimal)': 1000 * 1000 * 1000 * 1000,
  'PB (decimal)': 1000 * 1000 * 1000 * 1000 * 1000,
};

// Create case-insensitive unit mapping
const UNIT_MAPPING: Record<string, string> = {
  // Binary units
  b: 'b',
  bit: 'b',
  bits: 'b',
  B: 'B',
  byte: 'B',
  bytes: 'B',
  kb: 'KB',
  k: 'KB',
  kilobyte: 'KB',
  kilobytes: 'KB',
  mb: 'MB',
  m: 'MB',
  megabyte: 'MB',
  megabytes: 'MB',
  gb: 'GB',
  g: 'GB',
  gigabyte: 'GB',
  gigabytes: 'GB',
  tb: 'TB',
  t: 'TB',
  terabyte: 'TB',
  terabytes: 'TB',
  pb: 'PB',
  p: 'PB',
  petabyte: 'PB',
  petabytes: 'PB',
};

// Normalize unit string to standard format
export function normalizeUnit(unit: string): string {
  const trimmed = unit.trim();
  // Special-case: if unit is exactly "B" or "b", preserve as is
  if (trimmed === 'B' || trimmed === 'b') return trimmed;
  const normalized = trimmed.toLowerCase();
  const mapped = UNIT_MAPPING[normalized];
  if (mapped) return mapped;
  return trimmed;
}

// Parse input size with unit (improved)
export function parseSize(input: string): { value: number; unit: string } {
  const trimmed = input.trim();

  // Match patterns like "1.5MB", "2048 KB", "1024", etc.
  const match = trimmed.match(/^([\d.]+)\s*([A-Za-z]+)$/);

  if (match) {
    const value = Number.parseFloat(match[1]);
    const unit = normalizeUnit(match[2]);

    if (Number.isNaN(value)) {
      throw new TypeError('Invalid numeric value');
    }

    return { value, unit };
  }

  // If no unit specified, assume bytes
  const value = Number.parseFloat(trimmed);
  if (!Number.isNaN(value)) {
    return { value, unit: 'B' };
  }

  throw new Error('Invalid size format');
}

// Convert size to bytes (improved)
export function toBytes(
  size: string,
  base: 'binary' | 'decimal' = 'binary'
): number {
  const { value, unit } = parseSize(size);

  if (base === 'decimal' && unit !== 'b' && unit !== 'B') {
    // Use decimal multipliers for larger units
    const decimalUnits = {
      KB: 1000,
      MB: 1000 * 1000,
      GB: 1000 * 1000 * 1000,
      TB: 1000 * 1000 * 1000 * 1000,
      PB: 1000 * 1000 * 1000 * 1000 * 1000,
    };

    if (decimalUnits[unit]) {
      return value * decimalUnits[unit];
    }
  }

  // Use binary multipliers
  if (UNITS[unit]) {
    return value * UNITS[unit];
  }

  throw new Error(`Unknown unit: ${unit}`);
}

// Convert bytes to target unit (improved)
export function fromBytes(
  bytes: number,
  targetUnit: string,
  base: 'binary' | 'decimal' = 'binary'
): string {
  const normalizedUnit = normalizeUnit(targetUnit);
  let multiplier: number;

  if (base === 'decimal' && normalizedUnit !== 'b' && normalizedUnit !== 'B') {
    // Use decimal multipliers for larger units
    const decimalUnits = {
      KB: 1000,
      MB: 1000 * 1000,
      GB: 1000 * 1000 * 1000,
      TB: 1000 * 1000 * 1000 * 1000,
      PB: 1000 * 1000 * 1000 * 1000 * 1000,
    };

    multiplier = decimalUnits[normalizedUnit] || UNITS[normalizedUnit];
  } else {
    multiplier = UNITS[normalizedUnit];
  }

  if (!multiplier) {
    throw new Error(`Unknown target unit: ${targetUnit}`);
  }

  const result = bytes / multiplier;

  // Format with appropriate precision
  if (result >= 1000) {
    return result.toFixed(0);
  } else if (result >= 100) {
    return result.toFixed(1);
  } else if (result >= 10) {
    return result.toFixed(2);
  } else {
    return result.toFixed(3);
  }
}

// Main byte size converter function (improved)
export function convertByteSize(
  input: string,
  targetUnit: string,
  base: 'binary' | 'decimal' = 'binary'
): string {
  const bytes = toBytes(input, base);
  const result = fromBytes(bytes, targetUnit, base);
  return `${result} ${normalizeUnit(targetUnit)}`;
}

// Get all available units (improved)
export function getAvailableUnits(): string[] {
  return Object.keys(UNITS);
}

// Get human readable size (improved)
export function toHumanReadable(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Parse friendly input like "1.5MB" (improved)
export function parseFriendlySize(input: string): number {
  return toBytes(input);
}

// Get all available byte size formats (improved)
export function getAvailableByteSizeFormats(): ByteSizeConverter[] {
  return [
    {
      name: 'Bits',
      convert: (input, _targetUnit) => convertByteSize(input, 'b'),
      description: 'Convert to bits',
    },
    {
      name: 'Bytes',
      convert: (input, _targetUnit) => convertByteSize(input, 'B'),
      description: 'Convert to bytes',
    },
    {
      name: 'KB (Binary)',
      convert: (input, _targetUnit) => convertByteSize(input, 'KB', 'binary'),
      description: 'Convert to kilobytes (1024 base)',
    },
    {
      name: 'MB (Binary)',
      convert: (input, _targetUnit) => convertByteSize(input, 'MB', 'binary'),
      description: 'Convert to megabytes (1024 base)',
    },
    {
      name: 'GB (Binary)',
      convert: (input, _targetUnit) => convertByteSize(input, 'GB', 'binary'),
      description: 'Convert to gigabytes (1024 base)',
    },
    {
      name: 'TB (Binary)',
      convert: (input, _targetUnit) => convertByteSize(input, 'TB', 'binary'),
      description: 'Convert to terabytes (1024 base)',
    },
    {
      name: 'KB (Decimal)',
      convert: (input, _targetUnit) => convertByteSize(input, 'KB', 'decimal'),
      description: 'Convert to kilobytes (1000 base)',
    },
    {
      name: 'MB (Decimal)',
      convert: (input, _targetUnit) => convertByteSize(input, 'MB', 'decimal'),
      description: 'Convert to megabytes (1000 base)',
    },
    {
      name: 'GB (Decimal)',
      convert: (input, _targetUnit) => convertByteSize(input, 'GB', 'decimal'),
      description: 'Convert to gigabytes (1000 base)',
    },
    {
      name: 'TB (Decimal)',
      convert: (input, _targetUnit) => convertByteSize(input, 'TB', 'decimal'),
      description: 'Convert to terabytes (1000 base)',
    },
    {
      name: 'Human Readable',
      convert: (input, _targetUnit) => toHumanReadable(toBytes(input)),
      description: 'Convert to human readable format',
    },
  ];
}

// Examples (improved)
export const byteSizeConverterExamples = {
  bytesToKB: {
    input: '2048 B',
    output: '2 KB',
    description: 'Convert 2048 bytes to KB (binary)',
  },
  mbToBytes: {
    input: '1.5 MB',
    output: '1572864 B',
    description: 'Convert 1.5 MB to bytes',
  },
  gbToMb: {
    input: '2 GB',
    output: '2048 MB',
    description: 'Convert 2 GB to MB (binary)',
  },
  humanReadable: {
    input: '1572864 B',
    output: '1.50 MB',
    description: 'Convert to human readable format',
  },
  decimalConversion: {
    input: '1000 KB',
    output: '1 MB',
    description: 'Convert using decimal base (1000)',
  },
  caseInsensitive: {
    input: '1.5 mb',
    output: '1.5 MB',
    description: 'Handle case-insensitive units',
  },
};

// Reusable conversion functions
export function bytesToKb(bytes: number): number {
  return bytes / 1024;
}

export function bytesToMb(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function bytesToGb(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

export function bytesToTb(bytes: number): number {
  return bytes / (1024 * 1024 * 1024 * 1024);
}

export function bytesToPb(bytes: number): number {
  return bytes / (1024 * 1024 * 1024 * 1024 * 1024);
}

export function kbToBytes(kb: number): number {
  return kb * 1024;
}

export function mbToBytes(mb: number): number {
  return mb * (1024 * 1024);
}

export function gbToBytes(gb: number): number {
  return gb * (1024 * 1024 * 1024);
}

export function tbToBytes(tb: number): number {
  return tb * (1024 * 1024 * 1024 * 1024);
}

export function pbToBytes(pb: number): number {
  return pb * (1024 * 1024 * 1024 * 1024 * 1024);
}
