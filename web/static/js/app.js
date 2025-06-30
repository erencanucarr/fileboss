/**
 * Fileboss v2.0 - Gelişmiş Dosya Uzantısı Değiştirici
 * Modern JavaScript ES6+ ile yazılmış
 */

class FilebossApp {
    constructor() {
        this.currentStep = 1;
        this.currentMode = 'extension';
        this.loadedFiles = [];
        this.previewData = null;
        this.settings = this.loadSettings();
        this.availableLanguages = [];
        this.currentLanguage = 'tr';
        this.translations = {};
        this.isLoading = false;
        this.eventListenersAdded = false;
        
        console.log('🚀 Fileboss App constructor called');
        
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Fileboss...');
        
        // Setup basic functionality first
        this.setupTheme();
        this.setupKeyboardShortcuts();
        this.setupDragAndDrop();
        this.setupEventListeners();
        
        // Then initialize language system
        await this.initializeLanguage();
        
        // Load saved settings
        this.loadSettings();
        
        console.log('✅ Fileboss v2.0 App initialized!');
    }

    setupEventListeners() {
        // Prevent duplicate event listeners
        if (this.eventListenersAdded) {
            console.log('⚠️ Event listeners already added, skipping');
            return;
        }
        
        console.log('🔧 Setting up event listeners...');
        
        // Navigation
        document.getElementById('load-files')?.addEventListener('click', () => this.loadFiles());
        document.getElementById('preview-changes')?.addEventListener('click', () => this.previewChanges());
        document.getElementById('process-files')?.addEventListener('click', () => this.processFiles());
        
        // Step navigation
        document.getElementById('back-to-folder')?.addEventListener('click', () => this.loadStep(1));
        document.getElementById('back-to-settings')?.addEventListener('click', () => this.loadStep(2));
        
        // Mode selection
        document.querySelectorAll('.mode-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectMode(e.target.closest('.mode-option').dataset.mode));
        });

        // Quick selections
        document.querySelectorAll('.tag[data-ext]').forEach(tag => {
            tag.addEventListener('click', (e) => this.selectExtension(e.target.dataset.ext));
        });

        document.querySelectorAll('.example-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.selectRegexExample(e.target));
        });

        document.querySelectorAll('.template-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.selectTemplate(e.target.dataset.template));
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Remove existing listeners to prevent duplicates
            themeToggle.replaceWith(themeToggle.cloneNode(true));
            const newThemeToggle = document.getElementById('theme-toggle');
            newThemeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Help
        document.getElementById('help-btn')?.addEventListener('click', () => this.showModal('help-modal'));
        
        // Filter toggle
        document.getElementById('toggle-filters')?.addEventListener('click', () => this.toggleFilters());
        
        // Template test
        document.getElementById('test-template')?.addEventListener('click', () => this.testTemplate());
        
        // Input validation
        document.getElementById('folder-path')?.addEventListener('input', (e) => this.validateFolderPath(e.target.value));
        
        // Modal close handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal').id));
        });

        // Export results
        document.getElementById('export-results')?.addEventListener('click', () => this.exportResults());
        
        // Mark event listeners as added
        this.eventListenersAdded = true;
        console.log('✅ Event listeners setup complete');
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('fileboss-theme') || 'light';
        this.setTheme(savedTheme);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter: Process files
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                if (this.currentStep === 3) {
                    this.processFiles();
                } else if (this.currentStep === 2) {
                    this.previewChanges();
                }
            }
            
            // F1: Help
            if (e.key === 'F1') {
                e.preventDefault();
                this.showModal('help-modal');
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl+D: Toggle theme
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    setupDragAndDrop() {
        console.log('🖱️ Setting up drag & drop');
        
        const dropZone = document.getElementById('drop-zone');
        const folderInput = document.getElementById('folder-path');
        
        if (!dropZone) return;

        // Prevent default behaviors for all drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults.bind(this), false);
            document.body.addEventListener(eventName, this.preventDefaults.bind(this), false);
        });

        // Visual feedback for drag over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
                this.updateDropZoneText(this.t('folderSelection.dropZone.dragOver', 'Klasörü bırakın!'));
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
                this.updateDropZoneText(this.t('folderSelection.dropZone.title', 'Klasörü buraya sürükleyin'));
            }, false);
        });

        // Handle file/folder drop
        dropZone.addEventListener('drop', (e) => {
            this.handleFileDrop(e);
        });

        // Click to select folder
        dropZone.addEventListener('click', () => {
            const fileInput = document.getElementById('folder-input-hidden');
            if (fileInput) {
                fileInput.click();
            }
        });

        // Alternative: File input for folder selection
        this.setupFolderInput();
    }

    updateDropZoneText(text) {
        const dropZoneContent = document.querySelector('.drop-zone-content h3');
        if (dropZoneContent) {
            dropZoneContent.textContent = text;
        }
    }

    setupFolderInput() {
        // Create hidden file input for folder selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.webkitdirectory = true; // Enable folder selection
        fileInput.multiple = true;
        fileInput.id = 'folder-input-hidden';
        
        document.body.appendChild(fileInput);

        // Connect browse button to folder input
        const browseButton = document.getElementById('browse-folder');
        if (browseButton) {
            browseButton.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // Handle folder selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                let folderPath = '';
                
                if (file.webkitRelativePath) {
                    // Extract folder path from webkitRelativePath
                    const pathParts = file.webkitRelativePath.split('/');
                    if (pathParts.length > 1) {
                        folderPath = pathParts.slice(0, -1).join('/');
                    }
                }
                
                if (folderPath) {
                    const folderInput = document.getElementById('folder-path');
                    if (folderInput) {
                        folderInput.value = folderPath;
                        this.validateFolderPath(folderPath);
                        this.showNotification(
                            this.t('notifications.folderSelected', `Klasör seçildi: ${folderPath}`), 
                            'success'
                        );
                    }
                }
            }
        });
    }

    handleFileDrop(e) {
        console.log('📁 File dropped');
        this.showNotification('Please use the Browse button to select a folder', 'info');
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Step Management
    loadStep(stepNumber) {
        // Update step indicator
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
            if (parseInt(step.dataset.step) < stepNumber) {
                step.classList.add('completed');
            } else if (parseInt(step.dataset.step) === stepNumber) {
                step.classList.add('active');
            }
        });

        // Show/hide step sections
        document.querySelectorAll('.step-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const currentSection = document.getElementById(`step-${stepNumber}`);
        if (currentSection) {
            currentSection.classList.add('active');
        }

        this.currentStep = stepNumber;
    }

    // Mode Management
    selectMode(mode) {
        this.currentMode = mode;
        
        // Update mode selector
        document.querySelectorAll('.mode-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Show/hide mode settings
        document.getElementById('extension-settings').style.display = mode === 'extension' ? 'block' : 'none';
        document.getElementById('regex-settings').style.display = mode === 'regex' ? 'block' : 'none';
        document.getElementById('template-settings').style.display = mode === 'template' ? 'block' : 'none';
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log(`🌓 Theme changing: ${currentTheme} → ${newTheme}`);
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        console.log(`🎨 Setting theme: ${theme}`);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('fileboss-theme', theme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            console.log(`🔄 Icon updated to: ${themeIcon.className}`);
        } else {
            console.error('❌ Theme toggle button not found!');
        }
        
        // Verify attribute is set
        const actualTheme = document.documentElement.getAttribute('data-theme');
        console.log(`✅ Document theme attribute: ${actualTheme}`);
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    // Loading Management
    showLoading(text = 'İşlem yapılıyor...', progress = 0) {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = overlay.querySelector('.loading-text');
        const progressFill = overlay.querySelector('.progress-fill');
        const progressText = overlay.querySelector('.progress-text');
        
        if (loadingText) loadingText.textContent = text;
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
        
        overlay.classList.add('show');
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('show');
        overlay.style.display = 'none';
    }

    // Form Data Collection
    getFormData() {
        const folderPath = document.getElementById('folder-path')?.value || '';
        
        const baseData = {
            folderPath,
            includeSubfolders: document.getElementById('include-subfolders')?.checked || false,
            createBackup: document.getElementById('create-backup')?.checked || false,
            filters: this.getFilterData()
        };

        switch (this.currentMode) {
            case 'extension':
                return {
                    ...baseData,
                    oldExtension: document.getElementById('old-extension')?.value || '',
                    newExtension: document.getElementById('new-extension')?.value || '',
                    caseSensitive: document.getElementById('case-sensitive')?.checked || false,
                    useRegex: false
                };
                
            case 'regex':
                return {
                    ...baseData,
                    useRegex: true,
                    regexPattern: document.getElementById('regex-pattern')?.value || '',
                    replacePattern: document.getElementById('replace-pattern')?.value || ''
                };
                
            case 'template':
                return {
                    ...baseData,
                    namingTemplate: document.getElementById('naming-template')?.value || '',
                    startIndex: parseInt(document.getElementById('start-index')?.value) || 1
                };
                
            default:
                return baseData;
        }
    }

    getFilterData() {
        return {
            minSize: parseInt(document.getElementById('min-size')?.value) * 1024 || 0,
            maxSize: parseInt(document.getElementById('max-size')?.value) * 1024 || 0,
            dateFrom: document.getElementById('date-from')?.value || '',
            dateTo: document.getElementById('date-to')?.value || '',
            namePattern: document.getElementById('name-pattern')?.value || '',
            useRegex: document.getElementById('pattern-regex')?.checked || false,
            includeHidden: document.getElementById('include-hidden')?.checked || false,
            sortBy: document.getElementById('sort-by')?.value || 'name',
            sortDesc: document.getElementById('sort-desc')?.checked || false
        };
    }

    // Validation
    validateFolderPath(path) {
        const loadButton = document.getElementById('load-files');
        const isValid = path && path.trim().length > 0;
        
        if (loadButton) {
            loadButton.disabled = !isValid;
        }
        
        return isValid;
    }

    validateFormData(data) {
        if (!data.folderPath) {
            this.showNotification(this.t('notifications.folderRequired', 'Klasör yolu gerekli!'), 'error');
            return false;
        }

        switch (this.currentMode) {
            case 'extension':
                if (!data.oldExtension || !data.newExtension) {
                    this.showNotification(this.t('notifications.extensionsRequired', 'Eski ve yeni uzantı gerekli!'), 'error');
                    return false;
                }
                break;
                
            case 'regex':
                if (!data.regexPattern || !data.replacePattern) {
                    this.showNotification(this.t('notifications.regexRequired', 'REGEX deseni ve değiştirme deseni gerekli!'), 'error');
                    return false;
                }
                try {
                    new RegExp(data.regexPattern);
                } catch (e) {
                    this.showNotification(this.t('notifications.invalidRegex', 'Geçersiz REGEX deseni!'), 'error');
                    return false;
                }
                break;
                
            case 'template':
                if (!data.namingTemplate) {
                    this.showNotification(this.t('notifications.templateRequired', 'İsimlendirme şablonu gerekli!'), 'error');
                    return false;
                }
                break;
        }

        return true;
    }

    // API Calls
    async loadFiles() {
        console.log('📂 Loading files...');
        
        // Duplicate call prevention
        if (this.isLoading) {
            console.log('⚠️ Already loading, skipping duplicate call');
            return;
        }
        
        const folderPath = document.getElementById('folder-path')?.value?.trim();
        console.log('📁 Folder path:', folderPath);
        
        if (!folderPath) {
            this.showNotification(this.t('notifications.folderRequired', 'Klasör yolu gerekli!'), 'error');
            return;
        }

        this.isLoading = true;
        this.showLoading(this.t('loading.loadingFiles', 'Dosyalar yükleniyor...'), 0);

        try {
            const filters = this.getFilterData();
            const apiUrl = `/api/files?path=${encodeURIComponent(folderPath)}&filters=${encodeURIComponent(JSON.stringify(filters))}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error text:', errorText);
                
                // Sadece status code'u throw et, detaylı mesajları değil
                if (response.status === 404) {
                    throw new Error('FOLDER_NOT_FOUND');
                } else if (response.status >= 500) {
                    throw new Error('SERVER_ERROR');
                } else {
                    throw new Error(`HTTP_${response.status}`);
                }
            }

            this.loadedFiles = await response.json();
            console.log('✅ Loaded files:', this.loadedFiles.length);
            this.showNotification(`${this.loadedFiles.length} ${this.t('notifications.filesLoaded', 'dosya yüklendi!')}`, 'success');
            this.loadStep(2);
            
        } catch (error) {
            console.error('❌ File loading error details:', error);
            
            // Clean error messages based on error type
            let errorMessage;
            switch (error.message) {
                case 'FOLDER_NOT_FOUND':
                    errorMessage = this.t('notifications.folderNotFound', 'Klasör bulunamadı!');
                    break;
                case 'SERVER_ERROR':
                    errorMessage = this.t('notifications.serverError', 'Server hatası!');
                    break;
                default:
                    errorMessage = this.t('notifications.fileLoadError', 'Dosya yükleme hatası!');
                    break;
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async previewChanges() {
        console.log('👀 Previewing changes...');
        this.showNotification('Preview feature coming soon!', 'info');
    }

    async processFiles() {
        console.log('⚙️ Processing files...');
        this.showNotification('Process feature coming soon!', 'info');
    }

    async testTemplate() {
        const template = document.getElementById('naming-template')?.value;
        if (!template) {
            this.showNotification(this.t('notifications.templateRequired', 'Önce bir şablon girin!'), 'warning');
            return;
        }

        if (this.loadedFiles.length === 0) {
            this.showNotification(this.t('notifications.loadFilesFirst', 'Önce dosyaları yükleyin!'), 'warning');
            return;
        }

        this.showLoading('Şablon test ediliyor...', 50);

        try {
            const testFiles = this.loadedFiles.slice(0, 5);
            const response = await fetch('/api/template-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template, files: testFiles })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.showTemplateResults(result);
            
        } catch (error) {
            console.error('Şablon test hatası:', error);
            this.showNotification(`${this.t('notifications.templateTestError', 'Şablon test hatası:')} ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // UI Updates
    renderPreview() {
        const container = document.getElementById('preview-content');
        const statsContainer = document.getElementById('preview-stats');
        
        if (!container || !this.previewData) return;

        if (statsContainer) {
            statsContainer.innerHTML = `
                <span><i class="fas fa-file"></i> ${this.previewData.count} dosya seçildi</span>
                <span><i class="fas fa-hdd"></i> ${this.formatFileSize(this.previewData.stats.totalSize)}</span>
                <span><i class="fas fa-check"></i> ${this.previewData.stats.matching} eşleşen</span>
            `;
        }

        container.innerHTML = '';
        
        if (this.previewData.previews.length === 0) {
            container.innerHTML = '<div class="preview-empty">Eşleşen dosya bulunamadı</div>';
            document.getElementById('process-files').disabled = true;
            return;
        }

        this.previewData.previews.forEach(preview => {
            const item = document.createElement('div');
            item.className = 'preview-item';
            item.innerHTML = `
                <span class="preview-name">${preview.oldName}</span>
                <span class="preview-arrow"><i class="fas fa-arrow-right"></i></span>
                <span class="preview-new-name">${preview.newName}</span>
            `;
            container.appendChild(item);
        });

        document.getElementById('process-files').disabled = false;
    }

    showResults(result) {
        const modalContent = document.getElementById('results-content');
        if (!modalContent) return;

        const successColor = result.success ? 'var(--accent-color)' : 'var(--danger-color)';
        
        modalContent.innerHTML = `
            <div class="results-summary">
                <div class="results-stats">
                    <div class="stat-item">
                        <span class="stat-number" style="color: ${successColor}">${result.stats.processedFiles}</span>
                        <span class="stat-label">İşlenen Dosya</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${result.stats.errorFiles}</span>
                        <span class="stat-label">Hata</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${result.stats.skippedFiles}</span>
                        <span class="stat-label">Atlanan</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${result.stats.processTime.toFixed(2)}s</span>
                        <span class="stat-label">Süre</span>
                    </div>
                </div>
                <p><strong>${result.message}</strong></p>
                ${result.backupPath ? `<p><i class="fas fa-folder"></i> Yedek: ${result.backupPath}</p>` : ''}
            </div>
        `;

        if (result.errors.length > 0) {
            const errorsList = document.createElement('div');
            errorsList.innerHTML = `
                <h4><i class="fas fa-exclamation-triangle"></i> Hatalar:</h4>
                <div class="results-list">
                    ${result.errors.map(error => `
                        <div class="result-item">
                            <span>${error}</span>
                            <span class="result-status error">Hata</span>
                        </div>
                    `).join('')}
                </div>
            `;
            modalContent.appendChild(errorsList);
        }

        this.showModal('results-modal');
    }

    showTemplateResults(result) {
        const modalContent = document.getElementById('template-results');
        if (!modalContent) return;

        modalContent.innerHTML = `
            <div class="template-preview">
                <h4><i class="fas fa-eye"></i> Şablon Önizlemesi (${result.count} dosya)</h4>
                <div class="results-list">
                    ${result.results.map(item => `
                        <div class="result-item">
                            <span>${item.oldName}</span>
                            <span class="preview-arrow"><i class="fas fa-arrow-right"></i></span>
                            <span style="color: var(--accent-color)">${item.newName}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.showModal('template-modal');
    }

    // Quick Actions
    selectExtension(ext) {
        const activeInput = document.querySelector('#old-extension:focus, #new-extension:focus') || 
                           document.getElementById('new-extension');
        if (activeInput) {
            activeInput.value = ext;
        }
    }

    selectRegexExample(element) {
        const pattern = element.dataset.pattern;
        const replace = element.dataset.replace;
        
        if (pattern) document.getElementById('regex-pattern').value = pattern;
        if (replace) document.getElementById('replace-pattern').value = replace;
    }

    selectTemplate(template) {
        document.getElementById('naming-template').value = template;
    }

    toggleFilters() {
        const content = document.getElementById('filter-content');
        const button = document.getElementById('toggle-filters');
        const icon = button.querySelector('i');
        
        content.classList.toggle('show');
        
        if (content.classList.contains('show')) {
            icon.className = 'fas fa-chevron-up';
            button.innerHTML = '<i class="fas fa-chevron-up"></i> Gizle';
        } else {
            icon.className = 'fas fa-chevron-down';
            button.innerHTML = '<i class="fas fa-chevron-down"></i> Göster/Gizle';
        }
    }

    // Utilities
    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-elevated);
            color: var(--text-primary);
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            border-left: 4px solid var(--${type === 'success' ? 'accent' : type === 'error' ? 'danger' : 'primary'}-color);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    exportResults() {
        if (!this.previewData) return;
        
        const data = {
            timestamp: new Date().toISOString(),
            mode: this.currentMode,
            files: this.previewData.previews,
            stats: this.previewData.stats
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fileboss-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadSettings() {
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('fileboss-settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                console.log('⚙️ Loaded settings:', settings);
            } catch (error) {
                console.error('❌ Failed to load settings:', error);
            }
        }
    }

    saveSettings() {
        // Save current settings to localStorage
        const settings = {
            currentMode: this.currentMode,
            currentLanguage: this.currentLanguage,
            theme: document.documentElement.getAttribute('data-theme')
        };
        
        localStorage.setItem('fileboss-settings', JSON.stringify(settings));
        console.log('💾 Settings saved:', settings);
    }
}

// CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .preview-empty {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
        font-style: italic;
    }
`;
document.head.appendChild(style);

// Language Management Methods (add to FilebossApp class)
FilebossApp.prototype.initializeLanguage = async function() {
    console.log('🌍 Initializing language system...');
    
    try {
        // Set fallback first
        this.setFallbackLanguage();
        
        // Try to load from API
        const response = await fetch('/api/languages');
        if (response.ok) {
            this.availableLanguages = await response.json();
            console.log('📋 Available languages:', this.availableLanguages);
            
            // Load user's preferred language
            const savedLang = localStorage.getItem('fileboss-language') || 'tr';
            await this.loadLanguage(savedLang);
        } else {
            console.warn('⚠️ Failed to load languages from API, using fallback');
        }
        
        this.setupLanguageSelector();
    } catch (error) {
        console.error('❌ Language initialization failed:', error);
        this.setFallbackLanguage();
        this.setupLanguageSelector();
    }
};

FilebossApp.prototype.setFallbackLanguage = function() {
    this.availableLanguages = [
        { language: 'Türkçe', code: 'tr', flag: '🇹🇷', completed: 100 },
        { language: 'English', code: 'en', flag: '🇺🇸', completed: 100 }
    ];
    this.currentLanguage = 'tr';
    this.translations = this.getFallbackTranslations();
};

FilebossApp.prototype.loadLanguage = async function(langCode) {
    console.log('🔄 Loading language:', langCode);
    
    try {
        const response = await fetch(`/api/language/${langCode}`);
        if (response.ok) {
            this.translations = await response.json();
            this.currentLanguage = langCode;
            localStorage.setItem('fileboss-language', langCode);
            this.updateUI();
            console.log('✅ Language loaded:', langCode);
            return true;
        } else {
            console.error('❌ Failed to load language:', response.status);
        }
    } catch (error) {
        console.error('❌ Language load error:', error);
    }
    
    return false;
};

FilebossApp.prototype.changeLanguage = async function(langCode) {
    console.log('🔄 Changing language to:', langCode);
    
    // Close dropdown first
    const options = document.getElementById('language-options');
    if (options) {
        options.classList.remove('show');
    }
    
    if (await this.loadLanguage(langCode)) {
        this.showNotification(this.t('notifications.languageChanged', 'Dil değiştirildi'), 'success');
        this.setupLanguageSelector();
        console.log('Language changed successfully to:', langCode);
    } else {
        this.showNotification(this.t('notifications.languageError', 'Dil yüklenemedi'), 'error');
        console.error('Failed to change language to:', langCode);
    }
};

FilebossApp.prototype.setupLanguageSelector = function() {
    console.log('🌍 Setting up language selector');
    const langSelector = document.getElementById('language-selector');
    if (langSelector && this.availableLanguages.length > 0) {
        const currentLang = this.availableLanguages.find(lang => lang.code === this.currentLanguage);
        langSelector.innerHTML = `
            <div class="language-dropdown">
                <button class="language-btn" onclick="window.fileboss.toggleLanguageDropdown()">
                    <span class="flag">${currentLang?.flag || '🌐'}</span>
                    <span class="lang-code">${this.currentLanguage.toUpperCase()}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="language-options" id="language-options">
                    ${this.availableLanguages.map(lang => `
                        <div class="language-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                             onclick="window.fileboss.changeLanguage('${lang.code}')">
                            <span class="flag">${lang.flag}</span>
                            <span class="lang-code-full">${lang.code.toUpperCase()}</span>
                            <span class="completion ${lang.completed === 100 ? 'complete' : 'incomplete'}">
                                ${lang.completed}%
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        langSelector.style.display = 'block';
    }
};

FilebossApp.prototype.toggleLanguageDropdown = function() {
    const options = document.getElementById('language-options');
    const dropdown = document.querySelector('.language-dropdown');
    
    if (options) {
        const isOpen = options.classList.contains('show');
        
        // Close all other dropdowns first
        document.querySelectorAll('.language-options.show').forEach(opt => {
            opt.classList.remove('show');
        });
        
        // Toggle current dropdown
        if (!isOpen) {
            options.classList.add('show');
            dropdown?.classList.add('open');
        } else {
            options.classList.remove('show');
            dropdown?.classList.remove('open');
        }
    }
};

FilebossApp.prototype.getFallbackTranslations = function() {
    return {
        meta: { language: 'Türkçe', code: 'tr', rtl: false },
        app: { 
            title: 'Fileboss v2.0', 
            subtitle: 'Gelişmiş Dosya Uzantısı Değiştirici' 
        },
        header: {
            features: {
                regex: 'REGEX',
                filtering: 'Filtreleme',
                templates: 'Şablonlar'
            }
        },
        steps: {
            step1: 'Klasör Seç',
            step2: 'Ayarları Yapılandır', 
            step3: 'Önizleme & İşle'
        },
        folderSelection: {
            input: {
                placeholder: 'Klasör yolunu girin (örn: C:\\Belgelerim\\Resimler)',
                loadFiles: 'Dosyaları Listele'
            }
        },
        modes: {
            extension: {
                title: 'Uzantı Değiştir',
                description: 'Dosya uzantılarını değiştir'
            },
            regex: {
                title: 'REGEX Kullan',
                description: 'Düzenli ifadeler ile değiştir'
            },
            template: {
                title: 'Şablon Kullan',
                description: 'Özel şablonlar ile yeniden adlandır'
            }
        },
        extensionSettings: {
            oldExtension: 'Mevcut Uzantı',
            newExtension: 'Yeni Uzantı'
        },
        regexSettings: {
            searchPattern: 'Arama Deseni (REGEX)',
            searchPatternHelp: '(.+)\\.txt$',
            replacePattern: 'Değiştirme Deseni',
            replacePatternHelp: '$1.doc'
        },
        templateSettings: {
            namingTemplate: 'İsimlendirme Şablonu',
            startIndex: 'Başlangıç Sayısı',
            testTemplate: 'Şablonu Test Et'
        },
        filters: {
            toggle: 'Göster/Gizle'
        },
        buttons: { 
            loadFiles: 'Dosyaları Listele',
            previewChanges: 'Değişiklikleri Önizle', 
            processFiles: 'İşlemi Başlat',
            backToFolder: 'Klasöre Dön',
            backToSettings: 'Ayarlara Dön'
        },
        notifications: { 
            settingsSaved: 'Ayarlar kaydedildi', 
            languageChanged: 'Dil değiştirildi', 
            languageError: 'Dil yüklenemedi' 
        }
    };
};

FilebossApp.prototype.t = function(key, fallback = '') {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            console.log('🔍 Translation missing:', key, 'using fallback:', fallback);
            return fallback || key;
        }
    }
    
    return value || fallback || key;
};

FilebossApp.prototype.updateUI = function() {
    console.log('🎨 Updating UI with language:', this.currentLanguage);
    // For now, just update title
    document.title = this.t('app.title', 'Fileboss v2.0');
    
    // Update specific UI elements
    this.updateStaticTexts();
    this.updateButtons();
    this.updateLabels();
    this.updatePlaceholders();
    
    // Apply RTL if needed
    const isRTL = this.translations.meta?.rtl || false;
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.classList.toggle('rtl', isRTL);
};

FilebossApp.prototype.updateStaticTexts = function() {
    // Header subtitle
    const subtitle = document.querySelector('.logo .subtitle');
    if (subtitle) {
        subtitle.textContent = this.t('app.subtitle', 'Gelişmiş Dosya Uzantısı Değiştirici');
    }
    
    // Feature badges
    const badges = document.querySelectorAll('.badge');
    if (badges.length >= 3) {
        badges[0].innerHTML = `<i class="fas fa-code"></i> ${this.t('header.features.regex', 'REGEX')}`;
        badges[1].innerHTML = `<i class="fas fa-filter"></i> ${this.t('header.features.filtering', 'Filtreleme')}`;
        badges[2].innerHTML = `<i class="fas fa-magic"></i> ${this.t('header.features.templates', 'Şablonlar')}`;
    }
    
    // Step labels
    const stepLabels = document.querySelectorAll('.step-label');
    if (stepLabels.length >= 3) {
        stepLabels[0].textContent = this.t('steps.step1', 'Klasör Seç');
        stepLabels[1].textContent = this.t('steps.step2', 'Ayarları Yapılandır');
        stepLabels[2].textContent = this.t('steps.step3', 'Önizleme & İşle');
    }
};

FilebossApp.prototype.updateButtons = function() {
    const buttonMappings = {
        'load-files': 'folderSelection.input.loadFiles',
        'preview-changes': 'buttons.previewChanges',
        'process-files': 'buttons.processFiles',
        'back-to-folder': 'buttons.backToFolder',
        'back-to-settings': 'buttons.backToSettings',
        'test-template': 'templateSettings.testTemplate',
        'toggle-filters': 'filters.toggle'
    };

    Object.entries(buttonMappings).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element) {
            const icon = element.querySelector('i');
            const iconHtml = icon ? icon.outerHTML + ' ' : '';
            element.innerHTML = iconHtml + this.t(key, element.textContent.replace(/^.*?\s/, ''));
        }
    });
};

FilebossApp.prototype.updateLabels = function() {
    // Mode titles and descriptions
    const modes = [
        { selector: '[data-mode="extension"] h3', key: 'modes.extension.title' },
        { selector: '[data-mode="extension"] p', key: 'modes.extension.description' },
        { selector: '[data-mode="regex"] h3', key: 'modes.regex.title' },
        { selector: '[data-mode="regex"] p', key: 'modes.regex.description' },
        { selector: '[data-mode="template"] h3', key: 'modes.template.title' },
        { selector: '[data-mode="template"] p', key: 'modes.template.description' }
    ];
    
    modes.forEach(({ selector, key }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = this.t(key, element.textContent);
        }
    });
    
    // Form labels
    const labels = document.querySelectorAll('label[for]');
    labels.forEach(label => {
        const forAttr = label.getAttribute('for');
        const labelMappings = {
            'old-extension': 'extensionSettings.oldExtension',
            'new-extension': 'extensionSettings.newExtension',
            'regex-pattern': 'regexSettings.searchPattern',
            'replace-pattern': 'regexSettings.replacePattern',
            'naming-template': 'templateSettings.namingTemplate',
            'start-index': 'templateSettings.startIndex'
        };
        
        if (labelMappings[forAttr]) {
            label.textContent = this.t(labelMappings[forAttr], label.textContent);
        }
    });
};

FilebossApp.prototype.updatePlaceholders = function() {
    const placeholderMappings = {
        'folder-path': 'folderSelection.input.placeholder',
        'old-extension': 'extensionSettings.oldExtension',
        'new-extension': 'extensionSettings.newExtension',
        'regex-pattern': 'regexSettings.searchPatternHelp',
        'replace-pattern': 'regexSettings.replacePatternHelp'
    };
    
    Object.entries(placeholderMappings).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element) {
            element.placeholder = this.t(key, element.placeholder);
        }
    });
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, initializing Fileboss...');
    window.fileboss = new FilebossApp();
    window.fileboss.init().catch(error => {
        console.error('❌ Fileboss initialization failed:', error);
    });
});

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.step) {
        window.fileboss.loadStep(e.state.step);
    }
});

// Auto-save settings on page unload
window.addEventListener('beforeunload', () => {
    if (window.fileboss) {
        window.fileboss.saveSettings();
    }
});

// Close language dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (window.fileboss && !e.target.closest('.language-dropdown')) {
        const options = document.getElementById('language-options');
        if (options) {
            options.classList.remove('show');
        }
    }
}); 