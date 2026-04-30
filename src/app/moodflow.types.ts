export type PromptPeriod = 'midday' | 'evening';
export type MoodLevel = 'great' | 'good' | 'reasonable' | 'low';
export type LocationOption = 'home' | 'work' | 'out';
export type CompanionOption = 'alone' | 'partner' | 'friends' | 'family' | 'colleagues';
export type ActivityOption = 'working' | 'relaxing' | 'chores' | 'socializing' | 'hobbies';
export type PromptStatus = 'answered' | 'open' | 'missed' | 'upcoming';
export type TabId = 'today' | 'calendar' | 'stats' | 'settings';

export interface MoodSettings {
  reminderTimes: Record<PromptPeriod, string>;
  notificationsEnabled: boolean;
  profileEmail: string;
}

export interface MoodEntry {
  id: string;
  dateKey: string;
  period: PromptPeriod;
  scheduledFor: string;
  answeredAt: string;
  mood: MoodLevel;
  location: LocationOption;
  companion: CompanionOption;
  activity: ActivityOption;
  note: string;
}

export interface PromptSlot {
  dateKey: string;
  period: PromptPeriod;
  label: string;
  time: string;
  scheduledAt: Date;
  expiresAt: Date;
  status: PromptStatus;
  manual?: boolean;
  entry?: MoodEntry;
}

export interface SelectOption<T extends string> {
  id: T;
  label: string;
  emoji?: string;
}

export interface MoodOption extends SelectOption<MoodLevel> {
  score: number;
}

export interface MoodDraft {
  mood: MoodLevel | '';
  location: LocationOption | '';
  companion: CompanionOption | '';
  activity: ActivityOption | '';
  note: string;
}

export const DEFAULT_SETTINGS: MoodSettings = {
  reminderTimes: {
    midday: '12:00',
    evening: '20:00',
  },
  notificationsEnabled: false,
  profileEmail: '',
};

export const PERIOD_LABELS: Record<PromptPeriod, string> = {
  midday: 'First check-in',
  evening: 'Second check-in',
};

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'great', label: 'Great', emoji: '😁', score: 5 },
  { id: 'good', label: 'Good', emoji: '🙂', score: 4 },
  { id: 'reasonable', label: 'Reasonable', emoji: '😐', score: 3 },
  { id: 'low', label: 'Low', emoji: '🙁', score: 1 },
];

export const LOCATION_OPTIONS: SelectOption<LocationOption>[] = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'out', label: 'Out', emoji: '📍' },
];

export const COMPANION_OPTIONS: SelectOption<CompanionOption>[] = [
  { id: 'alone', label: 'Alone', emoji: '🧍' },
  { id: 'partner', label: 'Partner', emoji: '💚' },
  { id: 'friends', label: 'Friends', emoji: '✨' },
  { id: 'family', label: 'Family', emoji: '🏡' },
  { id: 'colleagues', label: 'Colleagues', emoji: '🤝' },
];

export const ACTIVITY_OPTIONS: SelectOption<ActivityOption>[] = [
  { id: 'working', label: 'Working', emoji: '💻' },
  { id: 'relaxing', label: 'Relaxing', emoji: '🌿' },
  { id: 'chores', label: 'Chores', emoji: '🧺' },
  { id: 'socializing', label: 'Socializing', emoji: '☕' },
  { id: 'hobbies', label: 'Hobbies', emoji: '🎨' },
];

export function moodScore(level: MoodLevel): number {
  return MOOD_OPTIONS.find((option) => option.id === level)?.score ?? 0;
}

export function emptyMoodDraft(): MoodDraft {
  return {
    mood: '',
    location: '',
    companion: '',
    activity: '',
    note: '',
  };
}
