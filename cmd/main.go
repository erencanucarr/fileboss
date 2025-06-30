package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"syscall"
	"time"
)

// FileInfo dosya bilgilerini tutar
type FileInfo struct {
	Name      string    `json:"name"`
	Path      string    `json:"path"`
	Extension string    `json:"extension"`
	Size      int64     `json:"size"`
	ModTime   time.Time `json:"modTime"`
	IsDir     bool      `json:"isDir"`
}

// FilterOptions filtreleme seçenekleri
type FilterOptions struct {
	MinSize       int64  `json:"minSize"`
	MaxSize       int64  `json:"maxSize"`
	DateFrom      string `json:"dateFrom"`
	DateTo        string `json:"dateTo"`
	NamePattern   string `json:"namePattern"`
	UseRegex      bool   `json:"useRegex"`
	IncludeHidden bool   `json:"includeHidden"`
	SortBy        string `json:"sortBy"` // name, size, date
	SortDesc      bool   `json:"sortDesc"`
}

// RenameRequest dosya adı değiştirme isteği
type RenameRequest struct {
	FolderPath        string        `json:"folderPath"`
	OldExtension      string        `json:"oldExtension"`
	NewExtension      string        `json:"newExtension"`
	IncludeSubfolders bool          `json:"includeSubfolders"`
	CreateBackup      bool          `json:"createBackup"`
	CaseSensitive     bool          `json:"caseSensitive"`
	UseRegex          bool          `json:"useRegex"`
	RegexPattern      string        `json:"regexPattern"`
	ReplacePattern    string        `json:"replacePattern"`
	NamingTemplate    string        `json:"namingTemplate"`
	StartIndex        int           `json:"startIndex"`
	Filters           FilterOptions `json:"filters"`
}

// RenameResponse dosya adı değiştirme yanıtı
type RenameResponse struct {
	Success        bool        `json:"success"`
	Message        string      `json:"message"`
	ProcessedFiles []FileInfo  `json:"processedFiles"`
	Errors         []string    `json:"errors"`
	BackupPath     string      `json:"backupPath"`
	Stats          RenameStats `json:"stats"`
}

// RenameStats işlem istatistikleri
type RenameStats struct {
	TotalFiles     int     `json:"totalFiles"`
	ProcessedFiles int     `json:"processedFiles"`
	SkippedFiles   int     `json:"skippedFiles"`
	ErrorFiles     int     `json:"errorFiles"`
	TotalSize      int64   `json:"totalSize"`
	ProcessTime    float64 `json:"processTime"`
}

// Template değişkenleri
type TemplateVars struct {
	Index     int
	Name      string
	Extension string
	Size      int64
	Date      time.Time
	Counter   int
}

// API handler'ları
func setupAPI() *http.ServeMux {
	mux := http.NewServeMux()

	// CORS middleware
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			if r.Method == "OPTIONS" {
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// Dosya listesi endpoint'i
	mux.Handle("/api/files", corsMiddleware(http.HandlerFunc(handleGetFiles)))

	// Dosya adı değiştirme endpoint'i
	mux.Handle("/api/rename", corsMiddleware(http.HandlerFunc(handleRenameFiles)))

	// Önizleme endpoint'i
	mux.Handle("/api/preview", corsMiddleware(http.HandlerFunc(handlePreview)))

	// Template test endpoint'i
	mux.Handle("/api/template-test", corsMiddleware(http.HandlerFunc(handleTemplateTest)))

	// Dil listesi endpoint'i
	mux.Handle("/api/languages", corsMiddleware(http.HandlerFunc(handleGetLanguages)))

	// Dil dosyası endpoint'i
	mux.Handle("/api/language/", corsMiddleware(http.HandlerFunc(handleGetLanguage)))

	// Static dosyalar
	mux.Handle("/", corsMiddleware(http.FileServer(http.Dir("./web/"))))

	return mux
}

func handleGetFiles(w http.ResponseWriter, r *http.Request) {
	log.Printf("📂 Files API called: %s", r.URL.String())

	folderPath := r.URL.Query().Get("path")
	if folderPath == "" {
		log.Printf("❌ No folder path provided")
		http.Error(w, "Klasör yolu gerekli", http.StatusBadRequest)
		return
	}

	log.Printf("📁 Reading folder: %s", folderPath)

	// Filter options
	var filters FilterOptions
	if filterJSON := r.URL.Query().Get("filters"); filterJSON != "" {
		if err := json.Unmarshal([]byte(filterJSON), &filters); err != nil {
			log.Printf("❌ Filter parsing error: %v", err)
			http.Error(w, "Geçersiz filtre: "+err.Error(), http.StatusBadRequest)
			return
		}
	}

	files, err := getFilesInDirectory(folderPath, filters)
	if err != nil {
		log.Printf("❌ Directory read error: %v", err)
		// Dosya bulunamadı hatası için 404, diğerleri için 500
		if strings.Contains(err.Error(), "bulamıyor") || strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "no such file") {
			http.Error(w, "Klasör bulunamadı: "+folderPath, http.StatusNotFound)
		} else {
			http.Error(w, "Klasör okunamadı: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	log.Printf("✅ Found %d files", len(files))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

func handlePreview(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Sadece POST metodu desteklenir", http.StatusMethodNotAllowed)
		return
	}

	var req RenameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Geçersiz JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	preview := generatePreview(req)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(preview)
}

func handleTemplateTest(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Sadece POST metodu desteklenir", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Template string     `json:"template"`
		Files    []FileInfo `json:"files"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Geçersiz JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	result := testTemplate(req.Template, req.Files)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleGetLanguages(w http.ResponseWriter, r *http.Request) {
	log.Printf("🌍 Languages API called")

	if r.Method != "GET" {
		log.Printf("❌ Wrong method: %s", r.Method)
		http.Error(w, "Sadece GET metodu desteklenir", http.StatusMethodNotAllowed)
		return
	}

	languages, err := getAvailableLanguages()
	if err != nil {
		log.Printf("❌ Language loading error: %v", err)
		http.Error(w, "Dil listesi alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("✅ Returning %d languages", len(languages))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(languages)
}

func handleGetLanguage(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔤 Language API called: %s", r.URL.Path)

	if r.Method != "GET" {
		log.Printf("❌ Wrong method: %s", r.Method)
		http.Error(w, "Sadece GET metodu desteklenir", http.StatusMethodNotAllowed)
		return
	}

	// URL'den dil kodunu al: /api/language/tr
	langCode := strings.TrimPrefix(r.URL.Path, "/api/language/")
	if langCode == "" {
		log.Printf("❌ No language code provided")
		http.Error(w, "Dil kodu gerekli", http.StatusBadRequest)
		return
	}

	log.Printf("📖 Loading language: %s", langCode)
	langData, err := getLanguageData(langCode)
	if err != nil {
		log.Printf("❌ Language data error: %v", err)
		http.Error(w, "Dil dosyası alınamadı: "+err.Error(), http.StatusNotFound)
		return
	}

	log.Printf("✅ Language %s loaded successfully", langCode)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(langData)
}

func handleRenameFiles(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Sadece POST metodu desteklenir", http.StatusMethodNotAllowed)
		return
	}

	var req RenameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Geçersiz JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	response := renameFiles(req)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getFilesInDirectory(dirPath string, filters FilterOptions) ([]FileInfo, error) {
	var files []FileInfo

	walkFunc := func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Gizli dosyaları atla (isteğe bağlı)
		if !filters.IncludeHidden && strings.HasPrefix(info.Name(), ".") {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		fileInfo := FileInfo{
			Name:      info.Name(),
			Path:      path,
			Extension: filepath.Ext(info.Name()),
			Size:      info.Size(),
			ModTime:   info.ModTime(),
			IsDir:     info.IsDir(),
		}

		// Filtreleri uygula
		if applyFilters(fileInfo, filters) {
			files = append(files, fileInfo)
		}

		return nil
	}

	err := filepath.Walk(dirPath, walkFunc)
	if err != nil {
		return nil, err
	}

	// Sıralama
	sortFiles(files, filters.SortBy, filters.SortDesc)

	return files, nil
}

func applyFilters(file FileInfo, filters FilterOptions) bool {
	// Klasörleri atla (dosya işlemleri için)
	if file.IsDir {
		return false
	}

	// Boyut filtresi
	if filters.MinSize > 0 && file.Size < filters.MinSize {
		return false
	}
	if filters.MaxSize > 0 && file.Size > filters.MaxSize {
		return false
	}

	// Tarih filtresi
	if filters.DateFrom != "" {
		if dateFrom, err := time.Parse("2006-01-02", filters.DateFrom); err == nil {
			if file.ModTime.Before(dateFrom) {
				return false
			}
		}
	}
	if filters.DateTo != "" {
		if dateTo, err := time.Parse("2006-01-02", filters.DateTo); err == nil {
			if file.ModTime.After(dateTo.Add(24 * time.Hour)) {
				return false
			}
		}
	}

	// İsim pattern filtresi
	if filters.NamePattern != "" {
		if filters.UseRegex {
			if matched, err := regexp.MatchString(filters.NamePattern, file.Name); err != nil || !matched {
				return false
			}
		} else {
			// Wildcard pattern (* ve ?)
			if matched, err := filepath.Match(filters.NamePattern, file.Name); err != nil || !matched {
				return false
			}
		}
	}

	return true
}

func sortFiles(files []FileInfo, sortBy string, desc bool) {
	switch sortBy {
	case "name":
		sort.Slice(files, func(i, j int) bool {
			if desc {
				return files[i].Name > files[j].Name
			}
			return files[i].Name < files[j].Name
		})
	case "size":
		sort.Slice(files, func(i, j int) bool {
			if desc {
				return files[i].Size > files[j].Size
			}
			return files[i].Size < files[j].Size
		})
	case "date":
		sort.Slice(files, func(i, j int) bool {
			if desc {
				return files[i].ModTime.After(files[j].ModTime)
			}
			return files[i].ModTime.Before(files[j].ModTime)
		})
	}
}

func generatePreview(req RenameRequest) map[string]interface{} {
	files, err := getFilesInDirectory(req.FolderPath, req.Filters)
	if err != nil {
		return map[string]interface{}{
			"error": "Klasör okunamadı: " + err.Error(),
		}
	}

	var matchingFiles []FileInfo
	var previews []map[string]string

	counter := req.StartIndex

	for _, file := range files {
		if matchesRenameCondition(file, req) {
			newName := generateNewName(file, req, counter)
			matchingFiles = append(matchingFiles, file)
			previews = append(previews, map[string]string{
				"oldName": file.Name,
				"newName": newName,
				"path":    file.Path,
			})
			counter++
		}
	}

	return map[string]interface{}{
		"files":    matchingFiles,
		"previews": previews,
		"count":    len(matchingFiles),
		"stats": map[string]interface{}{
			"totalFiles": len(files),
			"matching":   len(matchingFiles),
			"totalSize":  calculateTotalSize(matchingFiles),
		},
	}
}

func testTemplate(template string, files []FileInfo) map[string]interface{} {
	var results []map[string]string

	for i, file := range files {
		newName := applyTemplate(template, TemplateVars{
			Index:     i + 1,
			Name:      strings.TrimSuffix(file.Name, file.Extension),
			Extension: file.Extension,
			Size:      file.Size,
			Date:      file.ModTime,
			Counter:   i + 1,
		})

		results = append(results, map[string]string{
			"oldName": file.Name,
			"newName": newName,
		})
	}

	return map[string]interface{}{
		"results": results,
		"count":   len(results),
	}
}

func renameFiles(req RenameRequest) RenameResponse {
	startTime := time.Now()

	response := RenameResponse{
		Success:        true,
		ProcessedFiles: []FileInfo{},
		Errors:         []string{},
		Stats: RenameStats{
			ProcessedFiles: 0,
			ErrorFiles:     0,
			SkippedFiles:   0,
		},
	}

	// Backup oluştur
	var backupPath string
	if req.CreateBackup {
		backupPath = createBackup(req.FolderPath)
		response.BackupPath = backupPath
	}

	// Dosyaları listele
	files, err := getFilesInDirectory(req.FolderPath, req.Filters)
	if err != nil {
		response.Success = false
		response.Message = "Klasör okunamadı: " + err.Error()
		return response
	}

	response.Stats.TotalFiles = len(files)
	response.Stats.TotalSize = calculateTotalSize(files)

	counter := req.StartIndex

	for _, file := range files {
		if matchesRenameCondition(file, req) {
			oldPath := file.Path
			newName := generateNewName(file, req, counter)
			newPath := filepath.Join(filepath.Dir(file.Path), newName)

			// Dosya adını değiştir
			err := os.Rename(oldPath, newPath)
			if err != nil {
				response.Errors = append(response.Errors, fmt.Sprintf("Hata (%s): %s", file.Name, err.Error()))
				response.Stats.ErrorFiles++
				continue
			}

			// Başarılı işlemi kaydet
			newFileInfo := FileInfo{
				Name:      newName,
				Path:      newPath,
				Extension: filepath.Ext(newName),
				Size:      file.Size,
				ModTime:   file.ModTime,
				IsDir:     file.IsDir,
			}
			response.ProcessedFiles = append(response.ProcessedFiles, newFileInfo)
			response.Stats.ProcessedFiles++
			counter++
		} else {
			response.Stats.SkippedFiles++
		}
	}

	// İstatistikleri tamamla
	response.Stats.ProcessTime = time.Since(startTime).Seconds()

	if response.Stats.ErrorFiles > 0 {
		response.Success = false
		response.Message = fmt.Sprintf("%d dosya işlendi, %d hatada sorun yaşandı",
			response.Stats.ProcessedFiles, response.Stats.ErrorFiles)
	} else {
		response.Message = fmt.Sprintf("Toplam %d dosya başarıyla işlendi",
			response.Stats.ProcessedFiles)
	}

	return response
}

func matchesRenameCondition(file FileInfo, req RenameRequest) bool {
	if req.UseRegex && req.RegexPattern != "" {
		matched, err := regexp.MatchString(req.RegexPattern, file.Name)
		return err == nil && matched
	}

	// Geleneksel uzantı eşleştirme
	if req.CaseSensitive {
		return file.Extension == req.OldExtension
	}
	return strings.ToLower(file.Extension) == strings.ToLower(req.OldExtension)
}

func generateNewName(file FileInfo, req RenameRequest, counter int) string {
	if req.NamingTemplate != "" {
		// Template tabanlı isimlendirme
		vars := TemplateVars{
			Index:     counter,
			Name:      strings.TrimSuffix(file.Name, file.Extension),
			Extension: req.NewExtension,
			Size:      file.Size,
			Date:      file.ModTime,
			Counter:   counter,
		}
		return applyTemplate(req.NamingTemplate, vars)
	}

	if req.UseRegex && req.RegexPattern != "" && req.ReplacePattern != "" {
		// Regex tabanlı değiştirme
		re, err := regexp.Compile(req.RegexPattern)
		if err == nil {
			return re.ReplaceAllString(file.Name, req.ReplacePattern)
		}
	}

	// Geleneksel uzantı değiştirme
	return strings.TrimSuffix(file.Name, file.Extension) + req.NewExtension
}

func applyTemplate(template string, vars TemplateVars) string {
	result := template

	// Değişken değiştirmeleri
	replacements := map[string]string{
		"{index}":   fmt.Sprintf("%d", vars.Index),
		"{counter}": fmt.Sprintf("%d", vars.Counter),
		"{name}":    vars.Name,
		"{ext}":     vars.Extension,
		"{size}":    fmt.Sprintf("%d", vars.Size),
		"{date}":    vars.Date.Format("2006-01-02"),
		"{time}":    vars.Date.Format("15-04-05"),
		"{year}":    vars.Date.Format("2006"),
		"{month}":   vars.Date.Format("01"),
		"{day}":     vars.Date.Format("02"),
	}

	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, value)
	}

	return result
}

func createBackup(folderPath string) string {
	timestamp := time.Now().Format("20060102_150405")
	backupPath := filepath.Join(folderPath, ".fileboss_backup_"+timestamp)
	os.MkdirAll(backupPath, 0755)
	return backupPath
}

func calculateTotalSize(files []FileInfo) int64 {
	var total int64
	for _, file := range files {
		total += file.Size
	}
	return total
}

// LanguageMeta dil meta bilgilerini tutar
type LanguageMeta struct {
	Language     string   `json:"language"`
	Code         string   `json:"code"`
	Flag         string   `json:"flag"`
	RTL          bool     `json:"rtl"`
	Completed    int      `json:"completed"`
	Contributors []string `json:"contributors"`
}

// LanguageInfo dil bilgilerini tutar
type LanguageInfo struct {
	Meta LanguageMeta `json:"meta"`
}

func getAvailableLanguages() ([]LanguageMeta, error) {
	localesDir := "./locales"
	var languages []LanguageMeta

	log.Printf("🔍 Checking locales directory: %s", localesDir)

	// locales klasörünü kontrol et
	if _, err := os.Stat(localesDir); os.IsNotExist(err) {
		log.Printf("⚠️ Locales directory not found")
		return languages, nil
	}

	files, err := filepath.Glob(filepath.Join(localesDir, "*.json"))
	if err != nil {
		log.Printf("❌ Error globbing files: %v", err)
		return nil, err
	}

	log.Printf("🗂️ Found %d JSON files", len(files))

	for _, file := range files {
		// example.json'u atla
		if strings.Contains(file, "example.json") {
			continue
		}

		data, err := os.ReadFile(file)
		if err != nil {
			continue
		}

		// JSON dosyasını parse et
		var langData map[string]interface{}
		if err := json.Unmarshal(data, &langData); err != nil {
			continue
		}

		// meta bilgisini çıkar
		if metaData, ok := langData["meta"].(map[string]interface{}); ok {
			langMeta := LanguageMeta{
				Language:     getString(metaData, "language"),
				Code:         getString(metaData, "code"),
				Flag:         getString(metaData, "flag"),
				RTL:          getBool(metaData, "rtl"),
				Completed:    getInt(metaData, "completed"),
				Contributors: getStringArray(metaData, "contributors"),
			}
			languages = append(languages, langMeta)
		} else {
			// meta yoksa dosya adından çıkar
			basename := filepath.Base(file)
			code := strings.TrimSuffix(basename, ".json")

			var flag, language string
			switch code {
			case "tr":
				flag, language = "🇹🇷", "Türkçe"
			case "en":
				flag, language = "🇺🇸", "English"
			default:
				flag, language = "🌍", code
			}

			langMeta := LanguageMeta{
				Language:     language,
				Code:         code,
				Flag:         flag,
				RTL:          false,
				Completed:    100,
				Contributors: []string{},
			}
			languages = append(languages, langMeta)
		}
	}

	// Dilleri alfabetik sıraya göre sırala
	sort.Slice(languages, func(i, j int) bool {
		return languages[i].Language < languages[j].Language
	})

	return languages, nil
}

// Helper fonksiyonlar
func getString(m map[string]interface{}, key string) string {
	if val, ok := m[key].(string); ok {
		return val
	}
	return ""
}

func getBool(m map[string]interface{}, key string) bool {
	if val, ok := m[key].(bool); ok {
		return val
	}
	return false
}

func getInt(m map[string]interface{}, key string) int {
	if val, ok := m[key].(float64); ok {
		return int(val)
	}
	return 0
}

func getStringArray(m map[string]interface{}, key string) []string {
	if val, ok := m[key].([]interface{}); ok {
		var result []string
		for _, v := range val {
			if s, ok := v.(string); ok {
				result = append(result, s)
			}
		}
		return result
	}
	return []string{}
}

func getLanguageData(langCode string) (map[string]interface{}, error) {
	filePath := filepath.Join("./locales", langCode+".json")

	// Dosya var mı kontrol et
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("dil dosyası bulunamadı: %s", langCode)
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var langData map[string]interface{}
	if err := json.Unmarshal(data, &langData); err != nil {
		return nil, err
	}

	return langData, nil
}

// Browser açma fonksiyonu
func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("desteklenmeyen platform")
	}
	if err != nil {
		log.Printf("⚠️ Tarayıcı otomatik açılamadı: %v", err)
		log.Printf("🌐 Manuel olarak şu adresi açın: %s", url)
	} else {
		log.Printf("🌐 Tarayıcı açılıyor: %s", url)
	}
}

func main() {
	fmt.Println("🚀 Fileboss v2.0 - Gelişmiş Dosya Uzantısı Değiştirici")
	fmt.Println("===============================================")
	fmt.Println("✨ REGEX Desteği | 📊 Gelişmiş Filtreleme | 🔧 Şablonlar")

	// HTTP server'ı başlat
	server := &http.Server{
		Addr:    ":8080",
		Handler: setupAPI(),
	}

	// Server'ı goroutine'de başlat
	go func() {
		log.Println("📡 HTTP server başlatıldı: http://localhost:8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("❌ Server başlatılamadı:", err)
		}
	}()

	// Kısa bir bekleme sonrası tarayıcıyı aç
	time.Sleep(2 * time.Second)
	openBrowser("http://localhost:8080")

	// Kullanıcı talimatları
	fmt.Println()
	fmt.Println("✅ Fileboss v2.0 hazır!")
	fmt.Println("🌐 Web arayüzü: http://localhost:8080")
	fmt.Println("🔥 REGEX ve gelişmiş özellikler aktif!")
	fmt.Println("⏹️  Uygulamayı kapatmak için Ctrl+C basın")
	fmt.Println()

	// Interrupt signal'ı bekle (Ctrl+C)
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// Signal gelene kadar bekle
	<-c

	// Temizlik
	log.Println("🔄 Uygulama kapatılıyor...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("❌ Server kapatma hatası: %v", err)
	} else {
		log.Println("✅ Server temizlik ile kapatıldı")
	}
}
