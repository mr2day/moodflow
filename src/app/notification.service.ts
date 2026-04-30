import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { MoodSettings, PromptPeriod } from './moodflow.types';

const NOTIFICATION_IDS: Record<PromptPeriod, number> = {
  midday: 1200,
  evening: 2000,
};

@Injectable({ providedIn: 'root' })
export class MoodflowNotifications {
  async sync(settings: MoodSettings): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return settings.notificationsEnabled
        ? 'Notification preference saved. Native reminders run inside the Android app.'
        : 'Notifications are off.';
    }

    await LocalNotifications.cancel({
      notifications: Object.values(NOTIFICATION_IDS).map((id) => ({ id })),
    });

    if (!settings.notificationsEnabled) {
      return 'Notifications are off.';
    }

    const permission = await LocalNotifications.requestPermissions();

    if (permission.display !== 'granted') {
      return 'Notification permission was not granted.';
    }

    await LocalNotifications.schedule({
      notifications: (Object.keys(settings.reminderTimes) as PromptPeriod[]).map((period) => {
        const [hour, minute] = settings.reminderTimes[period].split(':').map(Number);

        return {
          id: NOTIFICATION_IDS[period],
          title: 'Moodflow',
          body: 'How are you feeling right now?',
          schedule: {
            on: { hour, minute, second: 0 },
            repeats: true,
            allowWhileIdle: true,
          },
          extra: {
            period,
            route: 'today',
          },
        };
      }),
    });

    return 'Daily reminders are scheduled.';
  }
}
