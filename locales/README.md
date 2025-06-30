# 🌍 Fileboss Çok Dilli Destek / Multi-Language Support

**Fileboss v2.0**'a kendi dilinizi ekleyerek global kullanıcı topluluğuna katkıda bulunun!

## 🚀 Nasıl Katkıda Bulunabilirsiniz?

### 1. Dil Dosyanızı Oluşturun
`example.json` dosyasını kopyalayarak kendi dilinizde bir çeviri oluşturun:

```bash
cp locales/example.json locales/your_language_code.json
```

### 2. Meta Bilgileri Güncelleyin
```json
{
  "meta": {
    "language": "Dilinizin Adı",
    "code": "dil_kodu",
    "flag": "🏳️",
    "rtl": false,
    "completed": 100,
    "contributors": ["Adınız"]
  }
}
```

**Önemli Alanlar:**
- `language`: Dilinizin adı (örn: "Español", "Français", "Deutsch")
- `code`: ISO 639-1 dil kodu (örn: "es", "fr", "de")
- `flag`: Ülke bayrağı emoji (örn: "🇪🇸", "🇫🇷", "🇩🇪")
- `rtl`: Sağdan sola yazılan diller için `true` (Arapça, İbranice vs.)
- `completed`: Çeviri tamamlanma yüzdesi (0-100)
- `contributors`: Katkıda bulunanların listesi

### 3. Çeviriyi Yapın
Tüm metinleri kendi dilinize çevirin. Değişkenleri (`{name}`, `{counter}` vs.) olduğu gibi bırakın.

### 4. Özel Durumlar
- **RTL Diller**: Arapça, İbranice gibi diller için `"rtl": true` yapın
- **Özel Karakterler**: UTF-8 encoding kullanın
- **Tarih Formatları**: Yerel tarih formatlarını göz önünde bulundurun
- **Sayı Formatları**: Yerel sayı formatlarını dikkate alın

## 📋 Mevcut Diller

| Dil | Kod | Bayrak | Tamamlanma | Katkıda Bulunanlar |
|-----|-----|--------|-----------|-------------------|
| Türkçe | tr | 🇹🇷 | 100% | Fileboss Team |
| English | en | 🇺🇸 | 100% | Fileboss Team |

## 🎯 İhtiyaç Duyulan Diller

Aşağıdaki dillere özellikle ihtiyaç duyuyoruz:

- 🇪🇸 **Español** (Spanish)
- 🇫🇷 **Français** (French)
- 🇩🇪 **Deutsch** (German)
- 🇮🇹 **Italiano** (Italian)
- 🇵🇹 **Português** (Portuguese)
- 🇷🇺 **Русский** (Russian)
- 🇯🇵 **日本語** (Japanese)
- 🇰🇷 **한국어** (Korean)
- 🇨🇳 **中文** (Chinese)
- 🇸🇦 **العربية** (Arabic)
- 🇳🇱 **Nederlands** (Dutch)
- 🇸🇪 **Svenska** (Swedish)
- 🇳🇴 **Norsk** (Norwegian)
- 🇩🇰 **Dansk** (Danish)
- 🇫🇮 **Suomi** (Finnish)
- 🇵🇱 **Polski** (Polish)
- 🇭🇺 **Magyar** (Hungarian)
- 🇨🇿 **Čeština** (Czech)
- 🇬🇷 **Ελληνικά** (Greek)
- 🇮🇳 **हिंदी** (Hindi)

## 🔄 Katkı Süreci

### GitHub üzerinden:
1. Repository'yi fork edin
2. Yeni bir branch oluşturun: `git checkout -b add-language-[kod]`
3. Dil dosyanızı ekleyin: `locales/[kod].json`
4. Commit yapın: `git commit -m "Add [Dil] translation"`
5. Pull Request açın

### Doğrudan Katkı:
1. `locales/` klasörüne dil dosyanızı ekleyin
2. Bu README'yi güncelleyin (dil tablosuna ekleyin)
3. Pull request açın

## ✅ Çeviri Kuralları

### DO ✅
- Kültürel uygunluğu gözetin
- Kısa ve anlaşılır çeviriler yapın
- Teknik terimleri tutarlı çevirin
- Yerel formatları kullanın
- Değişkenleri olduğu gibi bırakın

### DON'T ❌
- Direkt çeviri yapmayın (Google Translate vs.)
- Değişkenleri (`{name}`, `{ext}`) değiştirmeyin
- JSON formatını bozmayın
- Kültürel olarak uygunsuz ifadeler kullanmayın

## 🛠️ Test Etme

Çevirinizi test etmek için:

1. Dil dosyanızı `locales/` klasörüne ekleyin
2. Fileboss'u çalıştırın
3. Dil seçiciyi kontrol edin
4. Tüm arayüz elementlerini test edin

## 📞 İletişim

Sorularınız için:
- **GitHub Issues**: Teknik sorular ve hatalar
- **Discussions**: Genel tartışmalar
- **Pull Requests**: Doğrudan katkılar

## 🏆 Katkıda Bulunanlar

Tüm çevirmenler README'ye eklenir ve proje içinde tanınır!

---

**Teşekkürler!** 🙏 Fileboss'u global bir araç haline getirmemize yardımcı olduğunuz için!

---

## 🌐 How to Contribute (English)

Help make Fileboss v2.0 accessible to users worldwide by adding your language!

### Quick Start:
1. Copy `example.json` to `your_language_code.json`
2. Update meta information with your language details
3. Translate all text strings
4. Test your translation
5. Submit a pull request

**Need help?** Check the detailed instructions above or open an issue!

### Translation Guidelines:
- Keep technical terms consistent
- Use appropriate cultural context
- Maintain JSON format
- Don't modify variables like `{name}`, `{ext}`
- Test thoroughly before submitting

Thank you for helping make Fileboss accessible to everyone! 🌍 