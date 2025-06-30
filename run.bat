@echo off
title Fileboss - Dosya Uzantısı Değiştirici
color 0A

echo.
echo  ████████ ██ ██      ████████ ██████   ██████  ███████ ███████ 
echo  ██       ██ ██      ██       ██   ██ ██    ██ ██      ██      
echo  █████    ██ ██      █████    ██████  ██    ██ ███████ ███████ 
echo  ██       ██ ██      ██       ██   ██ ██    ██      ██      ██ 
echo  ██       ██ ███████ ████████ ██████   ██████  ███████ ███████ 
echo.
echo  ========================================================
echo   Dosya Uzantısı Değiştirici - Hızlı Başlatıcı
echo  ========================================================
echo.

:: Go kontrolü
go version >nul 2>&1
if errorlevel 1 (
    echo [HATA] Go bulunamadı! 
    echo Lütfen Go'yu yükleyin: https://golang.org
    pause
    exit /b 1
)

echo [OK] Go bulundu
echo [INFO] Uygulama başlatılıyor...
echo [INFO] Tarayıcınızda http://localhost:8080 açılacak
echo [INFO] Durdurmak için Ctrl+C basın
echo.

:: Uygulamayı çalıştır
go run cmd/main.go

echo.
echo [INFO] Fileboss kapatıldı
pause 