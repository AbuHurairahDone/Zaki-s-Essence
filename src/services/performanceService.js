// Performance optimization service
class PerformanceService {
    constructor() {
        this.loadedModules = new Set();
        this.preloadQueue = [];
        this.observer = null;
        this.init();
    }

    init() {
        // Initialize Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadModule(entry.target.dataset.module);
                            this.observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '50px' }
            );
        }

        // Preload critical modules after page load
        window.addEventListener('load', () => {
            this.preloadCriticalModules();
        });

        // Setup performance monitoring
        this.setupPerformanceMonitoring();
    }

    // Dynamic import with caching
    async loadModule(moduleName, retries = 3) {
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }

        try {
            let module;
            switch (moduleName) {
                case 'charts':
                    module = await import('recharts');
                    break;
                case 'xlsx':
                    module = await import('xlsx');
                    break;
                case 'phone-input':
                    module = await import('react-phone-input-2');
                    break;
                case 'select':
                    module = await import('react-select');
                    break;
                case 'country-state':
                    module = await import('react-country-state-city');
                    break;
                default:
                    throw new Error(`Unknown module: ${moduleName}`);
            }

            this.loadedModules.add(moduleName);
            return module;
        } catch (error) {
            if (retries > 0) {
                console.warn(`Failed to load module ${moduleName}, retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.loadModule(moduleName, retries - 1);
            }
            console.error(`Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    // Preload modules that are likely to be needed
    preloadCriticalModules() {
        const criticalModules = ['charts', 'phone-input'];
        criticalModules.forEach(module => {
            if (!this.loadedModules.has(module)) {
                this.preloadQueue.push(module);
            }
        });

        // Load modules with delay to avoid blocking
        this.processPreloadQueue();
    }

    async processPreloadQueue() {
        while (this.preloadQueue.length > 0) {
            const module = this.preloadQueue.shift();
            try {
                await this.loadModule(module);
                // Add delay between loads to prevent blocking
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn(`Failed to preload module ${module}:`, error);
            }
        }
    }

    // Setup lazy loading for components
    setupLazyLoading(element, moduleName) {
        if (this.observer && element) {
            element.dataset.module = moduleName;
            this.observer.observe(element);
        }
    }

    // Remove unused event listeners and clean up
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            this.measureWebVitals();
        }

        // Monitor bundle sizes
        this.monitorBundleSize();
    }

    measureWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    monitorBundleSize() {
        // Log initial bundle size
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry) {
            console.log('Initial bundle transfer size:', navigationEntry.transferSize);
        }

        // Monitor additional resource loads
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (entry.name.includes('.js') || entry.name.includes('.css')) {
                    console.log(`Resource loaded: ${entry.name}, Size: ${entry.transferSize}`);
                }
            });
        }).observe({ entryTypes: ['resource'] });
    }

    // Image optimization utilities
    optimizeImage(src, options = {}) {
        const {
            width = 800,
            height = 600,
            quality = 80,
            format = 'webp'
        } = options;

        // If it's a Cloudinary URL, add optimization parameters
        if (src.includes('cloudinary.com')) {
            const baseUrl = src.split('/upload/')[0];
            const imagePath = src.split('/upload/')[1];
            return `${baseUrl}/upload/f_${format},q_${quality},w_${width},h_${height},c_fill/${imagePath}`;
        }

        // For other images, return as-is (could implement other CDN optimizations)
        return src;
    }

    // Debounce utility for performance
    debounce(func, wait) {
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

    // Throttle utility for performance
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Create singleton instance
const performanceService = new PerformanceService();

// Export utilities
export const {
    loadModule,
    setupLazyLoading,
    optimizeImage,
    debounce,
    throttle
} = performanceService;

export default performanceService;
