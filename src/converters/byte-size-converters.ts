export interface ByteSizeConverter {
  name: string;
  convert: (input: string, targetUnit: string) => string;
  description: string;
}

// Storage units and their multipliers
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
  'PB (decimal)': 1000 * 1000 * 1000 * 1000 * 1000
};

// Parse input size with unit
export function parseSize(input: string): { value: number; unit: string } {
  const trimmed = input.trim();

  // Match patterns like "1.5MB", "2048 KB", "1024", etc.
  const match = trimmed.match(/^([\d.]+)\s*([A-Za-z]+)$/);

  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    // Handle special cases
    if (unit === 'K' || unit === 'KB') return { value, unit: 'KB' };
    if (unit === 'M' || unit === 'MB') return { value, unit: 'MB' };
    if (unit === 'G' || unit === 'GB') return { value, unit: 'GB' };
    if (unit === 'T' || unit === 'TB') return { value, unit: 'TB' };
    if (unit === 'P' || unit === 'PB') return { value, unit: 'PB' };
    if (unit === 'B' || unit === 'BYTES') return { value, unit: 'B' };
    if (unit === 'BIT' || unit === 'BITS') return { value, unit: 'b' };

    return { value, unit };
  }

  // If no unit specified, assume bytes
  const value = parseFloat(trimmed);
  if (!isNaN(value)) {
    return { value, unit: 'B' };
  }

  throw new Error('Invalid size format');
}

// Convert size to bytes
export function toBytes(size: string, base: 'binary' | 'decimal' = 'binary'): number {
  const { value, unit } = parseSize(size);

  if (base === 'decimal' && unit !== 'b' && unit !== 'B') {
    // Use decimal multipliers for larger units
    const decimalUnits = {
      'KB': 1000,
      'MB': 1000 * 1000,
      'GB': 1000 * 1000 * 1000,
      'TB': 1000 * 1000 * 1000 * 1000,
      'PB': 1000 * 1000 * 1000 * 1000 * 1000
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

// Convert bytes to target unit
export function fromBytes(bytes: number, targetUnit: string, base: 'binary' | 'decimal' = 'binary'): string {
  let multiplier: number;

  if (base === 'decimal' && targetUnit !== 'b' && targetUnit !== 'B') {
    // Use decimal multipliers for larger units
    const decimalUnits = {
      'KB': 1000,
      'MB': 1000 * 1000,
      'GB': 1000 * 1000 * 1000,
      'TB': 1000 * 1000 * 1000 * 1000,
      'PB': 1000 * 1000 * 1000 * 1000 * 1000
    };

    multiplier = decimalUnits[targetUnit] || UNITS[targetUnit];
  } else {
    multiplier = UNITS[targetUnit];
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

// Main byte size converter function
export function convertByteSize(input: string, targetUnit: string, base: 'binary' | 'decimal' = 'binary'): string {
  const bytes = toBytes(input, base);
  const result = fromBytes(bytes, targetUnit, base);
  return `${result} ${targetUnit}`;
}

// Get all available units
export function getAvailableUnits(): string[] {
  return Object.keys(UNITS);
}

// Get human readable size
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

// Parse friendly input like "1.5MB"
export function parseFriendlySize(input: string): number {
  return toBytes(input);
}

// Get all available byte size formats
export function getAvailableByteSizeFormats(): ByteSizeConverter[] {
  return [
    {
      name: 'Bits',
      convert: (input, targetUnit) => convertByteSize(input, 'b'),
      description: 'Convert to bits'
    },
    {
      name: 'Bytes',
      convert: (input, targetUnit) => convertByteSize(input, 'B'),
      description: 'Convert to bytes'
    },
    {
      name: 'KB (Binary)',
      convert: (input, targetUnit) => convertByteSize(input, 'KB', 'binary'),
      description: 'Convert to kilobytes (1024 base)'
    },
    {
      name: 'MB (Binary)',
      convert: (input, targetUnit) => convertByteSize(input, 'MB', 'binary'),
      description: 'Convert to megabytes (1024 base)'
    },
    {
      name: 'GB (Binary)',
      convert: (input, targetUnit) => convertByteSize(input, 'GB', 'binary'),
      description: 'Convert to gigabytes (1024 base)'
    },
    {
      name: 'TB (Binary)',
      convert: (input, targetUnit) => convertByteSize(input, 'TB', 'binary'),
      description: 'Convert to terabytes (1024 base)'
    },
    {
      name: 'KB (Decimal)',
      convert: (input, targetUnit) => convertByteSize(input, 'KB', 'decimal'),
      description: 'Convert to kilobytes (1000 base)'
    },
    {
      name: 'MB (Decimal)',
      convert: (input, targetUnit) => convertByteSize(input, 'MB', 'decimal'),
      description: 'Convert to megabytes (1000 base)'
    },
    {
      name: 'GB (Decimal)',
      convert: (input, targetUnit) => convertByteSize(input, 'GB', 'decimal'),
      description: 'Convert to gigabytes (1000 base)'
    },
    {
      name: 'TB (Decimal)',
      convert: (input, targetUnit) => convertByteSize(input, 'TB', 'decimal'),
      description: 'Convert to terabytes (1000 base)'
    },
    {
      name: 'Human Readable',
      convert: (input, targetUnit) => toHumanReadable(toBytes(input)),
      description: 'Convert to human readable format'
    }
  ];
}

// Examples
export const byteSizeConverterExamples = {
  bytesToKB: {
    input: '2048 B',
    output: '2 KB',
    description: 'Convert 2048 bytes to KB (binary)'
  },
  mbToBytes: {
    input: '1.5 MB',
    output: '1572864 B',
    description: 'Convert 1.5 MB to bytes'
  },
  gbToMb: {
    input: '2 GB',
    output: '2048 MB',
    description: 'Convert 2 GB to MB (binary)'
  },
  humanReadable: {
    input: '1572864 B',
    output: '1.50 MB',
    description: 'Convert to human readable format'
  },
  decimalConversion: {
    input: '1000 KB',
    output: '1 MB',
    description: 'Convert using decimal base (1000)'
  }
};