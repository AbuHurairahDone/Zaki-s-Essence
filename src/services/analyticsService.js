import { analytics } from '../config/firebase.js';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';

export class AnalyticsService {
    // Initialize analytics with user properties
    static initializeUser(user) {
        if (!analytics) return;

        try {
            if (user) {
                setUserId(analytics, user.uid);
                setUserProperties(analytics, {
                    user_type: user.isAdmin ? 'admin' : 'customer',
                    sign_up_method: 'email'
                });
            }
        } catch (error) {
            console.error('Error initializing analytics user:', error);
        }
    }

    // Page view tracking
    static trackPageView(pageName, pageTitle = null) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'page_view', {
                page_title: pageTitle || pageName,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        } catch (error) {
            console.error('Error tracking page view:', error);
        }
    }

    // E-commerce Events

    // Track product views
    static trackProductView(product) {
        if (!analytics || !product) return;

        try {
            logEvent(analytics, 'view_item', {
                currency: 'PKR',
                value: product.price,
                item_id: product.id,
                item_name: product.name,
                item_category: product.collection || 'fragrance',
                item_brand: 'Zakis Essence',
                quantity: 1
            });
        } catch (error) {
            console.error('Error tracking product view:', error);
        }
    }

    // Track add to cart
    static trackAddToCart(product, variant, quantity = 1) {
        if (!analytics || !product) return;

        try {
            logEvent(analytics, 'add_to_cart', {
                currency: 'PKR',
                value: product.price * quantity,
                item_id: product.id,
                item_name: product.name,
                item_category: product.collection || 'fragrance',
                item_variant: variant,
                item_brand: 'Zakis Essence',
                quantity: quantity
            });
        } catch (error) {
            console.error('Error tracking add to cart:', error);
        }
    }

    // Track remove from cart
    static trackRemoveFromCart(product, variant, quantity = 1) {
        if (!analytics || !product) return;

        try {
            logEvent(analytics, 'remove_from_cart', {
                currency: 'PKR',
                value: product.price * quantity,
                item_id: product.id,
                item_name: product.name,
                item_category: product.collection || 'fragrance',
                item_variant: variant,
                item_brand: 'Zakis Essence',
                quantity: quantity
            });
        } catch (error) {
            console.error('Error tracking remove from cart:', error);
        }
    }

    // Track cart view
    static trackViewCart(cartItems, totalValue) {
        if (!analytics) return;

        try {
            const items = cartItems.map(item => ({
                item_id: item.product.id,
                item_name: item.product.name,
                item_category: item.product.collection || 'fragrance',
                item_variant: item.variant,
                item_brand: 'Zakis Essence',
                price: item.product.price,
                quantity: item.quantity
            }));

            logEvent(analytics, 'view_cart', {
                currency: 'PKR',
                value: totalValue,
                items: items
            });
        } catch (error) {
            console.error('Error tracking cart view:', error);
        }
    }

    // Track checkout initiation
    static trackBeginCheckout(cartItems, totalValue) {
        if (!analytics) return;

        try {
            const items = cartItems.map(item => ({
                item_id: item.product.id,
                item_name: item.product.name,
                item_category: item.product.collection || 'fragrance',
                item_variant: item.variant,
                item_brand: 'Zakis Essence',
                price: item.product.price,
                quantity: item.quantity
            }));

            logEvent(analytics, 'begin_checkout', {
                currency: 'PKR',
                value: totalValue,
                items: items,
                coupon: 'N/A' // Add if you have coupon system
            });
        } catch (error) {
            console.error('Error tracking checkout begin:', error);
        }
    }

    // Track successful purchase
    static trackPurchase(order) {
        if (!analytics || !order) return;

        try {
            const items = order.items?.map(item => ({
                item_id: item.product.id,
                item_name: item.product.name,
                item_category: item.product.collection || 'fragrance',
                item_variant: item.variant,
                item_brand: 'Zakis Essence',
                price: item.product.price,
                quantity: item.quantity
            })) || [];

            logEvent(analytics, 'purchase', {
                transaction_id: order.orderNumber,
                currency: 'PKR',
                value: order.totalAmount,
                shipping: 0, // Add shipping cost if applicable
                tax: 0, // Add tax if applicable
                items: items
            });
        } catch (error) {
            console.error('Error tracking purchase:', error);
        }
    }

    // Search tracking
    static trackSearch(searchTerm, searchResults = 0) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'search', {
                search_term: searchTerm,
                results_count: searchResults
            });
        } catch (error) {
            console.error('Error tracking search:', error);
        }
    }

    // User engagement events

    // Track newsletter signup
    static trackNewsletterSignup(email) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'sign_up', {
                method: 'newsletter',
                email_provided: !!email
            });
        } catch (error) {
            console.error('Error tracking newsletter signup:', error);
        }
    }

    // Track user login
    static trackLogin(method = 'email') {
        if (!analytics) return;

        try {
            logEvent(analytics, 'login', {
                method: method
            });
        } catch (error) {
            console.error('Error tracking login:', error);
        }
    }

    // Track user signup
    static trackSignup(method = 'email') {
        if (!analytics) return;

        try {
            logEvent(analytics, 'sign_up', {
                method: method
            });
        } catch (error) {
            console.error('Error tracking signup:', error);
        }
    }

    // Custom events for admin actions

    // Track admin actions
    static trackAdminAction(action, details = {}) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'admin_action', {
                action_type: action,
                ...details
            });
        } catch (error) {
            console.error('Error tracking admin action:', error);
        }
    }

    // Track product management
    static trackProductManagement(action, productId, productName) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'product_management', {
                action: action, // 'create', 'update', 'delete'
                product_id: productId,
                product_name: productName
            });
        } catch (error) {
            console.error('Error tracking product management:', error);
        }
    }

    // Track order management
    static trackOrderManagement(action, orderId, newStatus = null) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'order_management', {
                action: action, // 'status_update', 'view', 'export'
                order_id: orderId,
                new_status: newStatus
            });
        } catch (error) {
            console.error('Error tracking order management:', error);
        }
    }

    // Track data exports
    static trackDataExport(exportType, recordCount) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'data_export', {
                export_type: exportType, // 'orders', 'products', 'inventory'
                record_count: recordCount
            });
        } catch (error) {
            console.error('Error tracking data export:', error);
        }
    }

    // Conversion funnel tracking
    static trackFunnelStep(step, stepName, additionalData = {}) {
        if (!analytics) return;

        try {
            logEvent(analytics, 'funnel_step', {
                step_number: step,
                step_name: stepName,
                ...additionalData
            });
        } catch (error) {
            console.error('Error tracking funnel step:', error);
        }
    }

    // Performance tracking
    static trackPerformance(metric, value, category = 'general') {
        if (!analytics) return;

        try {
            logEvent(analytics, 'performance_metric', {
                metric_name: metric,
                metric_value: value,
                metric_category: category
            });
        } catch (error) {
            console.error('Error tracking performance:', error);
        }
    }

    // Error tracking
    static trackError(errorType, errorMessage, context = '') {
        if (!analytics) return;

        try {
            logEvent(analytics, 'app_error', {
                error_type: errorType,
                error_message: errorMessage,
                error_context: context
            });
        } catch (error) {
            console.error('Error tracking error:', error);
        }
    }
}
