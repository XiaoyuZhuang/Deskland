@echo off
setlocal
set "DESKLAND_PROFILE_DIR=%LOCALAPPDATA%\DesklandForestLocal"
if exist "%~dp0host\bin\Deskland.exe" "%~dp0host\bin\Deskland.exe" --exit
