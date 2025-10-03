// Theme Management
class ThemeManager {
    constructor() {
        this.themeKey = 'teamconnect-theme';
        this.init();
    }

    init() {
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem(this.themeKey) || 'light';
        this.setTheme(savedTheme);
        
        // Setup theme toggle button
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
            this.updateThemeButton();
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.themeKey, theme);
        this.currentTheme = theme;
        this.updateThemeButton();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateThemeButton() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (this.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
}

// File Upload Enhancement
class FileUploader {
    constructor() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.removeBtn = document.getElementById('remove-file');
        this.uploadBtn = document.getElementById('upload-btn');
        
        if (this.uploadArea && this.fileInput) {
            this.init();
        }
    }

    init() {
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.fileInput.files = files;
                this.handleFileSelect();
            }
        });

        // File input change
        this.fileInput.addEventListener('change', () => {
            this.handleFileSelect();
        });

        // Remove file button
        if (this.removeBtn) {
            this.removeBtn.addEventListener('click', () => {
                this.clearFile();
            });
        }
    }

    handleFileSelect() {
        const file = this.fileInput.files[0];
        if (file) {
            this.fileName.textContent = file.name;
            this.fileSize.textContent = this.formatFileSize(file.size);
            this.fileInfo.style.display = 'block';
            this.uploadBtn.disabled = false;
        }
    }

    clearFile() {
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        this.uploadBtn.disabled = true;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Code Preview
class CodePreviewer {
    constructor() {
        this.codeTextarea = document.getElementById('code');
        this.languageSelect = document.getElementById('language');
        this.previewBtn = document.getElementById('preview-btn');
        this.previewSection = document.getElementById('code-preview');
        this.previewCode = document.getElementById('preview-code');
        
        if (this.codeTextarea && this.languageSelect && this.previewBtn) {
            this.init();
        }
    }

    init() {
        this.previewBtn.addEventListener('click', () => {
            this.togglePreview();
        });

        // Auto-preview on language change
        this.languageSelect.addEventListener('change', () => {
            if (this.previewSection.style.display !== 'none') {
                this.showPreview();
            }
        });
    }

    togglePreview() {
        if (this.previewSection.style.display === 'none') {
            this.showPreview();
        } else {
            this.hidePreview();
        }
    }

    showPreview() {
        const code = this.codeTextarea.value;
        const language = this.languageSelect.value;
        
        this.previewCode.textContent = code;
        this.previewCode.className = `language-${language}`;
        
        // Re-highlight with Prism
        if (window.Prism) {
            Prism.highlightElement(this.previewCode);
        }
        
        this.previewSection.style.display = 'block';
        this.previewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Preview';
    }

    hidePreview() {
        this.previewSection.style.display = 'none';
        this.previewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
    }
}

// Tab Management
class TabManager {
    constructor() {
        this.init();
    }

    init() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId, tabButtons, tabContents);
            });
        });
    }

    switchTab(activeTabId, tabButtons, tabContents) {
        // Remove active class from all buttons and contents
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        const activeButton = document.querySelector(`[data-tab="${activeTabId}"]`);
        const activeContent = document.getElementById(`${activeTabId}-content`);

        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');
        }
    }
}

// Mobile Navigation
class MobileNavigation {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.mobileNavBtn = document.getElementById('mobile-nav-btn');
        this.init();
    }

    init() {
        if (this.mobileNavBtn) {
            this.mobileNavBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (this.sidebar && !this.sidebar.contains(e.target) && !this.mobileNavBtn.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeSidebar();
            }
        });
    }

    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('mobile-open');
        }
    }

    closeSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('mobile-open');
        }
    }
}

// Message Form Toggle
function toggleMessageForm() {
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        if (messageForm.style.display === 'none' || !messageForm.style.display) {
            messageForm.style.display = 'block';
            messageForm.scrollIntoView({ behavior: 'smooth' });
        } else {
            messageForm.style.display = 'none';
        }
    }
}

// Show Recent Activity (scroll to activity section)
function showRecentActivity() {
    const activitySection = document.querySelector('.recent-activity-section');
    if (activitySection) {
        activitySection.scrollIntoView({ behavior: 'smooth' });
    }
}

// AJAX Delete Functions
async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }

    try {
        const response = await fetch(`/file/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        
        if (result.success) {
            // Refresh the page to update the file list
            window.location.reload();
        } else {
            alert('Error deleting file: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting file. Please try again.');
    }
}

async function deleteSnippet(snippetId) {
    if (!confirm('Are you sure you want to delete this code snippet?')) {
        return;
    }

    try {
        const response = await fetch(`/snippet/${snippetId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        
        if (result.success) {
            // Refresh the page to update the snippets list
            window.location.reload();
        } else {
            alert('Error deleting snippet: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting snippet. Please try again.');
    }
}

// Auto-refresh functionality for dashboard
class DashboardRefresher {
    constructor() {
        this.refreshInterval = 30000; // 30 seconds
        this.isActive = false;
        
        if (window.location.pathname === '/dashboard') {
            this.init();
        }
    }

    init() {
        // Only auto-refresh if user is active
        this.setupActivityTracking();
        this.startRefresh();
    }

    setupActivityTracking() {
        let lastActivity = Date.now();
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
                this.isActive = true;
            }, true);
        });

        // Check if user is inactive
        setInterval(() => {
            this.isActive = (Date.now() - lastActivity) < 60000; // 1 minute
        }, 10000);
    }

    startRefresh() {
        setInterval(() => {
            if (this.isActive && document.hasFocus()) {
                this.refreshContent();
            }
        }, this.refreshInterval);
    }

    async refreshContent() {
        try {
            // Only refresh activity section to avoid disrupting user
            const response = await fetch('/dashboard');
            if (response.ok) {
                // You could implement partial refresh here
                // For now, we'll just update the timestamp display
                this.updateTimestamps();
            }
        } catch (error) {
            console.log('Refresh failed:', error);
        }
    }

    updateTimestamps() {
        // Update relative timestamps
        const timestamps = document.querySelectorAll('.timestamp');
        timestamps.forEach(timestamp => {
            const time = timestamp.textContent;
            if (time && time !== 'Never' && time !== 'N/A') {
                // You could implement relative time display here
                // e.g., "2 minutes ago" instead of absolute timestamp
            }
        });
    }
}

// Search and Filter
class ContentFilter {
    constructor() {
        this.init();
    }

    init() {
        const searchInput = document.getElementById('content-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterContent(e.target.value);
            });
        }
    }

    filterContent(searchTerm) {
        const term = searchTerm.toLowerCase();
        
        // Filter files
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            const fileName = item.querySelector('.file-info h3').textContent.toLowerCase();
            const author = item.querySelector('.author').textContent.toLowerCase();
            
            if (fileName.includes(term) || author.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        // Filter snippets
        const snippetItems = document.querySelectorAll('.snippet-item');
        snippetItems.forEach(item => {
            const title = item.querySelector('.snippet-header h3').textContent.toLowerCase();
            const code = item.querySelector('code').textContent.toLowerCase();
            const author = item.querySelector('.author').textContent.toLowerCase();
            
            if (title.includes(term) || code.includes(term) || author.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Filter messages
        const messageItems = document.querySelectorAll('.message-item');
        messageItems.forEach(item => {
            const content = item.querySelector('.content-body p').textContent.toLowerCase();
            const author = item.querySelector('.author').textContent.toLowerCase();
            
            if (content.includes(term) || author.includes(term)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Notification System
class NotificationManager {
    constructor() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 300px;
        `;
        document.body.appendChild(container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 16px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px var(--shadow-color);
            transform: translateX(320px);
            transition: transform 0.3s ease;
        `;

        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="${icon}" style="color: var(--${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}-color);"></i>
                <span style="color: var(--text-primary);">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.style.transform = 'translateX(320px)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }, duration);
        }
    }

    getIcon(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    new ThemeManager();
    new FileUploader();
    new CodePreviewer();
    new DashboardRefresher();
    new ContentFilter();
    new TabManager();
    new MobileNavigation();
    window.notifications = new NotificationManager();

    // Initialize Prism syntax highlighting for existing code blocks
    if (window.Prism) {
        Prism.highlightAll();
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitBtn.disabled = true;
                
                // Re-enable after 5 seconds as fallback
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    });

    // Show welcome notification on dashboard
    if (window.location.pathname === '/dashboard' && window.notifications) {
        setTimeout(() => {
            window.notifications.show('Welcome to TeamConnect! Share and collaborate with your team.', 'info', 3000);
        }, 1000);
    }

    console.log('TeamConnect initialized successfully!');
});

// Global utility functions
window.TeamConnect = {
    deleteFile: deleteFile,
    deleteSnippet: deleteSnippet,
    toggleMessageForm: toggleMessageForm,
    
    // Utility to copy code to clipboard
    copyCode: function(element) {
        const code = element.closest('.snippet-code').querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            window.notifications.show('Code copied to clipboard!', 'success', 2000);
        }).catch(() => {
            window.notifications.show('Failed to copy code', 'error', 2000);
        });
    },

    // Utility to format dates
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
        return date.toLocaleDateString();
    }
};