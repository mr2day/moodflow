@echo off
setlocal

cd /d "%~dp0.."

set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo ERROR: Android Studio bundled JDK was not found.
  echo Expected: %JAVA_HOME%\bin\java.exe
  echo.
  echo Install Android Studio or update this script with your JDK path.
  if not "%MOODFLOW_NO_PAUSE%"=="1" pause
  exit /b 1
)

if not exist "%ANDROID_HOME%" (
  echo ERROR: Android SDK was not found.
  echo Expected: %ANDROID_HOME%
  echo.
  echo Open Android Studio, install the Android SDK, then run this again.
  if not "%MOODFLOW_NO_PAUSE%"=="1" pause
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo Using JAVA_HOME=%JAVA_HOME%
echo Using ANDROID_HOME=%ANDROID_HOME%
echo.

call npm run cap:sync
if errorlevel 1 (
  echo.
  echo ERROR: Capacitor sync failed.
  if not "%MOODFLOW_NO_PAUSE%"=="1" pause
  exit /b 1
)

cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  echo.
  echo ERROR: Android debug build failed.
  if not "%MOODFLOW_NO_PAUSE%"=="1" pause
  exit /b 1
)

echo.
echo APK ready:
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
echo.
if not "%MOODFLOW_NO_PAUSE%"=="1" pause
