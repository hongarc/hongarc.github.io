const INTEGER_PATTERN = /^-?\d+$/;

// Above this absolute value (year 3000 in seconds) a Unix timestamp is taken as milliseconds.
const MILLISECOND_THRESHOLD = 32_503_680_000;

const toValidDate = (date: Date): Date | null => (Number.isNaN(date.getTime()) ? null : date);

export const parseTimestampInput = (text: string): Date | null => {
  const trimmed = text.trim();

  if (INTEGER_PATTERN.test(trimmed)) {
    const value = Number(trimmed);
    const milliseconds = Math.abs(value) > MILLISECOND_THRESHOLD ? value : value * 1000;
    return toValidDate(new Date(milliseconds));
  }

  return toValidDate(new Date(trimmed));
};
