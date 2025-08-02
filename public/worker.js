// Web Worker for heavy computations to reduce main thread blocking
self.onmessage = function (e) {
    const { type, data } = e.data;

    switch (type) {
        case 'PROCESS_LARGE_DATASET':
            processLargeDataset(data);
            break;
        case 'OPTIMIZE_IMAGES':
            optimizeImages(data);
            break;
        case 'CALCULATE_ANALYTICS':
            calculateAnalytics(data);
            break;
        case 'SEARCH_PRODUCTS':
            searchProducts(data);
            break;
        default:
            self.postMessage({ error: 'Unknown task type' });
    }
};

// Process large datasets without blocking UI
function processLargeDataset(data) {
    try {
        const { items, chunkSize = 1000 } = data;
        const results = [];

        // Process in chunks to avoid blocking
        for (let i = 0; i < items.length; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            const processedChunk = chunk.map(item => ({
                ...item,
                processed: true,
                timestamp: Date.now()
            }));

            results.push(...processedChunk);

            // Allow other tasks to run
            if (i % (chunkSize * 5) === 0) {
                setTimeout(() => { }, 0);
            }
        }

        self.postMessage({
            type: 'DATASET_PROCESSED',
            data: results
        });
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message
        });
    }
}

// Optimize image metadata and calculations
function optimizeImages(data) {
    try {
        const { images } = data;
        const optimized = images.map(image => {
            // Calculate optimal dimensions
            const aspectRatio = image.width / image.height;
            const maxWidth = 1920;
            const maxHeight = 1080;

            let newWidth = image.width;
            let newHeight = image.height;

            if (newWidth > maxWidth) {
                newWidth = maxWidth;
                newHeight = newWidth / aspectRatio;
            }

            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = newHeight * aspectRatio;
            }

            return {
                ...image,
                optimized: {
                    width: Math.round(newWidth),
                    height: Math.round(newHeight),
                    quality: image.size > 500000 ? 75 : 85, // Lower quality for large files
                    format: image.type.includes('png') ? 'webp' : 'auto'
                }
            };
        });

        self.postMessage({
            type: 'IMAGES_OPTIMIZED',
            data: optimized
        });
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message
        });
    }
}

// Calculate complex analytics without blocking UI
function calculateAnalytics(data) {
    try {
        const { orders, products, timeRange } = data;

        // Revenue calculations
        const revenue = orders.reduce((total, order) => {
            const orderDate = new Date(order.date);
            if (orderDate >= timeRange.start && orderDate <= timeRange.end) {
                return total + order.total;
            }
            return total;
        }, 0);

        // Product performance
        const productPerformance = products.map(product => {
            const productOrders = orders.filter(order =>
                order.items.some(item => item.productId === product.id)
            );

            const totalSold = productOrders.reduce((sum, order) => {
                const item = order.items.find(i => i.productId === product.id);
                return sum + (item ? item.quantity : 0);
            }, 0);

            const revenue = productOrders.reduce((sum, order) => {
                const item = order.items.find(i => i.productId === product.id);
                return sum + (item ? item.price * item.quantity : 0);
            }, 0);

            return {
                ...product,
                analytics: {
                    totalSold,
                    revenue,
                    conversionRate: totalSold / (product.views || 1),
                    avgOrderValue: revenue / (totalSold || 1)
                }
            };
        });

        // Customer insights
        const customerInsights = {
            totalCustomers: new Set(orders.map(o => o.customerId)).size,
            repeatCustomers: orders.reduce((acc, order) => {
                acc[order.customerId] = (acc[order.customerId] || 0) + 1;
                return acc;
            }, {}),
            avgOrderValue: revenue / orders.length
        };

        self.postMessage({
            type: 'ANALYTICS_CALCULATED',
            data: {
                revenue,
                productPerformance,
                customerInsights,
                calculatedAt: Date.now()
            }
        });
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message
        });
    }
}

// Advanced product search with fuzzy matching
function searchProducts(data) {
    try {
        const { products, query, filters } = data;

        // Fuzzy search implementation
        function fuzzyMatch(text, pattern) {
            const textLower = text.toLowerCase();
            const patternLower = pattern.toLowerCase();

            let textIndex = 0;
            let patternIndex = 0;
            let score = 0;

            while (textIndex < textLower.length && patternIndex < patternLower.length) {
                if (textLower[textIndex] === patternLower[patternIndex]) {
                    score++;
                    patternIndex++;
                }
                textIndex++;
            }

            return patternIndex === patternLower.length ? score / pattern.length : 0;
        }

        // Search and score products
        const searchResults = products
            .map(product => {
                let score = 0;

                // Title match
                score += fuzzyMatch(product.title, query) * 3;

                // Description match
                score += fuzzyMatch(product.description || '', query) * 2;

                // Category match
                score += fuzzyMatch(product.category || '', query) * 1.5;

                // Tags match
                if (product.tags) {
                    score += product.tags.reduce((tagScore, tag) =>
                        tagScore + fuzzyMatch(tag, query), 0
                    );
                }

                return { ...product, searchScore: score };
            })
            .filter(product => {
                // Apply filters
                if (filters.category && product.category !== filters.category) return false;
                if (filters.priceMin && product.price < filters.priceMin) return false;
                if (filters.priceMax && product.price > filters.priceMax) return false;
                if (filters.inStock && !product.inStock) return false;

                return product.searchScore > 0.1; // Minimum relevance threshold
            })
            .sort((a, b) => b.searchScore - a.searchScore)
            .slice(0, 50); // Limit results

        self.postMessage({
            type: 'SEARCH_RESULTS',
            data: searchResults
        });
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error.message
        });
    }
}
