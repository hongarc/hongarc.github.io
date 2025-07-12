export interface TimestampConverter {
  name: string;
  convert: (input: string | number) => string;
  description: string;
}

// Convert Unix timestamp to ISO date
export function timestampToIso(timestamp: number | string): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString();
}

// Convert Unix timestamp to local date string
export function timestampToLocal(timestamp: number | string): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toString();
}

// Convert Unix timestamp to UTC string
export function timestampToUtc(timestamp: number | string): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toUTCString();
}

// Convert ISO date to Unix timestamp
export function isoToTimestamp(isoString: string): number {
  return Math.floor(new Date(isoString).getTime() / 1000);
}

// Convert local date string to Unix timestamp
export function localToTimestamp(dateString: string): number {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

// Get current timestamp
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

// Get current ISO date
export function getCurrentIso(): string {
  return new Date().toISOString();
}

// Convert to relative time
export function toRelativeTime(timestamp: number | string): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(timestamp);

  const seconds = Math.floor(diff);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  return 'just now';
}

// Convert timezone
export function convertTimezone(dateString: string, fromTimezone: string, toTimezone: string): string {
  // This is a simplified implementation
  // In a real application, you'd use a library like moment-timezone or date-fns-tz
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { timeZone: toTimezone });
}

// Main timestamp converter function
export function convertTimestamp(input: string | number, targetFormat: string): string {
  const inputStr = String(input).trim();

  // Auto-detect input format
  let isTimestamp = false;
  let isIso = false;

  // Check if it's a Unix timestamp (numeric)
  if (!isNaN(Number(inputStr)) && Number(inputStr) > 1000000000) {
    isTimestamp = true;
  }

  // Check if it's an ISO date
  if (inputStr.includes('T') && inputStr.includes('Z')) {
    isIso = true;
  }

  switch (targetFormat.toLowerCase()) {
    case 'timestamp':
    case 'unix':
      if (isTimestamp) return inputStr;
      if (isIso) return String(isoToTimestamp(inputStr));
      return String(localToTimestamp(inputStr));

    case 'iso':
      if (isTimestamp) return timestampToIso(Number(inputStr));
      if (isIso) return inputStr;
      return new Date(inputStr).toISOString();

    case 'local':
      if (isTimestamp) return timestampToLocal(Number(inputStr));
      if (isIso) return new Date(inputStr).toString();
      return new Date(inputStr).toString();

    case 'utc':
      if (isTimestamp) return timestampToUtc(Number(inputStr));
      if (isIso) return new Date(inputStr).toUTCString();
      return new Date(inputStr).toUTCString();

    case 'relative':
      if (isTimestamp) return toRelativeTime(Number(inputStr));
      if (isIso) return toRelativeTime(isoToTimestamp(inputStr));
      return toRelativeTime(localToTimestamp(inputStr));

    case 'now':
      return String(getCurrentTimestamp());

    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Get all available timestamp formats
export function getAvailableTimestampFormats(): TimestampConverter[] {
  return [
    {
      name: 'Unix Timestamp',
      convert: (input) => convertTimestamp(input, 'timestamp'),
      description: 'Convert to Unix timestamp (seconds since epoch)'
    },
    {
      name: 'ISO Date',
      convert: (input) => convertTimestamp(input, 'iso'),
      description: 'Convert to ISO 8601 date string'
    },
    {
      name: 'Local Time',
      convert: (input) => convertTimestamp(input, 'local'),
      description: 'Convert to local date string'
    },
    {
      name: 'UTC',
      convert: (input) => convertTimestamp(input, 'utc'),
      description: 'Convert to UTC date string'
    },
    {
      name: 'Relative Time',
      convert: (input) => convertTimestamp(input, 'relative'),
      description: 'Convert to relative time (e.g., "2 hours ago")'
    },
    {
      name: 'Current Time',
      convert: () => String(getCurrentTimestamp()),
      description: 'Get current Unix timestamp'
    }
  ];
}

// Examples
export const timestampConverterExamples = {
  timestampToIso: {
    input: '1640995200',
    output: '2022-01-01T00:00:00.000Z',
    description: 'Convert Unix timestamp to ISO date'
  },
  isoToTimestamp: {
    input: '2022-01-01T00:00:00.000Z',
    output: '1640995200',
    description: 'Convert ISO date to Unix timestamp'
  },
  currentTime: {
    input: 'now',
    output: String(Math.floor(Date.now() / 1000)),
    description: 'Get current timestamp'
  },
  relativeTime: {
    input: '1640995200',
    output: '2 years ago',
    description: 'Convert to relative time'
  }
};