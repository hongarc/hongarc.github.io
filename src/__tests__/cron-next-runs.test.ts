import { afterEach, describe, expect, it } from 'vitest';

import { nextRuns } from '@/domain/cron/next-runs';

const FROM = new Date(2026, 9, 5, 10, 30); // Monday 2026-10-05 10:30 local

const d = (y: number, m: number, day: number, h = 0, min = 0): Date =>
  new Date(y, m - 1, day, h, min);

describe('nextRuns', () => {
  it('finds Mondays at 09:00 more than 8 hours away', () => {
    expect(nextRuns('0 9 * * 1', FROM)).toEqual([
      d(2026, 10, 12, 9),
      d(2026, 10, 19, 9),
      d(2026, 10, 26, 9),
      d(2026, 11, 2, 9),
      d(2026, 11, 9, 9),
    ]);
  });

  it('returns five daily runs for midnight', () => {
    expect(nextRuns('0 0 * * *', FROM)).toEqual([
      d(2026, 10, 6),
      d(2026, 10, 7),
      d(2026, 10, 8),
      d(2026, 10, 9),
      d(2026, 10, 10),
    ]);
  });

  it('steps through the same day for */15', () => {
    expect(nextRuns('*/15 * * * *', FROM)).toEqual([
      d(2026, 10, 5, 10, 45),
      d(2026, 10, 5, 11, 0),
      d(2026, 10, 5, 11, 15),
      d(2026, 10, 5, 11, 30),
      d(2026, 10, 5, 11, 45),
    ]);
  });

  it('honours the range in a stepped range (10-20/5)', () => {
    expect(nextRuns('10-20/5 * * * *', FROM)).toEqual([
      d(2026, 10, 5, 11, 10),
      d(2026, 10, 5, 11, 15),
      d(2026, 10, 5, 11, 20),
      d(2026, 10, 5, 12, 10),
      d(2026, 10, 5, 12, 15),
    ]);
  });

  it('is strictly after from', () => {
    expect(nextRuns('30 10 * * *', FROM)[0]).toEqual(d(2026, 10, 6, 10, 30));
  });

  it('finds a yearly run once within 366 days', () => {
    expect(nextRuns('0 0 1 1 *', FROM)).toEqual([d(2027, 1, 1)]);
  });

  it('returns [] for a schedule that never fires', () => {
    expect(nextRuns('0 0 30 2 *', FROM)).toEqual([]);
  });

  it('supports lists and a custom count, oldest first, zero seconds', () => {
    const runs = nextRuns('5,35 12 * * *', FROM, 3);
    expect(runs).toEqual([d(2026, 10, 5, 12, 5), d(2026, 10, 5, 12, 35), d(2026, 10, 6, 12, 5)]);
    for (const run of runs) {
      expect(run.getSeconds()).toBe(0);
      expect(run.getMilliseconds()).toBe(0);
    }
  });

  it('treats a start with a step as running to the end of the field (5/20)', () => {
    expect(nextRuns('5/20 11 * * *', FROM, 4)).toEqual([
      d(2026, 10, 5, 11, 5),
      d(2026, 10, 5, 11, 25),
      d(2026, 10, 5, 11, 45),
      d(2026, 10, 6, 11, 5),
    ]);
  });

  it('requires both day-of-month and day-of-week to match', () => {
    // 2026-11-13 is the first Friday the 13th after FROM
    expect(nextRuns('0 0 13 * 5', FROM, 1)).toEqual([d(2026, 11, 13)]);
  });

  it('includes exactly 366 days ahead and nothing later', () => {
    const from = new Date(2027, 2, 1, 10, 30); // 2027-03-01 to 2028-03-01 is 366 days
    // 2027-03-01 is a Monday, 2028-03-01 a Wednesday: only the 2028 date can match
    expect(nextRuns('30 10 1 3 3', from)).toEqual([d(2028, 3, 1, 10, 30)]);
    expect(nextRuns('31 10 1 3 3', from)).toEqual([]);
  });

  it.each([
    '',
    '* * * *',
    '* * * * * *',
    '60 * * * *',
    '* 24 * * *',
    '* * 0 * *',
    '* * * 13 *',
    '* * * * 7',
    'a * * * *',
    '*/0 * * * *',
    '*/x * * * *',
    '*/2/3 * * * *',
    '5-1 * * * *',
    '1-2-3 * * * *',
    '1, * * * *',
  ])('returns [] for invalid expression %j', (expression) => {
    expect(nextRuns(expression, FROM)).toEqual([]);
  });
});

describe('nextRuns across a DST gap', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  });

  it('skips the local time that does not exist', () => {
    process.env.TZ = 'America/New_York';
    // 2026-03-08 02:30 does not exist in New York (clocks jump 02:00 -> 03:00)
    const runs = nextRuns('30 2 * * *', new Date(2026, 2, 7, 12, 0), 3);
    expect(runs).toEqual([
      new Date(2026, 2, 9, 2, 30),
      new Date(2026, 2, 10, 2, 30),
      new Date(2026, 2, 11, 2, 30),
    ]);
  });
});
