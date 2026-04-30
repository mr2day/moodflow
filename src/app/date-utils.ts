import { MoodEntry, MoodSettings, PERIOD_LABELS, PromptSlot } from './moodflow.types';

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function dateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function localDateTime(dateKey: string, time: string): Date {
  return new Date(`${dateKey}T${time}:00`);
}

export function localDateTimeKey(dateKey: string, time: string): string {
  return `${dateKey}T${time}:00`;
}

export function timeFromDate(date: Date): string {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function formatDisplayDate(dateKey: string): string {
  return dateFromKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthLabel(monthKey: string): string {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function shiftMonth(monthKey: string, delta: number): string {
  const date = new Date(`${monthKey}-01T00:00:00`);
  date.setMonth(date.getMonth() + delta);
  return toMonthKey(date);
}

export function buildPromptSlots(
  dateKey: string,
  settings: MoodSettings,
  entries: MoodEntry[],
  now: Date,
): PromptSlot[] {
  return (Object.keys(settings.reminderTimes) as Array<keyof typeof settings.reminderTimes>).map((period) => {
    const time = settings.reminderTimes[period];
    const scheduledAt = localDateTime(dateKey, time);
    const expiresAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000);
    const entry = entries.find((item) => item.dateKey === dateKey && item.period === period);
    const status = entry ? 'answered' : now < scheduledAt ? 'upcoming' : now <= expiresAt ? 'open' : 'missed';

    return {
      dateKey,
      period,
      label: PERIOD_LABELS[period],
      time,
      scheduledAt,
      expiresAt,
      status,
      entry,
    };
  });
}

export function isSameMonth(dateKey: string, monthKey: string): boolean {
  return dateKey.startsWith(monthKey);
}

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}
