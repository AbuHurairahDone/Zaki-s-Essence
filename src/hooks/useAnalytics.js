import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '../services/analyticsService.js';

// Hook to track page views on route changes
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Get page name from pathname
        const pageName = getPageNameFromPath(location.pathname);
        const pageTitle = getPageTitleFromPath(location.pathname);

        // Track page view
        AnalyticsService.trackPageView(pageName, pageTitle);
    }, [location]);
};

// Helper function to get readable page name from path
const getPageNameFromPath = (pathname) => {
    const pathMap = {
        '/': 'Home',
        '/admin': 'Admin Dashboard',
        '/admin/dashboard': 'Admin Dashboard',
        '/admin/products': 'Admin Products',
        '/admin/collections': 'Admin Collections',
        '/admin/orders': 'Admin Orders',
        '/admin/inventory': 'Admin Inventory',
        '/admin/hero-images': 'Admin Hero Images'
    };

    // Check for exact matches first
    if (pathMap[pathname]) {
        return pathMap[pathname];
    }

    // Handle dynamic routes
    if (pathname.startsWith('/admin/')) {
        return `Admin ${pathname.split('/')[2] || 'Panel'}`;
    }

    // Default fallback
    return pathname === '/' ? 'Home' : pathname.replace('/', '').replace('-', ' ');
};

// Helper function to get page title from path
const getPageTitleFromPath = (pathname) => {
    const titleMap = {
        '/': 'Zaki\'s Essence - Premium Fragrances',
        '/admin': 'Admin Dashboard - Zaki\'s Essence',
        '/admin/dashboard': 'Dashboard - Admin Panel',
        '/admin/products': 'Product Management - Admin Panel',
        '/admin/collections': 'Collection Management - Admin Panel',
        '/admin/orders': 'Order Management - Admin Panel',
        '/admin/inventory': 'Inventory Management - Admin Panel',
        '/admin/hero-images': 'Hero Image Management - Admin Panel'
    };

    return titleMap[pathname] || `${getPageNameFromPath(pathname)} - Zaki's Essence`;
};

// Hook for tracking search events
export const useSearchTracking = () => {
    const trackSearch = (searchTerm, resultsCount = 0, source = 'general') => {
        AnalyticsService.trackSearch(searchTerm, resultsCount);
        AnalyticsService.trackFunnelStep(0, 'search_performed', {
            search_term: searchTerm,
            results_count: resultsCount,
            search_source: source
        });
    };

    return { trackSearch };
};

// Hook for tracking performance metrics
export const usePerformanceTracking = () => {
    useEffect(() => {
        // Track page load time
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
            const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].loadEventStart;
            if (loadTime > 0) {
                AnalyticsService.trackPerformance('page_load_time', Math.round(loadTime), 'navigation');
            }
        }

        // Track initial paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            AnalyticsService.trackPerformance(entry.name, Math.round(entry.startTime), 'paint');
        });

        // Track largest contentful paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    if (lastEntry) {
                        AnalyticsService.trackPerformance('largest_contentful_paint', Math.round(lastEntry.startTime), 'performance');
                    }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                console.warn('Performance observer not supported:', error);
            }
        }
    }, []);
};
