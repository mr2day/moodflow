# Moodflow

Moodflow is a local-first mood tracking app. It asks two quick check-ins per day, stores the answers locally, and shows a calendar, monthly chart, average mood score, and deterministic insights.

The product and implementation rules live in [docs/app-manifest.md](docs/app-manifest.md).

## Stack

- Angular
- Capacitor
- Capacitor Local Notifications
- Local browser storage for the first development adapter
- Android shell generated under `android/`

## Development

```bash
npm install
npm start
```

The web app runs at `http://localhost:4200/`.

## Build

```bash
npm run build
```

## Android

Sync web assets and native plugins:

```bash
npm run cap:sync
```

Open the Android project:

```bash
npm run android:open
```

Native notifications are scheduled only inside a Capacitor native build. The browser preview saves the notification preference but does not emulate Android reminder delivery.

Building the Android APK requires a local JDK and `JAVA_HOME` configured for Gradle.

On Windows, the helper scripts in `scripts/` avoid multiline terminal setup:

```bat
scripts\setup-android-env.cmd
scripts\build-debug-apk.cmd
```

`setup-android-env.cmd` permanently sets `JAVA_HOME` and `ANDROID_HOME` for the current Windows user. `build-debug-apk.cmd` builds the tester APK using Android Studio's bundled JDK and prints the APK path when it finishes.

## Current MVP Features

- Today view with two scheduled check-in slots
- Four fixed questions with tap answers
- Optional note capped at 20 words
- Local persistence
- Calendar month view with missed, partial, and complete states
- Selected-day history
- Monthly average, previous-month comparison, chart, best day, and context insights
- Reminder time settings
- Native notification scheduling service
- JSON export and local data clear
