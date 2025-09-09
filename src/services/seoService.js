// SEO Service for managing meta tags and structured data
class SEOService {
    static updatePageMeta(pageData) {
        const {
            title,
            description,
            keywords,
            canonicalUrl,
            ogImage,
            structuredData,
            noIndex = false
        } = pageData;

        // Update document title
        if (title) {
            document.title = title;
            this.updateMetaTag('og:title', title);
            this.updateMetaTag('twitter:title', title);
        }

        // Update meta description
        if (description) {
            this.updateMetaTag('description', description);
            this.updateMetaTag('og:description', description);
            this.updateMetaTag('twitter:description', description);
        }

        // Update keywords
        if (keywords) {
            this.updateMetaTag('keywords', keywords);
        }

        // Update canonical URL
        if (canonicalUrl) {
            this.updateCanonicalUrl(canonicalUrl);
            this.updateMetaTag('og:url', canonicalUrl);
            this.updateMetaTag('twitter:url', canonicalUrl);
        }

        // Update Open Graph image
        if (ogImage) {
            this.updateMetaTag('og:image', ogImage);
            this.updateMetaTag('twitter:image', ogImage);
        }

        // Handle noindex
        if (noIndex) {
            this.updateMetaTag('robots', 'noindex, nofollow');
        } else {
            this.updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        }

        // Add structured data
        if (structuredData) {
            this.addStructuredData(structuredData);
        }
    }

    static updateMetaTag(name, content) {
        // Handle both name and property attributes
        let selector = `meta[name="${name}"]`;
        let meta = document.querySelector(selector);

        if (!meta) {
            selector = `meta[property="${name}"]`;
            meta = document.querySelector(selector);
        }

        if (meta) {
            meta.setAttribute('content', content);
        } else {
            meta = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
        }
    }

    static updateCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', url);
        } else {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            canonical.setAttribute('href', url);
            document.head.appendChild(canonical);
        }
    }

    static addStructuredData(data) {
        // Remove existing structured data for the same type
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => {
            try {
                const jsonData = JSON.parse(script.textContent);
                if (jsonData['@type'] === data['@type']) {
                    script.remove();
                }
            } catch (e) {
                // Invalid JSON, remove anyway
                console.log(e);
                script.remove();
            }
        });

        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    // Generate product structured data
    static generateProductSchema(product) {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images || [],
            "brand": {
                "@type": "Brand",
                "name": "Zaki's Essence"
            },
            "category": "Fragrance",
            "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "PKR",
                "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "url": `https://zakisessence.pk/products/${product.id}`,
                "seller": {
                    "@type": "Organization",
                    "name": "Zaki's Essence"
                }
            },
            "aggregateRating": product.rating ? {
                "@type": "AggregateRating",
                "ratingValue": product.rating.average,
                "reviewCount": product.rating.count
            } : undefined,
            "sku": product.sku || product.id,
            "mpn": product.mpn || product.id
        };
    }


    static generateBreadcrumbSchema(breadcrumbs) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };
    }

    // Generate FAQ structured data
    static generateFAQSchema(faqs) {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    }

    // Generate local business structured data
    static generateLocalBusinessSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            "name": "Zaki's Essence",
            "image": "https://zakisessence.pk/logo.png",
            "description": "Premium luxury fragrances and perfumes online store offering authentic scents and signature collections with worldwide shipping.",
            "url": "https://zakisessence.pk",
            "telephone": "+92-300-1234567",
            "email": "info@zakisessence.pk",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Main Boulevard, Gulberg III",
                "addressLocality": "Lahore",
                "addressRegion": "Punjab",
                "postalCode": "54000",
                "addressCountry": "PK"
            },
            "openingHours": "Mo-Su 09:00-21:00",
            "paymentAccepted": ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash on Delivery"],
            "priceRange": "PKR 2000-15000",
            "currenciesAccepted": "PKR"
        };
    }

    // Page-specific SEO configurations
    static getPageSEO(page, data = {}) {
        const baseUrl = 'https://zakisessence.pk';

        const pageConfigs = {
            home: {
                title: "Zaki's Essence - Premium Luxury Fragrances & Perfumes Online | Buy Authentic Scents",
                description: "Discover premium luxury fragrances at Zaki's Essence. Shop authentic perfumes, colognes & scents online. Free shipping, curated collections, and signature scents for every occasion.",
                keywords: "luxury perfumes, premium fragrances, authentic scents, perfume online, cologne, eau de parfum, designer fragrances, Zaki's Essence, signature scents",
                canonicalUrl: baseUrl,
                ogImage: `${baseUrl}/logo.png`
            },
            shop: {
                title: "Shop Premium Fragrances & Luxury Perfumes | Zaki's Essence Collection",
                description: "Browse our complete collection of premium fragrances and luxury perfumes. Find your perfect scent from our curated selection of authentic designer fragrances.",
                keywords: "shop fragrances, buy perfumes online, luxury perfume collection, designer scents, premium cologne",
                canonicalUrl: `${baseUrl}/shop`,
                ogImage: `${baseUrl}/logo.png`
            },
            product: {
                title: `${data.name} - Premium Fragrance | Zaki's Essence`,
                description: `${data.description || `Discover ${data.name}, a premium fragrance from Zaki's Essence collection. Authentic luxury perfume with free shipping.`}`,
                keywords: `${data.name}, luxury perfume, premium fragrance, authentic scent, ${data.category || 'perfume'}`,
                canonicalUrl: `${baseUrl}/products/${data.id}`,
                ogImage: data.image || `${baseUrl}/logo.png`,
                structuredData: this.generateProductSchema(data)
            },
            collections: {
                title: "Fragrance Collections - Curated Luxury Perfume Sets | Zaki's Essence",
                description: "Explore our curated fragrance collections featuring the finest luxury perfumes and scents. Find themed collections for every occasion and preference.",
                keywords: "fragrance collections, perfume sets, luxury scent collections, curated fragrances, themed perfumes",
                canonicalUrl: `${baseUrl}/collections`,
                ogImage: `${baseUrl}/logo.png`
            },
            about: {
                title: "About Zaki's Essence - Premium Luxury Fragrance Brand Story",
                description: "Learn about Zaki's Essence, our passion for luxury fragrances, and commitment to bringing you the finest authentic perfumes and scents from around the world.",
                keywords: "about Zaki's Essence, luxury fragrance brand, perfume company story, authentic scents",
                canonicalUrl: `${baseUrl}/about`,
                ogImage: `${baseUrl}/logo.png`
            },
            contact: {
                title: "Contact Zaki's Essence - Customer Service & Support",
                description: "Get in touch with Zaki's Essence for customer support, product inquiries, or fragrance consultations. We're here to help you find your perfect scent.",
                keywords: "contact Zaki's Essence, customer service, fragrance consultation, perfume support",
                canonicalUrl: `${baseUrl}/contact`,
                ogImage: `${baseUrl}/logo.png`
            },
            'our-story': {
                title: "Our Story - Zaki's Essence",
                description: "Discover the story behind Zaki's Essence, our passion for fragrances, and our commitment to quality.",
                keywords: "Zaki's Essence story, brand history, fragrance passion, quality commitment",
                canonicalUrl: `${baseUrl}/our-story`,
                ogImage: `${baseUrl}/logo.png`
            },
            'review-order': {
                title: "Review Your Order - Zaki's Essence",
                description: "Provide feedback and review your recent order from Zaki's Essence.",
                keywords: "review order, order feedback, Zaki's Essence review, product review",
                canonicalUrl: `${baseUrl}/review-order`,
                ogImage: `${baseUrl}/logo.png`
            },
            'track-order': {
                title: "Track Your Order - Zaki's Essence",
                description: "Easily track the status of your recent orders with Zaki's Essence.",
                keywords: "track order, order status, Zaki's Essence order, shipping tracking",
                canonicalUrl: `${baseUrl}/track-order`,
                ogImage: `${baseUrl}/logo.png`
            }
        };

        return pageConfigs[page] || pageConfigs.home;
    }

    // Generate sitemap data
    static generateSitemapData(products = [], collections = []) {
        const baseUrl = 'https://zakisessence.pk';
        const now = new Date().toISOString();

        const staticPages = [
            { url: baseUrl, lastmod: now, changefreq: 'daily', priority: '1.0' },
            { url: `${baseUrl}/shop`, lastmod: now, changefreq: 'daily', priority: '0.9' },
            { url: `${baseUrl}/collections`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
            { url: `${baseUrl}/about`, lastmod: now, changefreq: 'monthly', priority: '0.6' },
            { url: `${baseUrl}/contact`, lastmod: now, changefreq: 'monthly', priority: '0.5' }
        ];

        const productPages = products.map(product => ({
            url: `${baseUrl}/products/${product.id}`,
            lastmod: product.updatedAt || now,
            changefreq: 'weekly',
            priority: '0.7'
        }));

        const collectionPages = collections.map(collection => ({
            url: `${baseUrl}/collections/${collection.id}`,
            lastmod: collection.updatedAt || now,
            changefreq: 'weekly',
            priority: '0.6'
        }));

        return [...staticPages, ...productPages, ...collectionPages];
    }
}

export default SEOService;
