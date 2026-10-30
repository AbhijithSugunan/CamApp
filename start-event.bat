@echo off
REM Starts the Character Booth locally and opens it full screen (kiosk) with camera auto-allowed.
REM Exit kiosk with Alt+F4.
cd /d "%~dp0"

if not exist "public\models\face_landmarker.task" (
  echo Assets missing - running setup (needs internet once^)...
  call npm run setup-assets || goto :fail
)
if not exist "dist\index.html" (
  call npm run build || goto :fail
)

start "CamApp server" cmd /k npm run start
timeout /t 3 /nobreak >nul

set URL=http://localhost:4173
set PROFILE=%TEMP%\camapp-kiosk-profile
set FLAGS=--kiosk --use-fake-ui-for-media-stream --autoplay-policy=no-user-gesture-required --disable-session-crashed-bubble --noerrdialogs --no-first-run --user-data-dir="%PROFILE%"

set CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if not exist "%CHROME%" set CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe
if exist "%CHROME%" (
  start "" "%CHROME%" %FLAGS% %URL%
  goto :eof
)

set EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe
if not exist "%EDGE%" set EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe
if exist "%EDGE%" (
  start "" "%EDGE%" %FLAGS% %URL%
  goto :eof
)

echo Chrome/Edge not found - open %URL% manually and press F for full screen.
start "" %URL%
goto :eof

:fail
echo Setup failed.
pause
