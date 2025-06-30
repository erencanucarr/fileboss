# 📁 Fileboss v2.0 - Advanced File Extension Changer

<div align="center">

![Fileboss Logo](https://img.shields.io/badge/Fileboss-v2.0-blue?style=for-the-badge&logo=files&logoColor=white)
![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge)

**🚀 Modern • ⚡ Fast • 🎯 User-Friendly • 🌍 Multi-Language**

</div>

---

## 📖 About the Project

Fileboss v2.0 is a **next-generation** file extension changer application developed with Go. This tool, developed using modern web technologies, enables users to perform bulk file operations safely, quickly, and easily.

### 🎯 Main Goals
- **Simplicity**: Simplify complex command-line operations with a graphical interface
- **Security**: Preview system before changes and undo functionality
- **Performance**: Process thousands of files in seconds
- **Accessibility**: Multi-language support and modern UI/UX

---

## ✨ Features

### 🎮 Core Functions
- 🔄 **Bulk extension changing** - Thousands of files with one click
- 👁️ **Live preview** - Full control before changes
- ⚡ **Fast processing** - Optimized algorithm
- 🔙 **Undo system** - Reverse erroneous operations

### 🌟 Advanced Features
- 🔍 **REGEX support** - Complex filename patterns
- 📊 **Advanced filtering** - Size, date, name-based filtering
- 🔧 **Template system** - Save frequently used operations
- 📈 **Statistics dashboard** - Detailed operation reports

### 🎨 User Experience
- 🌙 **Dark/Light theme** - Eye-friendly interface
- 🌍 **Multi-language support** - Turkish, English, and more
- ⌨️ **Keyboard shortcuts** - Quick navigation
- 📱 **Responsive design** - Works on all devices
- 🎭 **Drag & drop** - Simplified folder selection

---

## 🏗️ Technical Architecture

### 🛠️ Technology Stack

| Layer | Technology | Description |
|--------|-----------|----------|
| **Backend** | Go 1.21+ | HTTP server, file operations |
| **Frontend** | Vanilla JS | Modern ES6+, responsive UI |
| **Styling** | CSS3 | Flexbox, Grid, animations |
| **API** | RESTful | JSON-based data exchange |

### 🏛️ Architecture Design

```
┌─────────────────────────────────────────────────────────┐
│                    🌐 Web Browser                       │
├─────────────────────────────────────────────────────────┤
│  📱 Frontend (HTML/CSS/JS)                             │
│  ├── 🎨 UI Components (app.js)                        │
│  ├── 🌍 Language System (i18n)                        │
│  ├── 🎭 Theme Management                               │
│  └── 📡 API Client                                    │
├─────────────────────────────────────────────────────────┤
│  🔗 HTTP/JSON API                                     │
├─────────────────────────────────────────────────────────┤
│  ⚙️ Backend (Go)                                       │
│  ├── 🌐 HTTP Server (Gorilla Mux)                     │
│  ├── 📂 File Operations                               │
│  ├── 🔍 Filtering & Search                            │
│  ├── 🔧 Template System                               │
│  └── 🗂️ Language Management                          │
├─────────────────────────────────────────────────────────┤
│  💾 File System                                       │
│  ├── 📁 Target Directories                            │
│  ├── 🌍 Language Files (locales/)                     │
│  └── 🔧 Configuration Files                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
fileboss/
├── 📄 README.md                    # This file
├── 📄 LICENSE                      # MIT license
├── 📄 go.mod                       # Go module definitions
├── 📄 templates.json               # Operation templates
├── 📄 undo_system.go              # Undo system
├── 📄 run.bat                     # Windows quick launcher
│
├── 📂 cmd/                        # Main application
│   └── 📄 main.go                 # HTTP server and API endpoints
│
├── 📂 web/                        # Frontend files
│   ├── 📄 index.html              # Main HTML template
│   └── 📂 static/
│       ├── 📂 css/
│       │   └── 📄 style.css       # Modern CSS styles
│       └── 📂 js/
│           └── 📄 app.js          # Main JavaScript application
│
├── 📂 locales/                    # Multi-language support
│   ├── 📄 tr.json                 # Turkish translations
│   ├── 📄 en.json                 # English translations
│   ├── 📄 example.json            # Translator template
│   └── 📄 README.md               # Translation guide
│
├── 📂 scripts/                    # Development tools
│   ├── 📄 run.ps1                 # PowerShell launcher
│   ├── 📄 test.ps1                # Test file creator (Windows)
│   └── 📄 test.sh                 # Test file creator (Linux)
│
└── 📂 test_files/                 # Test files
    ├── 📄 file1.txt               # Sample text file
    ├── 📄 file2.doc               # Sample Word file
    ├── 📄 file3.txt               # Sample text file
    ├── 📄 file4.doc               # Sample Word file
    ├── 🖼️ image.jpg               # Sample image file
    └── 📊 data.xlsx               # Sample Excel file
```

### 📋 File Descriptions

#### 🎯 Core Files
- **`cmd/main.go`**: HTTP server, API endpoints, file operations
- **`web/index.html`**: Basic HTML structure and metadata
- **`web/static/js/app.js`**: Main JavaScript application (FilebossApp class)
- **`web/static/css/style.css`**: Modern CSS, responsive design

#### 🌍 Multi-Language System
- **`locales/tr.json`**: Turkish translations (100% complete)
- **`locales/en.json`**: English translations (100% complete)
- **`locales/example.json`**: Template for adding new languages
- **`locales/README.md`**: Translator guide

#### 🔧 Development Tools
- **`scripts/run.ps1`**: Windows PowerShell auto-launcher
- **`scripts/test.ps1`**: Test file creator (Windows)
- **`scripts/test.sh`**: Test file creator (Linux/macOS)

---

## 🚀 Installation and Setup

### 📋 Requirements

| Component | Minimum Version | Recommended |
|-----------|------------------|-------------|
| **Go** | 1.21+ | 1.22+ |
| **RAM** | 512 MB | 1 GB+ |
| **Disk** | 50 MB | 100 MB+ |
| **Browser** | Chrome 90+ | Chrome/Firefox/Edge latest |

### ⚡ Quick Start (Windows)

```powershell
# 1. Open PowerShell as administrator
# 2. Navigate to project folder
cd C:\Users\[Username]\Documents\GitHub\fileboss

# 3. Run auto-launcher
powershell -ExecutionPolicy Bypass -File scripts/run.ps1

# Alternative: Direct execution
go run cmd/main.go
```

### 🐧 Linux/macOS Setup

```bash
# 1. Open terminal
# 2. Navigate to project folder
cd ~/Documents/GitHub/fileboss

# 3. Run the application
go run cmd/main.go

# Create test files (optional)
chmod +x scripts/test.sh
./scripts/test.sh
```

### 🌐 Browser Access

The application will automatically open in your browser after startup:
```
http://localhost:8080
```

---

## 🏗️ Build Operations

### 🔨 Development Build

```bash
# Run in development mode
go run cmd/main.go

# Update dependencies
go mod tidy
```

### 📦 Production Build

```bash
# For Linux/macOS
go build -ldflags="-s -w" -o fileboss cmd/main.go

# For Windows (console application)
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o fileboss.exe cmd/main.go

# For Windows (GUI application - hidden console window)
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -H windowsgui" -o fileboss-gui.exe cmd/main.go
```

### 🎯 Platform-Specific Builds

```bash
# Windows 64-bit
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o build/fileboss-windows-amd64.exe cmd/main.go

# Windows 32-bit
GOOS=windows GOARCH=386 go build -ldflags="-s -w" -o build/fileboss-windows-386.exe cmd/main.go

# macOS 64-bit (Intel)
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o build/fileboss-darwin-amd64 cmd/main.go

# macOS ARM64 (M1/M2)
GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o build/fileboss-darwin-arm64 cmd/main.go

# Linux 64-bit
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o build/fileboss-linux-amd64 cmd/main.go

# Linux ARM64
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o build/fileboss-linux-arm64 cmd/main.go
```

### 📏 Build Optimization Parameters

| Parameter | Description |
|-----------|-------------|
| `-ldflags="-s"` | Remove debug symbols (reduces file size) |
| `-ldflags="-w"` | Remove DWARF debug information |
| `-ldflags="-H windowsgui"` | Hide console window on Windows |
| `GOOS` | Target operating system |
| `GOARCH` | Target architecture (amd64, arm64, 386) |

---

## 🎮 Usage Guide

### 🏁 Getting Started

1. **🚀 Launch the application**
   ```bash
   go run cmd/main.go
   ```

2. **🌐 Open in browser**
   - Auto-opens: `http://localhost:8080`
   - Manual: Type the above address in your browser

3. **🌍 Select language**
   - Choose from the language menu in the top-right corner
   - Supported languages: 🇹🇷 Turkish, 🇺🇸 English

### 📝 Step-by-Step Process

#### 1️⃣ Folder Selection
- **Method 1**: Type folder path in the text box
- **Method 2**: Click "Select Folder" button
- **Method 3**: Drag & drop the folder

#### 2️⃣ Extension Definition
- **Old extension**: Current extension of files to be changed (e.g., `.txt`)
- **New extension**: Target extension (e.g., `.md`)
- **Quick selection**: Use predefined extension tags

#### 3️⃣ Preview and Check
- **Click "Preview" button**
- **Review the change list**
- **Check statistics**

#### 4️⃣ Complete the Operation
- **Click "Change" button**
- **Wait for operation to complete**
- **Check success message**

### ⚡ Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl + Enter` | Process files |
| `F1` | Show/hide help |
| `Escape` | Cancel / Close modal |
| `Ctrl + ,` | Settings menu |
| `Ctrl + L` | Change language |

### 🔍 Advanced Filtering

**Size Filter**:
- Minimum and maximum file size
- KB, MB, GB units supported

**Date Filter**:
- Files within specific date range
- Filter by modification date

**Name Filter**:
- Text-based search
- REGEX pattern support

**Other Options**:
- Include hidden files
- Sort type (name, size, date)
- Ascending/descending sort

---

## 🌍 Multi-Language Support

### 🎯 Available Languages

| Language | Code | Flag | Completion | Contributors |
|----------|------|------|------------|--------------|
| Turkish | `tr` | 🇹🇷 | 100% | [@erencanucarr] |
| English | `en` | 🇺🇸 | 100% | [@erencanucarr] |

### 🤝 Adding New Languages

To add a new language:

1. **Copy the template file**:
   ```bash
   cp locales/example.json locales/[language-code].json
   ```

2. **Complete translations**:
   - Fill in meta information
   - Translate all text keys
   - Update completion percentage

3. **Test**:
   - Run the application
   - Check language selector
   - Verify all texts display correctly

4. **Submit pull request**:
   - Fork the repository
   - Create branch: `git checkout -b add-[language]-support`
   - Commit: `git commit -m "Add [Language] language support"`
   - Push: `git push origin add-[language]-support`
   - Open pull request

For detailed guide: [`locales/README.md`](locales/README.md)

---

## 🔧 API Documentation

### 📡 Endpoints

#### `GET /api/languages`
**Returns list of available languages**

**Response**:
```json
[
  {
    "code": "tr",
    "name": "Turkish",
    "flag": "🇹🇷",
    "completion": 100
  },
  {
    "code": "en", 
    "name": "English",
    "flag": "🇺🇸",
    "completion": 100
  }
]
```

#### `GET /api/language/{code}`
**Returns all translations for a specific language**

**Parameters**:
- `code`: Language code (tr, en, etc.)

**Response**:
```json
{
  "meta": {
    "language": "English",
    "code": "en",
    "flag": "🇺🇸",
    "completion": 100
  },
  "app": {
    "title": "Fileboss",
    "subtitle": "File Extension Changer"
  },
  // ... other translations
}
```

#### `GET /api/files`
**Lists files in the specified folder**

**Parameters**:
- `path`: Folder path
- `filters`: Filter parameters in JSON format

**Example**:
```
/api/files?path=test_files&filters={"minSize":0,"maxSize":0,"dateFrom":"","dateTo":"","namePattern":"","useRegex":false,"includeHidden":false,"sortBy":"name","sortDesc":false}
```

**Response**:
```json
{
  "files": [
    {
      "name": "file1.txt",
      "path": "test_files/file1.txt",
      "size": 1024,
      "modified": "2025-06-30T18:30:00Z",
      "extension": ".txt"
    }
  ],
  "total": 1
}
```

#### `POST /api/rename`
**Changes file extensions**

**Request Body**:
```json
{
  "path": "test_files",
  "oldExt": ".txt",
  "newExt": ".md",
  "files": ["file1.txt", "file2.txt"]
}
```

**Response**:
```json
{
  "success": true,
  "processed": 2,
  "errors": [],
  "message": "Operation completed successfully"
}
```

---

## 🧪 Testing

### 🏗️ Test Environment Setup

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/test.ps1

# Linux/macOS
chmod +x scripts/test.sh
./scripts/test.sh
```

These commands create sample files in the `test_files/` folder:
- `file1.txt`, `file2.txt`, `file3.txt` (text files)
- `file2.doc`, `file4.doc` (Word files)  
- `image.jpg` (image file)
- `data.xlsx` (Excel file)

### 🎯 Test Scenarios

1. **Core Functions**:
   - ✅ Folder loading
   - ✅ File listing
   - ✅ Extension changing
   - ✅ Preview system

2. **Filtering**:
   - ✅ Size filter
   - ✅ Date filter
   - ✅ Name pattern
   - ✅ REGEX support

3. **Multi-Language**:
   - ✅ Language switching
   - ✅ Translation accuracy
   - ✅ Browser language detection

4. **UI/UX**:
   - ✅ Responsive design
   - ✅ Theme switching
   - ✅ Keyboard shortcuts
   - ✅ Drag & drop

---

## 🔧 Troubleshooting

### ❌ Common Issues

#### Port 8080 in Use
```bash
# Use different port
go run cmd/main.go -port=8081
```

#### Browser Doesn't Auto-Open
Manually open this address: `http://localhost:8080`

#### File Permission Errors
- Check folder write permissions
- Run with administrator/sudo privileges

#### Go Module Errors
```bash
# Clean and update modules
go clean -modcache
go mod download
go mod tidy
```

### 🐛 Debug Mode

To see detailed logs:
```bash
# Run in debug mode
DEBUG=true go run cmd/main.go
```

### 📋 Log Files

The application writes detailed logs to console during operation:
- 🌍 Language API calls
- 📂 File operations
- ❌ Error messages
- ✅ Successful operations

---

## 🚀 Future Features

### 📋 Roadmap v2.1

- [ ] 🔄 **Batch operations**: Process multiple folders simultaneously
- [ ] 📊 **Advanced reporting**: Excel export, PDF reports
- [ ] 🔐 **Security**: File hash verification, secure deletion
- [ ] 🌐 **Web API**: REST API for external integration
- [ ] 📱 **PWA**: Progressive Web App support

### 📋 Roadmap v2.2

- [ ] 🔌 **Plugin system**: Custom operation plugins
- [ ] 🤖 **AI-powered**: Automatic file type detection
- [ ] ☁️ **Cloud storage**: Google Drive, Dropbox integration
- [ ] 📈 **Analytics**: Usage statistics
- [ ] 🔔 **Notifications**: Operation completion notifications

---

## 🤝 Contributing

### 💡 How to Contribute?

1. **🐛 Bug Report**: Open an issue when you find problems
2. **✨ Feature Request**: Share your new feature suggestions
3. **🌍 Translation**: Add new language translations
4. **📝 Documentation**: Improve documentation
5. **🔧 Code**: Make code contributions

### 🔄 Contribution Process

1. **Fork** the repository
2. **Create feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m 'Add: Amazing new feature'
   ```
4. **Push your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Create Pull Request**

### 📏 Code Standards

- **Go**: Code formatted with `gofmt`
- **JavaScript**: ES6+ standard
- **CSS**: BEM methodology
- **Commit**: Conventional commits format

---

## 📜 License

This project is licensed under the **MIT** license. See [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Fileboss Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...

In case the software is sold for money, you can forward the link of this software to the customer reviews of the people who sell it for money :)

```

---

## 📞 Contact and Support

### 👨‍💻 Developer

**Eren Can Can** - Developer
- 🐙 GitHub: [@erencanucarr](https://github.com/erencanucarr)
- 📧 Email: dev@eren.gg
- 🌐 Website: [eren.gg](https://eren.gg)

### 🔗 Project Links

- 🏠 **Main Repo**: [https://github.com/erencanucarr/fileboss](https://github.com/erencanucarr/fileboss)
- 📚 **Wiki**: [https://github.com/erencanucarr/fileboss/wiki](https://github.com/erencanucarr/fileboss/wiki)
- 🐛 **Issues**: [https://github.com/erencanucarr/fileboss/issues](https://github.com/erencanucarr/fileboss/issues)
- 💡 **Discussions**: [https://github.com/erencanucarr/fileboss/discussions](https://github.com/erencanucarr/fileboss/discussions)

### 🆘 Getting Support

1. **📖 Documentation**: Read this README
2. **🔍 Search**: Search for similar questions in issues
3. **❓ Questions**: Ask questions in GitHub Discussions
4. **🐛 Bugs**: Open bug reports in GitHub Issues

---

<div align="center">

**🌟 If you find Fileboss useful, don't forget to give it a star! 🌟**

[![Star History Chart](https://api.star-history.com/svg?repos=erencanucarr/fileboss&type=Date)](https://star-history.com/#erencanucarr/fileboss&Date)

---

*Made with ❤️ by the Eren Can Ucar*

![Fileboss Footer](https://img.shields.io/badge/Fileboss-v2.0-blue?style=for-the-badge&logo=files&logoColor=white)

</div> 