// Google Tag Manager service for tracking events and conversions
class GTMService {
    // Initialize GTM data layer
    static initializeDataLayer() {
        window.dataLayer = window.dataLayer || [];

        // Set up enhanced ecommerce data layer
        this.pushToDataLayer({
            event: 'gtm.init',
            website: {
                name: "Zaki's Essence",
                domain: "zakisessence.pk",
                currency: "PKR",
                category: "E-commerce",
                type: "Fragrance Store"
            }
        });
    }

    // Generic function to push data to GTM data layer
    static pushToDataLayer(data) {
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push(data);
        }
    }

    // Track page views
    static trackPageView(pageName, pageData = {}) {
        this.pushToDataLayer({
            event: 'page_view',
            page_title: document.title,
            page_location: window.location.href,
            page_name: pageName,
            ...pageData
        });
    }

    // Track product views
    static trackProductView(product) {
        this.pushToDataLayer({
            event: 'view_item',
            ecommerce: {
                currency: 'PKR',
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    item_brand: "Zaki's Essence",
                    price: product.price,
                    quantity: 1
                }]
            }
        });
    }

    // Track add to cart events
    static trackAddToCart(product, variant = null, quantity = 1) {
        this.pushToDataLayer({
            event: 'add_to_cart',
            ecommerce: {
                currency: 'PKR',
                value: product.price * quantity,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    item_variant: variant,
                    item_brand: "Zaki's Essence",
                    price: product.price,
                    quantity: quantity
                }]
            }
        });
    }

    // Track remove from cart events
    static trackRemoveFromCart(product, variant = null, quantity = 1) {
        this.pushToDataLayer({
            event: 'remove_from_cart',
            ecommerce: {
                currency: 'PKR',
                value: product.price * quantity,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    item_variant: variant,
                    item_brand: "Zaki's Essence",
                    price: product.price,
                    quantity: quantity
                }]
            }
        });
    }

    // Track view cart events
    static trackViewCart(cartItems, totalValue) {
        const items = cartItems.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            item_variant: item.variant,
            item_brand: "Zaki's Essence",
            price: item.price,
            quantity: item.quantity
        }));

        this.pushToDataLayer({
            event: 'view_cart',
            ecommerce: {
                currency: 'PKR',
                value: totalValue,
                items: items
            }
        });
    }

    // Track begin checkout events
    static trackBeginCheckout(cartItems, totalValue) {
        const items = cartItems.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            item_variant: item.variant,
            item_brand: "Zaki's Essence",
            price: item.price,
            quantity: item.quantity
        }));

        this.pushToDataLayer({
            event: 'begin_checkout',
            ecommerce: {
                currency: 'PKR',
                value: totalValue,
                items: items
            }
        });
    }

    // Track purchase events
    static trackPurchase(orderId, cartItems, totalValue, shipping = 0, tax = 0) {
        const items = cartItems.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            item_variant: item.variant,
            item_brand: "Zaki's Essence",
            price: item.price,
            quantity: item.quantity
        }));

        this.pushToDataLayer({
            event: 'purchase',
            ecommerce: {
                transaction_id: orderId,
                value: totalValue,
                tax: tax,
                shipping: shipping,
                currency: 'PKR',
                items: items
            }
        });
    }

    // Track search events
    static trackSearch(searchTerm, results = 0) {
        this.pushToDataLayer({
            event: 'search',
            search_term: searchTerm,
            search_results: results
        });
    }

    // Track newsletter signup
    static trackNewsletterSignup(email) {
        this.pushToDataLayer({
            event: 'sign_up',
            method: 'newsletter',
            email: email
        });
    }

    // Track contact form submission
    static trackContactForm(formData) {
        this.pushToDataLayer({
            event: 'contact_form_submit',
            form_name: 'contact',
            contact_method: formData.preferredContact || 'email'
        });
    }

    // Track scroll depth
    static trackScrollDepth(percentage) {
        this.pushToDataLayer({
            event: 'scroll',
            scroll_depth: percentage
        });
    }

    // Track file downloads
    static trackFileDownload(fileName, fileType) {
        this.pushToDataLayer({
            event: 'file_download',
            file_name: fileName,
            file_type: fileType
        });
    }

    // Track outbound link clicks
    static trackOutboundLink(url, linkText) {
        this.pushToDataLayer({
            event: 'click',
            link_classes: 'outbound',
            link_url: url,
            link_text: linkText
        });
    }

    // Track video interactions
    static trackVideoPlay(videoTitle, videoDuration) {
        this.pushToDataLayer({
            event: 'video_start',
            video_title: videoTitle,
            video_duration: videoDuration
        });
    }

    // Track custom events
    static trackCustomEvent(eventName, parameters = {}) {
        this.pushToDataLayer({
            event: eventName,
            ...parameters
        });
    }

    // Track user engagement
    static trackEngagement(action, category = 'engagement') {
        this.pushToDataLayer({
            event: 'engagement',
            event_category: category,
            event_action: action
        });
    }

    // Track collection views
    static trackCollectionView(collectionName, productsCount) {
        this.pushToDataLayer({
            event: 'view_item_list',
            item_list_name: collectionName,
            items_count: productsCount
        });
    }

    // Track filter usage
    static trackFilterUsage(filterType, filterValue) {
        this.pushToDataLayer({
            event: 'filter_products',
            filter_type: filterType,
            filter_value: filterValue
        });
    }

    // Track social media clicks
    static trackSocialClick(platform, action = 'click') {
        this.pushToDataLayer({
            event: 'social_click',
            social_platform: platform,
            social_action: action
        });
    }

    // Enhanced ecommerce - select item
    static trackSelectItem(product, listName = 'search results') {
        this.pushToDataLayer({
            event: 'select_item',
            item_list_name: listName,
            ecommerce: {
                currency: 'PKR',
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    item_brand: "Zaki's Essence",
                    price: product.price,
                    quantity: 1
                }]
            }
        });
    }

    // Track promotional banner clicks
    static trackPromotionClick(promotionId, promotionName, creativeName = '') {
        this.pushToDataLayer({
            event: 'select_promotion',
            ecommerce: {
                promotion_id: promotionId,
                promotion_name: promotionName,
                creative_name: creativeName
            }
        });
    }

    // Track wishlist actions
    static trackAddToWishlist(product) {
        this.pushToDataLayer({
            event: 'add_to_wishlist',
            ecommerce: {
                currency: 'PKR',
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    item_brand: "Zaki's Essence",
                    price: product.price,
                    quantity: 1
                }]
            }
        });
    }
}

export default GTMService;
