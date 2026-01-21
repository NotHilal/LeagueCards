@echo off
echo ========================================
echo Stopping League Cards Game Servers
echo ========================================
echo.

echo Killing all Node.js processes...
taskkill //F //IM node.exe 2>nul

if %errorlevel% equ 0 (
    echo Successfully stopped all servers!
) else (
    echo No servers were running.
)

echo.
echo ========================================
echo All servers stopped.
echo ========================================
echo.
pause
