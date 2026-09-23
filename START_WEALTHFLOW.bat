@echo off
chcp 65001 > nul
title WealthFlow Pro Server (Port 3000)
echo ========================================================
echo   🚀 กำลังเริ่มต้นระบบ WealthFlow Pro (http://localhost:3000)...
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] กำลัง Build หน้าเว็บล่าสุด (npm run build:web)...
call npm run build:web

echo.
echo [2/2] กำลังเปิด Express Server บน http://localhost:3000...
start "WealthFlow Server" cmd /k "node sous.js"

timeout /t 2 > nul

echo.
echo ✨ เปิดหน้าเว็บ WealthFlow ที่ http://localhost:3000 เรียบร้อยแล้ว!
start http://localhost:3000

exit
