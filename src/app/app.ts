import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  buildPromptSlots,
  dateFromKey,
  formatDisplayDate,
  formatMonthLabel,
  localDateTimeKey,
  shiftMonth,
  toDateKey,
  toMonthKey,
  timeFromDate,
} from './date-utils';
import { MonthSummary, summarizeMonth } from './moodflow.analytics';
import { MoodflowNotifications } from './notification.service';
import { MoodflowStore } from './moodflow.store';
import {
  ACTIVITY_OPTIONS,
  ActivityOption,
  COMPANION_OPTIONS,
  CompanionOption,
  DEFAULT_SETTINGS,
  LOCATION_OPTIONS,
  LocationOption,
  MOOD_OPTIONS,
  MoodDraft,
  MoodEntry,
  MoodLevel,
  MoodSettings,
  PERIOD_LABELS,
  PromptSlot,
  SelectOption,
  TabId,
  emptyMoodDraft,
  moodScore,
} from './moodflow.types';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

interface CalendarDay {
  dateKey: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  status: 'complete' | 'partial' | 'missed' | 'empty' | 'future';
  average: number | null;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  readonly tabs: TabItem[] = [
    { id: 'today', label: 'Today', icon: 'house' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar-days' },
    { id: 'stats', label: 'Stats', icon: 'chart-column' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  readonly moodOptions = MOOD_OPTIONS;
  readonly locationOptions = LOCATION_OPTIONS;
  readonly companionOptions = COMPANION_OPTIONS;
  readonly activityOptions = ACTIVITY_OPTIONS;
  readonly periodLabels = PERIOD_LABELS;

  activeTab: TabId = 'today';
  now = new Date();
  settings: MoodSettings = { ...DEFAULT_SETTINGS, reminderTimes: { ...DEFAULT_SETTINGS.reminderTimes } };
  settingsDraft: MoodSettings = { ...DEFAULT_SETTINGS, reminderTimes: { ...DEFAULT_SETTINGS.reminderTimes } };
  entries: MoodEntry[] = [];
  draft: MoodDraft = emptyMoodDraft();
  manualPrompt: PromptSlot | null = null;
  viewMonthKey = toMonthKey(new Date());
  selectedDateKey = toDateKey(new Date());
  notificationStatus = '';

  private tickerId?: number;

  constructor(
    private readonly store: MoodflowStore,
    private readonly notifications: MoodflowNotifications,
  ) {}

  ngOnInit(): void {
    this.entries = this.store.loadEntries();
    this.settings = this.store.loadSettings();
    this.settingsDraft = this.cloneSettings(this.settings);
    this.tickerId = window.setInterval(() => {
      this.now = new Date();
    }, 30_000);
  }

  ngOnDestroy(): void {
    if (this.tickerId) {
      window.clearInterval(this.tickerId);
    }
  }

  get todayKey(): string {
    return toDateKey(this.now);
  }

  get todaySlots(): PromptSlot[] {
    return this.slotsForDate(this.todayKey);
  }

  get activePrompt(): PromptSlot | undefined {
    return this.todaySlots.find((slot) => slot.status === 'open') ?? this.manualPrompt ?? undefined;
  }

  get focusPrompt(): PromptSlot {
    return (
      this.activePrompt ??
      this.todaySlots.find((slot) => slot.status === 'upcoming') ??
      this.todaySlots[this.todaySlots.length - 1]
    );
  }

  get canStartManualCheckin(): boolean {
    return !this.activePrompt && this.todaySlots.some((slot) => slot.status !== 'answered');
  }

  get noteWordCount(): number {
    const note = this.draft.note.trim();
    return note ? note.split(/\s+/).length : 0;
  }

  get canSave(): boolean {
    return (
      !!this.activePrompt &&
      !!this.draft.mood &&
      !!this.draft.location &&
      !!this.draft.companion &&
      !!this.draft.activity &&
      this.noteWordCount <= 20
    );
  }

  get calendarDays(): CalendarDay[] {
    const firstOfMonth = dateFromKey(`${this.viewMonthKey}-01`);
    const start = new Date(firstOfMonth);
    start.setDate(start.getDate() - firstOfMonth.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateKey = toDateKey(date);
      const slots = this.slotsForDate(dateKey);
      const dayEntries = this.entries.filter((entry) => entry.dateKey === dateKey);
      const average =
        dayEntries.length === 0
          ? null
          : this.roundOne(dayEntries.reduce((total, entry) => total + moodScore(entry.mood), 0) / dayEntries.length);
      const isFuture = dateFromKey(dateKey) > dateFromKey(this.todayKey);
      const answered = slots.filter((slot) => slot.status === 'answered').length;
      const missed = slots.filter((slot) => slot.status === 'missed').length;
      const status: CalendarDay['status'] = isFuture
        ? 'future'
        : answered === slots.length
          ? 'complete'
          : missed > 0
            ? 'missed'
            : answered > 0
              ? 'partial'
              : 'empty';

      return {
        dateKey,
        day: date.getDate(),
        inMonth: dateKey.startsWith(this.viewMonthKey),
        isToday: dateKey === this.todayKey,
        status,
        average,
      };
    });
  }

  get selectedDaySlots(): PromptSlot[] {
    return this.slotsForDate(this.selectedDateKey);
  }

  get selectedDayEntries(): MoodEntry[] {
    return this.entries.filter((entry) => entry.dateKey === this.selectedDateKey);
  }

  get summary(): MonthSummary {
    return summarizeMonth(this.entries, this.viewMonthKey);
  }

  get monthLabel(): string {
    return formatMonthLabel(this.viewMonthKey);
  }

  get selectedDateLabel(): string {
    return formatDisplayDate(this.selectedDateKey);
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  selectMood(value: MoodLevel): void {
    this.draft = { ...this.draft, mood: value };
  }

  selectLocation(value: LocationOption): void {
    this.draft = { ...this.draft, location: value };
  }

  selectCompanion(value: CompanionOption): void {
    this.draft = { ...this.draft, companion: value };
  }

  selectActivity(value: ActivityOption): void {
    this.draft = { ...this.draft, activity: value };
  }

  saveCurrentPrompt(): void {
    const prompt = this.activePrompt;

    if (!prompt || !this.canSave) {
      return;
    }

    const entry: MoodEntry = {
      id: this.store.createId(),
      dateKey: prompt.dateKey,
      period: prompt.period,
      scheduledFor: localDateTimeKey(prompt.dateKey, prompt.time),
      answeredAt: new Date().toISOString(),
      mood: this.draft.mood as MoodLevel,
      location: this.draft.location as LocationOption,
      companion: this.draft.companion as CompanionOption,
      activity: this.draft.activity as ActivityOption,
      note: this.draft.note.trim(),
    };

    this.entries = this.store.saveEntry(entry);
    this.draft = emptyMoodDraft();
    this.manualPrompt = null;
  }

  startManualCheckin(): void {
    if (this.activePrompt) {
      return;
    }

    const baseSlot = this.todaySlots.find((slot) => slot.status !== 'answered');

    if (!baseSlot) {
      return;
    }

    const startedAt = new Date();
    this.manualPrompt = {
      ...baseSlot,
      label: `${baseSlot.label} now`,
      time: timeFromDate(startedAt),
      scheduledAt: startedAt,
      expiresAt: new Date(startedAt.getTime() + 60 * 60 * 1000),
      status: 'open',
      manual: true,
    };
  }

  deleteEntry(entry: MoodEntry): void {
    this.entries = this.store.deleteEntry(entry.id);
  }

  chooseDate(dateKey: string): void {
    this.selectedDateKey = dateKey;
    this.viewMonthKey = dateKey.slice(0, 7);
  }

  previousMonth(): void {
    this.viewMonthKey = shiftMonth(this.viewMonthKey, -1);
  }

  nextMonth(): void {
    this.viewMonthKey = shiftMonth(this.viewMonthKey, 1);
  }

  async saveSettings(): Promise<void> {
    this.settings = this.cloneSettings(this.settingsDraft);
    this.store.saveSettings(this.settings);
    this.manualPrompt = null;
    this.notificationStatus = await this.notifications.sync(this.settings);
  }

  toggleNotifications(): void {
    this.settingsDraft = {
      ...this.settingsDraft,
      notificationsEnabled: !this.settingsDraft.notificationsEnabled,
    };
  }

  exportData(): void {
    const blob = new Blob([this.store.exportSnapshot()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `moodflow-export-${toDateKey(new Date())}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  clearEntries(): void {
    if (!window.confirm('Clear all saved check-ins?')) {
      return;
    }

    this.store.clearEntries();
    this.entries = [];
  }

  slotsForDate(dateKey: string): PromptSlot[] {
    return buildPromptSlots(dateKey, this.settings, this.entries, this.now);
  }

  optionLabel<T extends string>(options: SelectOption<T>[], id: T): string {
    return options.find((option) => option.id === id)?.label ?? id;
  }

  moodLabel(id: MoodLevel): string {
    return this.optionLabel(this.moodOptions, id);
  }

  entrySummary(entry: MoodEntry): string {
    return [
      this.moodLabel(entry.mood),
      this.optionLabel(this.locationOptions, entry.location),
      this.optionLabel(this.companionOptions, entry.companion),
      this.optionLabel(this.activityOptions, entry.activity),
    ].join(' / ');
  }

  statusLabel(slot: PromptSlot): string {
    if (slot.manual && slot.status === 'open') {
      return 'Manual check-in';
    }

    if (slot.status === 'answered') {
      return 'Answered';
    }

    if (slot.status === 'open') {
      return `Open until ${this.formatTime(slot.expiresAt)}`;
    }

    if (slot.status === 'missed') {
      return 'Missed';
    }

    return `Opens at ${slot.time}`;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  formatDisplayDate(dateKey: string): string {
    return formatDisplayDate(dateKey);
  }

  formatEntryTime(entry: MoodEntry): string {
    return new Date(entry.answeredAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  trackByDate(_index: number, item: CalendarDay): string {
    return item.dateKey;
  }

  trackBySlot(_index: number, item: PromptSlot): string {
    return `${item.dateKey}-${item.period}`;
  }

  trackByEntry(_index: number, item: MoodEntry): string {
    return item.id;
  }

  trackById<T extends { id: string }>(_index: number, item: T): string {
    return item.id;
  }

  private cloneSettings(settings: MoodSettings): MoodSettings {
    return {
      ...settings,
      reminderTimes: {
        ...settings.reminderTimes,
      },
    };
  }

  private roundOne(value: number): number {
    return Math.round(value * 10) / 10;
  }
}
