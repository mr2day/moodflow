import {
  ACTIVITY_OPTIONS,
  ActivityOption,
  COMPANION_OPTIONS,
  CompanionOption,
  LOCATION_OPTIONS,
  LocationOption,
  MoodEntry,
  MoodLevel,
  SelectOption,
  moodScore,
} from './moodflow.types';
import { daysInMonth, shiftMonth } from './date-utils';

export interface DailyMoodPoint {
  dateKey: string;
  day: number;
  average: number | null;
  height: number;
}

export interface ContextInsight {
  label: string;
  average: number;
  count: number;
}

export interface MoodDistributionItem {
  mood: MoodLevel;
  label: string;
  count: number;
}

export interface MonthSummary {
  monthKey: string;
  entries: MoodEntry[];
  average: number | null;
  previousAverage: number | null;
  change: number | null;
  bestDay: DailyMoodPoint | null;
  bestContext: ContextInsight | null;
  worstContext: ContextInsight | null;
  chart: DailyMoodPoint[];
  distribution: MoodDistributionItem[];
}

export function summarizeMonth(allEntries: MoodEntry[], monthKey: string): MonthSummary {
  const entries = entriesForMonth(allEntries, monthKey);
  const previousEntries = entriesForMonth(allEntries, shiftMonth(monthKey, -1));
  const average = averageScore(entries);
  const previousAverage = averageScore(previousEntries);
  const chart = buildDailyChart(entries, monthKey);

  return {
    monthKey,
    entries,
    average,
    previousAverage,
    change: average === null || previousAverage === null ? null : roundOne(average - previousAverage),
    bestDay: chart
      .filter((point): point is DailyMoodPoint & { average: number } => point.average !== null)
      .sort((a, b) => b.average - a.average || a.day - b.day)[0] ?? null,
    bestContext: contextInsight(entries, 'best'),
    worstContext: contextInsight(entries, 'worst'),
    chart,
    distribution: [
      { mood: 'great', label: 'Great', count: entries.filter((entry) => entry.mood === 'great').length },
      { mood: 'good', label: 'Good', count: entries.filter((entry) => entry.mood === 'good').length },
      {
        mood: 'reasonable',
        label: 'Reasonable',
        count: entries.filter((entry) => entry.mood === 'reasonable').length,
      },
      { mood: 'low', label: 'Low', count: entries.filter((entry) => entry.mood === 'low').length },
    ],
  };
}

function entriesForMonth(entries: MoodEntry[], monthKey: string): MoodEntry[] {
  return entries.filter((entry) => entry.dateKey.startsWith(monthKey));
}

function averageScore(entries: MoodEntry[]): number | null {
  if (entries.length === 0) {
    return null;
  }

  return roundOne(entries.reduce((total, entry) => total + moodScore(entry.mood), 0) / entries.length);
}

function buildDailyChart(entries: MoodEntry[], monthKey: string): DailyMoodPoint[] {
  return Array.from({ length: daysInMonth(monthKey) }, (_, index) => {
    const day = index + 1;
    const dateKey = `${monthKey}-${String(day).padStart(2, '0')}`;
    const dayEntries = entries.filter((entry) => entry.dateKey === dateKey);
    const average = averageScore(dayEntries);

    return {
      dateKey,
      day,
      average,
      height: average === null ? 0 : Math.max(8, (average / 5) * 100),
    };
  });
}

function contextInsight(entries: MoodEntry[], mode: 'best' | 'worst'): ContextInsight | null {
  const groups: ContextInsight[] = [
    ...groupByContext(entries, 'location', LOCATION_OPTIONS),
    ...groupByContext(entries, 'companion', COMPANION_OPTIONS),
    ...groupByContext(entries, 'activity', ACTIVITY_OPTIONS),
  ];

  if (groups.length === 0) {
    return null;
  }

  return groups.sort((a, b) =>
    mode === 'best' ? b.average - a.average || b.count - a.count : a.average - b.average || b.count - a.count,
  )[0];
}

function groupByContext<T extends LocationOption | CompanionOption | ActivityOption>(
  entries: MoodEntry[],
  field: 'location' | 'companion' | 'activity',
  options: SelectOption<T>[],
): ContextInsight[] {
  return options
    .map((option) => {
      const matching = entries.filter((entry) => entry[field] === option.id);
      const average = averageScore(matching);

      return average === null
        ? null
        : {
            label: option.label,
            average,
            count: matching.length,
          };
    })
    .filter((item): item is ContextInsight => item !== null);
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}
