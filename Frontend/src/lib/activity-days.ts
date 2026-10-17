import { format, isValid, subDays } from 'date-fns';

const CALENDAR_DATE = /^(\d{4}-\d{2}-\d{2})(T00:00:00(\.0+)?Z)?$/;

/** `yyyy-MM-dd` for an API date: a SQL DATE (UTC midnight) keeps its calendar day; a timestamp uses local time. */
export function dayKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const calendar = CALENDAR_DATE.exec(value);
  if (calendar) return calendar[1];
  const d = new Date(value);
  return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
}

/** Sum minutes per day; the APIs return one row per (day, activity type), sparse and unordered. */
export function minutesByDay(
  rows: { date: string; minutesSpent: number }[] | null | undefined,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows ?? []) {
    const key = dayKey(row.date);
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + (Number(row.minutesSpent) || 0));
  }
  return totals;
}

/** The last `n` calendar days ending today, oldest first, each labelled from its own date. */
export function lastDays(n: number, now: Date = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const day = subDays(now, n - 1 - i);
    return { key: format(day, 'yyyy-MM-dd'), label: format(day, 'EEE') };
  });
}
