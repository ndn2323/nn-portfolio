/**
 * Personal Profile Website JavaScript
 * Handles editing functionality, local storage, and interactive features
 */

class ProfileEditor {
    constructor() {
        this.isEditMode = false;
        this.originalData = {};
        this.currentData = {};
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateCurrentYear();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
    }

    /**
     * Load saved data from localStorage
     */
    loadFromStorage() {
        const savedData = localStorage.getItem('profileData');
        if (savedData) {
            try {
                this.currentData = JSON.parse(savedData);
                this.applyDataToDOM();
            } catch (error) {
                console.warn('Error loading saved data:', error);
                this.currentData = {};
            }
        }
        this.storeOriginalData();
    }

    /**
     * Store original data for reset functionality
     */
    storeOriginalData() {
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach(element => {
            const field = element.dataset.field;
            if (!this.currentData[field]) {
                this.originalData[field] = element.textContent.trim();
                this.currentData[field] = element.textContent.trim();
            }
        });
    }

    /**
     * Apply stored data to DOM elements
     */
    applyDataToDOM() {
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach(element => {
            const field = element.dataset.field;
            if (this.currentData[field]) {
                if (element.tagName.toLowerCase() === 'a') {
                    element.href = this.currentData[field];
                } else {
                    element.textContent = this.currentData[field];
                }
            }
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const editToggle = document.getElementById('editToggle');
        const saveButton = document.getElementById('saveChanges');

        editToggle.addEventListener('click', () => this.toggleEditMode());
        saveButton.addEventListener('click', () => this.saveChanges());

        // Bind editable element events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('editable') && this.isEditMode) {
                this.makeEditable(e.target);
            }
        });

        // Handle escape key to exit edit mode
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isEditMode) {
                this.toggleEditMode();
            }
        });

        // Auto-save on blur for editable elements
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('editable') && this.isEditMode) {
                this.updateCurrentData(e.target);
            }
        }, true);
    }

    /**
     * Toggle edit mode on/off
     */
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const body = document.body;
        const editToggle = document.getElementById('editToggle');
        const saveButton = document.getElementById('saveChanges');

        if (this.isEditMode) {
            body.classList.add('edit-mode');
            editToggle.innerHTML = '<i class="fas fa-times"></i><span>Exit Edit</span>';
            saveButton.style.display = 'flex';
            this.showEditingInstructions();
        } else {
            body.classList.remove('edit-mode');
            editToggle.innerHTML = '<i class="fas fa-edit"></i><span>Edit Mode</span>';
            saveButton.style.display = 'none';
            this.clearActiveEditing();
        }
    }

    /**
     * Make an element editable
     */
    makeEditable(element) {
        if (element.isContentEditable) return;

        element.contentEditable = true;
        element.focus();
        
        // Select all text for easy editing
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Handle enter key to finish editing
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
        });
    }

    /**
     * Update current data object with edited content
     */
    updateCurrentData(element) {
        const field = element.dataset.field;
        let value = element.textContent.trim();

        // Special handling for links
        if (element.tagName.toLowerCase() === 'a') {
            // For links, prompt for URL
            if (this.isEditMode && field.includes('link')) {
                const newUrl = prompt('Enter URL:', element.href || '');
                if (newUrl !== null) {
                    value = newUrl;
                    element.href = newUrl;
                }
            }
        }

        this.currentData[field] = value;
        element.contentEditable = false;
    }

    /**
     * Clear any active editing states
     */
    clearActiveEditing() {
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach(element => {
            element.contentEditable = false;
        });
    }

    /**
     * Save changes to localStorage
     */
    saveChanges() {
        try {
            localStorage.setItem('profileData', JSON.stringify(this.currentData));
            this.showSaveConfirmation();
        } catch (error) {
            console.error('Error saving data:', error);
            this.showSaveError();
        }
    }

    /**
     * Show save confirmation
     */
    showSaveConfirmation() {
        const saveButton = document.getElementById('saveChanges');
        const originalHTML = saveButton.innerHTML;
        
        saveButton.innerHTML = '<i class="fas fa-check"></i><span>Saved!</span>';
        saveButton.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            saveButton.innerHTML = originalHTML;
            saveButton.style.backgroundColor = '';
        }, 2000);
    }

    /**
     * Show save error
     */
    showSaveError() {
        const saveButton = document.getElementById('saveChanges');
        const originalHTML = saveButton.innerHTML;
        
        saveButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Error!</span>';
        saveButton.style.backgroundColor = '#f44336';
        
        setTimeout(() => {
            saveButton.innerHTML = originalHTML;
            saveButton.style.backgroundColor = '';
        }, 2000);
    }

    /**
     * Show editing instructions
     */
    showEditingInstructions() {
        // Create and show a temporary notification
        const notification = document.createElement('div');
        notification.className = 'edit-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 80px;
                right: 20px;
                background: var(--navy-blue);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1001;
                max-width: 300px;
                animation: slideInRight 0.3s ease-out;
            ">
                <strong>Edit Mode Active</strong><br>
                Click on any highlighted text to edit it. Press Enter or click outside to finish editing.
                <button onclick="this.parentElement.parentElement.remove()" style="
                    position: absolute;
                    top: 5px;
                    right: 8px;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                ">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Update current year in footer
     */
    updateCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });

            // Close menu when clicking on a link
            navLinks.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        }
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Setup intersection observer for animations
     */
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe sections and cards
        const elementsToObserve = document.querySelectorAll(
            '.skill-card, .portfolio-item, .stat, .about-text, .contact-content'
        );
        
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Export data for backup
     */
    exportData() {
        const dataStr = JSON.stringify(this.currentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'profile-data-backup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Import data from backup
     */
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.currentData = { ...this.currentData, ...importedData };
                this.applyDataToDOM();
                this.saveChanges();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    /**
     * Reset to original data
     */
    resetToDefault() {
        if (confirm('Are you sure you want to reset all content to default? This action cannot be undone.')) {
            this.currentData = { ...this.originalData };
            this.applyDataToDOM();
            this.saveChanges();
        }
    }
}

// Additional utility functions

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Add CSS animation keyframes dynamically
 */
function addAnimationStyles() {
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
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
        
        @media (max-width: 768px) {
            .nav-links.active {
                display: flex;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: white;
                flex-direction: column;
                padding: 1rem 2rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                gap: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add dynamic styles
    addAnimationStyles();
    
    // Initialize the profile editor
    window.profileEditor = new ProfileEditor();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + E to toggle edit mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            window.profileEditor.toggleEditMode();
        }
        
        // Ctrl/Cmd + S to save changes
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && window.profileEditor.isEditMode) {
            e.preventDefault();
            window.profileEditor.saveChanges();
        }
    });
    
    // Add scroll to top functionality
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--sage-green);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', debounce(() => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    }, 100));
    
    // Add loading animation removal
    document.body.classList.add('loaded');
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
