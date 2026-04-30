import { Injectable } from '@angular/core';
import { DEFAULT_SETTINGS, MoodEntry, MoodSettings } from './moodflow.types';

const SETTINGS_KEY = 'moodflow.settings.v1';
const ENTRIES_KEY = 'moodflow.entries.v1';

@Injectable({ providedIn: 'root' })
export class MoodflowStore {
  loadSettings(): MoodSettings {
    const saved = this.readJson<Partial<MoodSettings>>(SETTINGS_KEY);

    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      reminderTimes: {
        ...DEFAULT_SETTINGS.reminderTimes,
        ...saved?.reminderTimes,
      },
      profileEmail: saved?.profileEmail ?? DEFAULT_SETTINGS.profileEmail,
      notificationsEnabled: saved?.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
    };
  }

  saveSettings(settings: MoodSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  loadEntries(): MoodEntry[] {
    return this.readJson<MoodEntry[]>(ENTRIES_KEY) ?? [];
  }

  saveEntry(entry: MoodEntry): MoodEntry[] {
    const entries = this.loadEntries();
    const next = [...entries, entry].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(next));
    return next;
  }

  deleteEntry(id: string): MoodEntry[] {
    const next = this.loadEntries().filter((entry) => entry.id !== id);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(next));
    return next;
  }

  clearEntries(): void {
    localStorage.removeItem(ENTRIES_KEY);
  }

  exportSnapshot(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: this.loadSettings(),
        entries: this.loadEntries(),
      },
      null,
      2,
    );
  }

  createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private readJson<T>(key: string): T | null {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}
