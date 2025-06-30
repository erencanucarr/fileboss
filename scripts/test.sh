#!/bin/bash

echo "🚀 Fileboss Test Script"
echo "======================="

# Test klasörü oluştur
mkdir -p test_files
cd test_files

# Test dosyaları oluştur
echo "Test 1" > file1.txt
echo "Test 2" > file2.txt
echo "Test 3" > file3.txt
echo "Different" > file4.doc

echo "✅ Test dosyaları oluşturuldu:"
ls -la

echo ""
echo "🎯 Test senaryosu:"
echo "- 3 adet .txt dosyası oluşturuldu"
echo "- 1 adet .doc dosyası oluşturuldu (değiştirilmeyecek)"
echo ""
echo "Uygulama ile test_files klasörünü seçin ve .txt dosyalarını .md'ye çevirin"

cd .. 