@echo off
REM ---------------------------------------------------------------------------
REM  Build the teaser films (D-056, D-067). Double-click this file.
REM
REM  Source films go here, named exactly like this:
REM      ops\teaser-src\NBIT1.mp4   Teaser 1 (Rathaus)
REM      ops\teaser-src\NBG1.mp4    Teaser 2 (general)
REM      ops\teaser-src\NB3.mp4     Teaser 3
REM
REM  It asks for a 4-digit code per film. Press Enter without typing to SKIP a
REM  film: adding one new film needs only that film and its code, and the films
REM  already on the site stay exactly as they are. The codes are never written
REM  to disk or into the repo.
REM ---------------------------------------------------------------------------
setlocal
cd /d "%~dp0\.."

echo.
echo   NexBridge-IT - teaser films
echo   ============================
echo.

if not exist "ops\teaser-src" mkdir "ops\teaser-src"

echo   Type a 4-digit code for each film you want to build.
echo   Press Enter without typing to SKIP a film - it stays as it is.
echo   The codes are not saved anywhere - write them down.
echo.

set "CODE1="
set "CODE2="
set "CODE3="
set /p "CODE1=  Teaser 1 (Rathaus, NBIT1) ...: "
set /p "CODE2=  Teaser 2 (general, NBG1) ....: "
set /p "CODE3=  Teaser 3 (NB3) ..............: "
echo.

if not defined CODE1 if not defined CODE2 if not defined CODE3 (
  echo   No code typed, so there is nothing to build.
  echo.
  pause
  exit /b 1
)

REM Check only the films that are being built.
set "MISSING="
if defined CODE1 call :need NBIT1 "Teaser 1"
if defined CODE2 call :need NBG1 "Teaser 2"
if defined CODE3 call :need NB3 "Teaser 3"
if defined MISSING (
  echo.
  echo   Put the missing film^(s^) into ops\teaser-src and run this again.
  echo.
  pause
  exit /b 1
)

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
set "TEASER_3_CODE=%CODE3%"
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
echo       git commit -m "feat: teaser films"
echo       git push
echo.
if defined CODE1 echo   Teaser 1 code: %CODE1%
if defined CODE2 echo   Teaser 2 code: %CODE2%
if defined CODE3 echo   Teaser 3 code: %CODE3%
echo   ^(Write these down. Nothing stored them.^)
echo   ============================================================
echo.
pause
exit /b 0

REM :need <source name> <label> - flags MISSING when no file of that name exists.
:need
dir /b "ops\teaser-src\%~1.*" >nul 2>&1
if errorlevel 1 (
  echo   MISSING: ops\teaser-src\%~1.mp4  ^(%~2^)
  set "MISSING=1"
)
exit /b 0
