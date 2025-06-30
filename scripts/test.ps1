Write-Host "🚀 Fileboss Test Script" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

# Test klasörü oluştur
$testPath = "test_files"
if (!(Test-Path $testPath)) {
    New-Item -ItemType Directory -Path $testPath
}

Set-Location $testPath

# Test dosyaları oluştur
"Test 1" | Out-File -FilePath "file1.txt" -Encoding UTF8
"Test 2" | Out-File -FilePath "file2.txt" -Encoding UTF8
"Test 3" | Out-File -FilePath "file3.txt" -Encoding UTF8
"Different" | Out-File -FilePath "file4.doc" -Encoding UTF8

Write-Host "✅ Test dosyaları oluşturuldu:" -ForegroundColor Green
Get-ChildItem | Format-Table Name, Length -AutoSize

Write-Host ""
Write-Host "🎯 Test senaryosu:" -ForegroundColor Yellow
Write-Host "- 3 adet .txt dosyası oluşturuldu" -ForegroundColor White
Write-Host "- 1 adet .doc dosyası oluşturuldu (değiştirilmeyecek)" -ForegroundColor White
Write-Host ""
Write-Host "Uygulama ile test_files klasörünü seçin ve .txt dosyalarını .md'ye çevirin" -ForegroundColor Cyan
Write-Host "Test klasörü tam yolu: $(Get-Location)" -ForegroundColor Magenta

Set-Location .. 