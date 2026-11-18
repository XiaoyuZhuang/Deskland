@echo off
setlocal
set "DESKLAND_PROFILE_DIR=%LOCALAPPDATA%\DesklandForestLocal"
if not exist "%~dp0host\bin\Deskland.exe" (
  echo Please build the Windows host with host\build.ps1. You can also open prototype\forest.html.
  pause
  exit /b 1
)
if not exist "%DESKLAND_PROFILE_DIR%\" mkdir "%DESKLAND_PROFILE_DIR%"
if not exist "%DESKLAND_PROFILE_DIR%\settings.json" (
  >"%DESKLAND_PROFILE_DIR%\settings.json" echo {"version":1,"theme":"forest","lang":"auto","params":{}}
)
start "" "%~dp0host\bin\Deskland.exe"
