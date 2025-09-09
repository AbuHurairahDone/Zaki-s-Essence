import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEOService from '../services/seoService';

// Custom hook for managing SEO on each page
export const useSEO = (page, data = {}) => {
    const location = useLocation();

    useEffect(() => {
        // Only update SEO data if we have valid data for product pages
        // This prevents 'undefined' from appearing in the title
        if (page === 'product' && (!data || !data.name)) {
            return; // Skip updating SEO for product pages without valid data
        }
        
        const seoData = SEOService.getPageSEO(page, data);
        SEOService.updatePageMeta(seoData);

        // Add breadcrumb structured data for non-home pages
        if (page !== 'home') {
            const breadcrumbs = generateBreadcrumbs(location.pathname, data);
            if (breadcrumbs.length > 1) {
                const breadcrumbSchema = SEOService.generateBreadcrumbSchema(breadcrumbs);
                SEOService.addStructuredData(breadcrumbSchema);
            }
        }

        // Only scroll to top on actual page navigation, not on data changes
        // Check if this is a real navigation by comparing the pathname
        const shouldScrollToTop = sessionStorage.getItem('lastPathname') !== location.pathname;
        if (shouldScrollToTop) {
            window.scrollTo(0, 0);
            sessionStorage.setItem('lastPathname', location.pathname);
        }
    }, [page, location.pathname, data]); // Include data in dependencies to update when product data changes
};

// Generate breadcrumbs based on current path
const generateBreadcrumbs = (pathname, data = {}) => {
    const baseUrl = 'https://zakisessence.pk';
    const pathSegments = pathname.split('/').filter(segment => segment);

    const breadcrumbs = [
        { name: 'Home', url: baseUrl }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;

        // Customize breadcrumb names based on segment
        let name = segment.charAt(0).toUpperCase() + segment.slice(1);

        switch (segment) {
            case 'shop':
                name = 'Shop';
                break;
            case 'collections':
                name = 'Collections';
                break;
            case 'about':
                name = 'About Us';
                break;
            case 'contact':
                name = 'Contact';
                break;
            case 'products':
                name = 'Products';
                break;
            default:
                // For dynamic segments like product IDs, use data if available
                if (data.name && index === pathSegments.length - 1) {
                    name = data.name;
                }
        }

        breadcrumbs.push({
            name,
            url: `${baseUrl}${currentPath}`
        });
    });

    return breadcrumbs;
};

// Hook for tracking page views (Google Analytics)
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Track page view with Google Analytics
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('config', 'GA_TRACKING_ID', {
                page_path: location.pathname + location.search,
                page_title: document.title
            });
        }

        // Track page view with Facebook Pixel (if implemented)
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
            window.fbq('track', 'PageView');
        }
    }, [location]);
};

// Hook for managing loading states and performance
export const usePerformance = () => {
    useEffect(() => {
        // Mark when the page is fully loaded
        const handleLoad = () => {
            // Remove loading states
            document.body.classList.remove('loading');

            // Add loaded class for CSS transitions
            document.body.classList.add('loaded');

            // Track loading performance
            if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                window.gtag('event', 'page_load_time', {
                    event_category: 'Performance',
                    value: Math.round(performance.now())
                });
            }
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);
};

export default useSEO;
