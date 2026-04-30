@echo off
setlocal

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-android-env.ps1"

echo.
if not "%MOODFLOW_NO_PAUSE%"=="1" pause
