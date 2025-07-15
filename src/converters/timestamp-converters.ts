import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export interface TimestampConverter {
  name: string;
  convert: (input: string | number) => string;
  description: string;
}

export function getAvailableTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone');
}

export function timestampToIso(timestamp: number | string): string {
  return new Date(Number(timestamp) * 1000).toISOString();
}

export function timestampToLocal(timestamp: number | string): string {
  return new Date(Number(timestamp) * 1000).toString();
}

export function timestampToUtc(timestamp: number | string): string {
  return new Date(Number(timestamp) * 1000).toUTCString();
}

export function isoToTimestamp(isoString: string): number {
  return Math.floor(new Date(isoString).getTime() / 1000);
}

export function localToTimestamp(dateString: string): number {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

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

export function convertTimezone(
  dateString: string,
  fromTimezone: string,
  toTimezone: string
): string {
  try {
    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, toTimezone);
    return formatInTimeZone(zonedDate, toTimezone, 'yyyy-MM-dd HH:mm:ss zzz');
  } catch (error) {
    throw new Error(
      `Timezone conversion failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export function convertToTimezone(
  input: string | number,
  timezone: string
): string {
  try {
    const date =
      typeof input === 'number' ? new Date(input * 1000) : new Date(input);
    const zonedDate = toZonedTime(date, timezone);
    return formatInTimeZone(zonedDate, timezone, 'yyyy-MM-dd HH:mm:ss zzz');
  } catch (error) {
    throw new Error(
      `Timezone conversion failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

// --- Refactored section below ---

type ParsedInput = {
  inputStr: string;
  numInput: number;
  isTimestamp: boolean;
  isIso: boolean;
  date: Date;
  timestamp: number;
};

function resolveTimestamp(
  inputString: string,
  isTimestamp: boolean,
  isIso: boolean,
  numberInput: number
): number {
  if (isTimestamp) return numberInput;
  if (isIso) return isoToTimestamp(inputString);
  return localToTimestamp(inputString);
}

function parseInput(input: string | number): ParsedInput {
  const inputString = String(input).trim();
  const numberInput = Number(inputString);
  const isTimestamp = !Number.isNaN(numberInput) && numberInput > 1_000_000_000;
  const isIso = inputString.includes('T') && inputString.includes('Z');
  const date = isTimestamp
    ? new Date(numberInput * 1000)
    : new Date(inputString);
  const timestamp = resolveTimestamp(
    inputString,
    isTimestamp,
    isIso,
    numberInput
  );

  return {
    inputStr: inputString,
    numInput: numberInput,
    isTimestamp,
    isIso,
    date,
    timestamp,
  };
}

export function convertTimestamp(
  input: string | number,
  targetFormat: string,
  timezone?: string
): string {
  const parsed = parseInput(input);
  const { inputStr, date, timestamp, isIso } = parsed;

  const converters: Record<string, () => string> = {
    timestamp: () => String(timestamp),
    unix: () => String(timestamp),
    iso: () => (isIso ? inputStr : date.toISOString()),
    local: () => date.toString(),
    utc: () => date.toUTCString(),
    relative: () => toRelativeTime(timestamp),
    timezone: () => {
      if (!timezone)
        throw new Error('Timezone is required for timezone conversion');
      return convertToTimezone(input, timezone);
    },
    now: () => String(getCurrentTimestamp()),
  };

  const formatKey = targetFormat.toLowerCase();
  const converter = converters[formatKey];

  if (!converter) {
    throw new Error(`Unsupported target format: ${targetFormat}`);
  }

  return converter();
}

// --- End of refactor ---

export function getAvailableTimestampFormats(): TimestampConverter[] {
  return [
    {
      name: 'Unix Timestamp',
      convert: input => convertTimestamp(input, 'timestamp'),
      description: 'Convert to Unix timestamp (seconds since epoch)',
    },
    {
      name: 'ISO Date',
      convert: input => convertTimestamp(input, 'iso'),
      description: 'Convert to ISO 8601 date string',
    },
    {
      name: 'Local Time',
      convert: input => convertTimestamp(input, 'local'),
      description: 'Convert to local date string',
    },
    {
      name: 'UTC',
      convert: input => convertTimestamp(input, 'utc'),
      description: 'Convert to UTC date string',
    },
    {
      name: 'Relative Time',
      convert: input => convertTimestamp(input, 'relative'),
      description: 'Convert to relative time (e.g., "2 hours ago")',
    },
    {
      name: 'Current Time',
      convert: () => String(getCurrentTimestamp()),
      description: 'Get current Unix timestamp',
    },
  ];
}

const simpleTimestamp = '2022-01-01T00:00:00.000Z';
export const timestampConverterExamples = {
  timestampToIso: {
    input: '1640995200',
    output: simpleTimestamp,
    description: 'Convert Unix timestamp to ISO date',
  },
  isoToTimestamp: {
    input: simpleTimestamp,
    output: '1640995200',
    description: 'Convert ISO date to Unix timestamp',
  },
  currentTime: {
    input: 'now',
    output: String(Math.floor(Date.now() / 1000)),
    description: 'Get current timestamp',
  },
  relativeTime: {
    input: '1640995200',
    output: '2 years ago',
    description: 'Convert to relative time',
  },
  timezoneConversion: {
    input: simpleTimestamp,
    output: '2022-01-01 00:00:00 UTC',
    description: 'Convert to specific timezone',
  },
};
