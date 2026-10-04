const SEARCH_DAYS = 366;

const FIELD_BOUNDS = [
  { min: 0, max: 59 },
  { min: 0, max: 23 },
  { min: 1, max: 31 },
  { min: 1, max: 12 },
  { min: 0, max: 6 },
] as const;

const parseNumber = (text: string): number => (/^\d+$/.test(text) ? Number(text) : Number.NaN);

const parsePart = (part: string, min: number, max: number): readonly number[] | null => {
  const [base = '', stepText, ...extra] = part.split('/');
  if (extra.length > 0) return null;

  const step = stepText === undefined ? 1 : parseNumber(stepText);
  if (!(step >= 1)) return null;

  let start = min;
  let end = max;
  if (base !== '*') {
    const [startText = '', endText, ...rest] = base.split('-');
    if (rest.length > 0) return null;
    start = parseNumber(startText);
    if (endText !== undefined) {
      end = parseNumber(endText);
    } else if (stepText === undefined) {
      end = start;
    }
  }
  if (!(start >= min && end <= max && start <= end)) return null;

  const values: number[] = [];
  for (let value = start; value <= end; value += step) values.push(value);
  return values;
};

const parseField = (field: string, min: number, max: number): ReadonlySet<number> | null => {
  const values = new Set<number>();
  for (const part of field.split(',')) {
    const parsed = parsePart(part, min, max);
    if (!parsed) return null;
    for (const value of parsed) values.add(value);
  }
  return values;
};

const parseExpression = (expression: string): readonly ReadonlySet<number>[] | null => {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== FIELD_BOUNDS.length) return null;

  const parsed: ReadonlySet<number>[] = [];
  for (const [index, field] of fields.entries()) {
    const bounds = FIELD_BOUNDS[index];
    const values = bounds ? parseField(field, bounds.min, bounds.max) : null;
    if (!values) return null;
    parsed.push(values);
  }
  return parsed;
};

/**
 * Next `count` run times of a 5-field cron expression strictly after `from`, in local time,
 * oldest first, searching up to 366 days ahead. Returns [] for an invalid expression.
 * Day-of-month and day-of-week must both match.
 */
export const nextRuns = (expression: string, from: Date, count = 5): Date[] => {
  const parsed = parseExpression(expression);
  if (!parsed) return [];
  const [minutes, hours, daysOfMonth, months, daysOfWeek] = parsed as [
    ReadonlySet<number>,
    ReadonlySet<number>,
    ReadonlySet<number>,
    ReadonlySet<number>,
    ReadonlySet<number>,
  ];

  const year = from.getFullYear();
  const month = from.getMonth();
  const day = from.getDate();
  const limit = new Date(
    year,
    month,
    day + SEARCH_DAYS,
    from.getHours(),
    from.getMinutes()
  ).getTime();

  const runs: Date[] = [];
  for (let offset = 0; offset <= SEARCH_DAYS && runs.length < count; offset++) {
    const date = new Date(year, month, day + offset);
    const matchesDay =
      months.has(date.getMonth() + 1) &&
      daysOfMonth.has(date.getDate()) &&
      daysOfWeek.has(date.getDay());
    if (!matchesDay) continue;

    for (let hour = 0; hour < 24; hour++) {
      if (!hours.has(hour)) continue;
      for (let minute = 0; minute < 60; minute++) {
        if (!minutes.has(minute)) continue;
        const candidate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour,
          minute
        );
        const time = candidate.getTime();
        // A candidate inside a DST gap is shifted by the platform; skip it.
        if (candidate.getHours() !== hour) continue;
        if (time > from.getTime() && time <= limit && runs.length < count) runs.push(candidate);
      }
    }
  }
  return runs;
};
