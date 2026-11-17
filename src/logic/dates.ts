import { DAYS, type Day } from "../data/types";

const pad = (n: number) => String(n).padStart(2, "0");
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Monday of the week containing `date`. */
export function mondayOf(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - offset);
  return toISO(d);
}

/** The week people plan for: from Friday on, that's next week (the Sunday-night shop). */
export function planningWeek(now = new Date()): string {
  const monday = mondayOf(now);
  const dow = now.getDay(); // 0 Sun, 5 Fri, 6 Sat
  return dow === 0 || dow >= 5 ? addDays(monday, 7) : monday;
}

/** Day index since an epoch, used to measure "days since eaten". */
export function dayNumber(weekStart: string, day: Day): number {
  return Math.round(fromISO(weekStart).getTime() / 86_400_000) + DAYS.indexOf(day);
}

export function weekLabel(weekStart: string): string {
  const s = fromISO(weekStart);
  const e = fromISO(addDays(weekStart, 6));
  const f = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${f(s)} – ${f(e)}`;
}
