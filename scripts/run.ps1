Write-Host "🚀 Fileboss Başlatıcı" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green

# Proje klasörüne git
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Split-Path -Parent $scriptPath
Set-Location $projectPath

Write-Host "📂 Proje klasörü: $projectPath" -ForegroundColor Cyan

# Go sürümünü kontrol et
try {
    $goVersion = go version
    Write-Host "✅ Go bulundu: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go bulunamadı! Lütfen Go'yu yükleyin: https://golang.org" -ForegroundColor Red
    Read-Host "Devam etmek için Enter tuşuna basın"
    exit 1
}

# Web klasörünün varlığını kontrol et
if (!(Test-Path "web/index.html")) {
    Write-Host "❌ Web dosyaları bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Uygulama başlatılıyor..." -ForegroundColor Yellow

# Uygulamayı çalıştır
try {
    Write-Host "🌐 Tarayıcınızda http://localhost:8080 açılacak" -ForegroundColor Cyan
    Write-Host "⏹️  Durdurmak için Ctrl+C basın" -ForegroundColor Yellow
    Write-Host ""
    
    go run cmd/main.go
} catch {
    Write-Host "❌ Uygulama başlatılamadı: $_" -ForegroundColor Red
    Write-Host "Manuel olarak şunu deneyin: go run cmd/main.go" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "👋 Fileboss kapatıldı" -ForegroundColor Green
Read-Host "Çıkmak için Enter tuşuna basın" 