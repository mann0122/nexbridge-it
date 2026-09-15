@echo off
REM ---------------------------------------------------------------------------
REM  Build the teaser films (D-049). Double-click this file.
REM
REM  Before running, put the two source films here:
REM      ops\teaser-src\NBIT1.mp4   (Rathaus)
REM      ops\teaser-src\NBG1.mp4    (general)
REM
REM  It asks for the two 4-digit codes, builds everything, and tells you what
REM  to commit. The codes are never written to disk or into the repo.
REM ---------------------------------------------------------------------------
setlocal
cd /d "%~dp0\.."

echo.
echo   NexBridge-IT - teaser films
echo   ============================
echo.

if not exist "ops\teaser-src" (
  echo   Creating ops\teaser-src ...
  mkdir "ops\teaser-src"
  echo.
  echo   Now put your two films in that folder and run this again:
  echo.
  echo       ops\teaser-src\NBIT1.mp4   ^(Rathaus^)
  echo       ops\teaser-src\NBG1.mp4    ^(general^)
  echo.
  pause
  exit /b 1
)

REM The build script accepts .mp4 .mov .m4v .webm .mkv .avi — just check something is there.
dir /b "ops\teaser-src\NBIT1.*" >nul 2>&1
if errorlevel 1 (
  echo   MISSING: ops\teaser-src\NBIT1.*  ^(the Rathaus film^)
  echo   Put it there and run this again.
  echo.
  pause
  exit /b 1
)
dir /b "ops\teaser-src\NBG1.*" >nul 2>&1
if errorlevel 1 (
  echo   MISSING: ops\teaser-src\NBG1.*  ^(the general film^)
  echo   Put it there and run this again.
  echo.
  pause
  exit /b 1
)

echo   Both films found.
echo.
echo   Choose a 4-digit code for each. These are what you give people.
echo   They are not saved anywhere - write them down.
echo.

set /p CODE1=  Code for Teaser 1 (Rathaus)....:
set /p CODE2=  Code for Teaser 2 (general)....:
echo.

echo   Installing dependencies (first run only, can take a minute) ...
call npm install --silent
if errorlevel 1 (
  echo.
  echo   npm install failed. Is Node.js installed?  https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo.
set "TEASER_1_CODE=%CODE1%"
set "TEASER_2_CODE=%CODE2%"
call npm run teaser:assets
if errorlevel 1 (
  echo.
  echo   Build failed - see the message above.
  echo.
  pause
  exit /b 1
)

echo.
echo   ============================================================
echo   Done. Now publish it:
echo.
echo       git add website/public/teaser
echo       git commit -m "feat: add the two teaser films"
echo       git push
echo.
echo   Teaser 1 code: %CODE1%
echo   Teaser 2 code: %CODE2%
echo   ^(Write these down. Nothing stored them.^)
echo   ============================================================
echo.
pause
