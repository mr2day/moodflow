# Moodflow App Manifest

## Purpose

Moodflow is a small local-first mood tracking app that helps a user notice patterns in when and where they feel better or worse. The app lets the user answer the same four simple questions whenever they want, sends optional reminders twice per day, and turns the month into a readable calendar, chart, average mood score, and deterministic insights.

The product promise is: discern your feel-good patterns.

## MVP Scope

Moodflow MVP is an Angular application packaged with Capacitor for Android. The first implementation is local-only and runs in the browser for development. Native Android packaging is included through Capacitor so notification behavior can be wired into the installed app.

The MVP must not require a backend, real account system, or LLM.

## Product Rules

- The user can record a check-in at any time.
- The app may send two reminder notifications per day.
- Default reminder times are 12:00 and 20:00.
- The user may change both reminder times.
- Reminder times are only for notifications. They never restrict data entry.
- There is no answer window, missed prompt state, or replacement-by-slot behavior in the MVP.
- Every saved check-in is a separate entry and is included in stats.
- Notes are optional and capped at 20 words.
- Monthly summaries can be viewed at any time for any month that has data.
- The "last day of the month" requirement means the monthly summary becomes the natural report for the completed month, not that stats are blocked until the last day.

## Questions And Answers

1. How are you feeling right now?
   - Great, score 5
   - Good, score 4
   - Reasonable, score 3
   - Low, score 1

2. Where are you?
   - Home
   - Work
   - Out

3. Who are you with?
   - Alone
   - Partner
   - Friends
   - Family
   - Colleagues

4. What are you doing?
   - Working
   - Relaxing
   - Chores
   - Socializing
   - Hobbies

The original document listed Reasonable as score 2. The MVP uses score 3 because it preserves a more intuitive scale between Good and Low.

## Navigation

The app has four primary views:

- Today: answer form and today's reminder schedule.
- Calendar: month grid, recorded-day markers, selected-day details.
- Stats: monthly average, previous-month comparison, chart, and insights.
- Settings: reminder times, notification toggle, local profile email, export, and clear data.

## Visual Direction

Moodflow should feel warm, emotionally comfortable, and calm. Use a warm palette based on peach, coral, amber, and soft cream, with restrained natural green only as a secondary balancing accent. Avoid cold blue/teal-dominant UI.

## Data Model

MoodSettings:

- reminderTimes.midday: HH:mm
- reminderTimes.evening: HH:mm
- notificationsEnabled: boolean
- profileEmail: string, optional local label only

MoodEntry:

- id: stable unique id
- dateKey: YYYY-MM-DD in local time
- answeredAt: ISO timestamp
- mood: great, good, reasonable, or low
- location: home, work, or out
- companion: alone, partner, friends, family, or colleagues
- activity: working, relaxing, chores, socializing, or hobbies
- note: optional text

Reminder notifications are generated from settings. Mood entries are not tied to reminder slots.

## Analytics

All MVP insights are deterministic.

Monthly average:

- Average the mood scores of answered check-ins in the selected month.
- Round to one decimal place.

Previous-month comparison:

- Compare the selected month average to the previous calendar month average.
- Show positive, negative, or neutral change when both months have data.

Best day:

- Group entries by date.
- Average each date.
- Pick the highest average. Ties resolve to the earlier date.

Best and worst context:

- Evaluate individual context dimensions: location, companion, activity.
- Group entries by each option.
- Compute average score per option.
- Pick highest and lowest average groups.
- Require at least one entry in MVP. A future version can require a minimum sample size.

## Technical Stack

- Angular for app UI.
- Capacitor for Android packaging.
- Capacitor Local Notifications for installed-app reminders.
- Browser local storage for the first development adapter.
- A future mobile beta should move persistence to SQLite through a Capacitor SQLite plugin before relying on the app for long-term personal data.

## Notification Behavior

When notifications are enabled in a native build:

- Request notification permission.
- Schedule two repeating local notifications using the configured times.
- Each notification opens the app to the Today view.
- Notifications are reminders only. The app must allow recording before, during, and after reminder times.

Browser preview builds can save the notification setting but cannot guarantee native notification behavior.

## Future Extensions

- SQLite storage adapter.
- Cloud sync and email login.
- iOS packaging.
- Custom questions and answer sets.
- Optional AI-written monthly reflection based only on the deterministic stats and user notes.
- Backup import flow.
