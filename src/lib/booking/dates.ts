/** Calendar date helpers — ISO YYYY-MM-DD, local civil dates (no TZ shift). */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  return DATE_RE.test(value);
}

export function toIsoDate(year: number, monthIndex: number, day: number): string {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoParts(iso: string): { y: number; m: number; d: number } {
  return {
    y: Number(iso.slice(0, 4)),
    m: Number(iso.slice(5, 7)) - 1,
    d: Number(iso.slice(8, 10)),
  };
}

export function addDaysIso(iso: string, days: number): string {
  const { y, m, d } = parseIsoParts(iso);
  const date = new Date(Date.UTC(y, m, d + days));
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function startOfMonthIso(year: number, monthIndex: number): string {
  return toIsoDate(year, monthIndex, 1);
}

export function addMonths(year: number, monthIndex: number, delta: number): {
  year: number;
  monthIndex: number;
} {
  const date = new Date(Date.UTC(year, monthIndex + delta, 1));
  return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() };
}

/** Half-open night count for stay [checkIn, checkOut). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseIsoParts(checkIn);
  const b = parseIsoParts(checkOut);
  const start = Date.UTC(a.y, a.m, a.d);
  const end = Date.UTC(b.y, b.m, b.d);
  return Math.round((end - start) / 86_400_000);
}

/** Each occupied night date in [checkIn, checkOut). */
export function occupiedNights(checkIn: string, checkOut: string): string[] {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) return [];
  const result: string[] = [];
  for (let i = 0; i < nights; i += 1) {
    result.push(addDaysIso(checkIn, i));
  }
  return result;
}

export function todayIsoLocal(): string {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatCompactMoney(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) return amount;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}

export type MonthCell = {
  date: string;
  dayOfMonth: number;
  inMonth: boolean;
};

/** Sunday-start month grid (6×7) for a civil month. */
export function buildMonthGrid(year: number, monthIndex: number): MonthCell[] {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const startWeekday = first.getUTCDay(); // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: MonthCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const dayOffset = i - startWeekday + 1;
    if (dayOffset < 1 || dayOffset > daysInMonth) {
      const date = new Date(Date.UTC(year, monthIndex, dayOffset));
      cells.push({
        date: toIsoDate(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate()
        ),
        dayOfMonth: date.getUTCDate(),
        inMonth: false,
      });
    } else {
      cells.push({
        date: toIsoDate(year, monthIndex, dayOffset),
        dayOfMonth: dayOffset,
        inMonth: true,
      });
    }
  }

  return cells;
}
