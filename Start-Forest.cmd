@echo off
setlocal
if not exist "%~dp0host\bin\Sylvaframe.exe" (
  echo Build Sylvaframe with host\build.ps1, or open prototype\forest.html for the browser demo.
  pause
  exit /b 1
)
start "" "%~dp0host\bin\Sylvaframe.exe"
