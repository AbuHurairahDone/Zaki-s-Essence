import React, { useState, useEffect } from 'react';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import SEOService from '../services/seoService.js';
import GTMService from '../services/gtmService.js';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ProductCard({ product, addToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [cardRef, isCardVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();

    useEffect(() => {
        if (isCardVisible && product) {
            AnalyticsService.trackProductView(product);
            GTMService.trackProductView(product);

            // Add product structured data for this product
            const productSchema = SEOService.generateProductSchema({
                ...product,
                price: getDiscountedPrice(getVariantPrice(selectedVariant)),
                inStock: getVariantStock(selectedVariant) > 0,
                images: [getOptimizedImageUrl() || product.image]
            });

            // Add to page without duplicating
            const existingScript = document.querySelector(`script[data-product-id="${product.id}"]`);
            if (!existingScript) {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.setAttribute('data-product-id', product.id);
                script.textContent = JSON.stringify(productSchema);
                document.head.appendChild(script);
            }
        }
    }, [isCardVisible, product, selectedVariant]);

    const handleAddToCart = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 200));

        const finalPrice = getDiscountedPrice(getVariantPrice(selectedVariant));
        const productWithFinalPrice = { ...product, price: finalPrice };

        // Track add to cart event in GTM
        GTMService.trackAddToCart(productWithFinalPrice, selectedVariant, 1);

        addToCart(productWithFinalPrice, selectedVariant);

        setIsLoading(false);
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        AnalyticsService.trackFunnelStep(0, 'variant_selected', {
            product_id: product.id,
            product_name: product.name,
            variant_selected: variant,
            variant_price: getVariantPrice(variant)
        });

        // Track variant selection in GTM
        GTMService.trackCustomEvent('variant_selected', {
            product_id: product.id,
            product_name: product.name,
            variant: variant,
            price: getVariantPrice(variant)
        });
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const getVariantPrice = (variant) => {
        if (product.variantPricing && product.variantPricing[variant]) {
            return product.variantPricing[variant];
        }
        return product.price || 0;
    };

    const getDiscountedPrice = (price) => {
        if (product.discountPercentage && product.discountPercentage > 0) {
            return price - (price * product.discountPercentage / 100);
        }
        return price;
    };

    const getPriceRange = () => {
        if (product.variantPricing) {
            const prices = Object.values(product.variantPricing).filter(p => p > 0);
            if (prices.length > 0) {
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                if (min === max) return `Rs. ${min.toFixed(0)}`;
                return `Rs. ${min.toFixed(0)} - Rs. ${max.toFixed(0)}`;
            }
        }
        return `Rs. ${(product.price || 0).toFixed(0)}`;
    };

    const getCurrentPrice = () => {
        const price = getVariantPrice(selectedVariant);
        return {
            original: price,
            discounted: getDiscountedPrice(price),
        };
    };

    const getOptimizedImageUrl = () => {
        if (!product.image) return null;
        if (product.image.includes('cloudinary.com')) {
            return CloudinaryService.getProductQualityUrl(product.image, { width: 400, height: 500 });
        }
        return product.image;
    };

    // Returns the stock for a given variant
    const getVariantStock = (variant) => {
        if (product.stock && product.stock[variant] !== undefined) {
            return product.stock[variant];
        }
        // Fallback: if no stock info, assume in stock
        return null;
    };

    const { original, discounted } = getCurrentPrice();
    const selectedVariantStock = getVariantStock(selectedVariant);

    return (
        <article
            ref={cardRef}
            className={`product-card bg-white rounded-lg shadow-md overflow-hidden hover-lift smooth-transition group gpu-accelerated ${isCardVisible && isReady ? 'animate-fade' : 'opacity-0'
                }`}
            itemScope
            itemType="https://schema.org/Product"
        >
            <div className="product-image relative overflow-hidden">
                {!imageError ? (
                    <img
                        src={getOptimizedImageUrl() || product.image}
                        alt={`${product.name} - Premium fragrance by Zaki's Essence`}
                        className="w-full aspect-[4/5] object-cover smooth-transition group-hover:scale-105"
                        onError={handleImageError}
                        loading="lazy"
                        itemProp="image"
                        width="400"
                        height="500"
                    />
                ) : (
                    <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center" role="img" aria-label="Product image not available">
                        <div className="text-center text-gray-500">
                            <i className="fas fa-image text-4xl mb-2" aria-hidden="true"></i>
                            <p className="text-sm">Image not available</p>
                        </div>
                    </div>
                )}

                <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    <span itemProp="category">{product.category}</span>
                </div>

                {product.discountPercentage ? (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Limited Discount {product.discountPercentage}% OFF
                    </div>
                ) : null}

                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 smooth-transition"></div>
            </div>

            <div className="p-4">
                <header className="flex justify-between items-start mb-2">
                    <h3 className="text-product-name text-lg group-hover:text-yellow-700 smooth-transition" itemProp="name">
                        {product.name}
                    </h3>
                    {product.rating && (
                        <div className="flex items-center text-yellow-600" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                            <span className="text-sm font-medium" itemProp="ratingValue">{product.rating}</span>
                            <FontAwesomeIcon icon={faStar} className="text-sm ml-1" aria-hidden="true" />
                            <meta itemProp="bestRating" content="5" />
                            <meta itemProp="ratingCount" content="100" />
                        </div>
                    )}
                </header>

                <p className="text-luxury-body text-gray-500 mb-3 text-sm leading-relaxed" itemProp="description">
                    {product.description}
                </p>

                <div className="mb-3">
                    <fieldset>
                        <legend className="sr-only">Select product variant</legend>
                        <div className="flex space-x-2" role="group" aria-label="Product variants">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant}
                                    onClick={() => handleVariantChange(variant)}
                                    className={`px-3 py-1 text-xs rounded-full smooth-transition hover-scale ${selectedVariant === variant
                                        ? 'bg-yellow-700 text-white shadow-md'
                                        : 'border border-gray-300 hover:border-yellow-700 hover:text-yellow-700'
                                        }`}
                                    aria-pressed={selectedVariant === variant}
                                    aria-label={`Select ${variant} variant`}
                                >
                                    {variant}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    {product.variantPricing && (
                        <div className="mt-2 text-xs text-gray-600">
                            Price range: {getPriceRange()}
                        </div>
                    )}
                </div>

                <footer className="flex justify-between items-center">
                    <div className="flex flex-col" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <span className="font-bold text-lg text-gray-800" itemProp="price" content={discounted.toFixed(2)}>
                            Rs. {discounted.toFixed(0)}
                        </span>
                        {discounted !== original && (
                            <span className="text-xs line-through text-gray-500">
                                Rs. {original.toFixed(0)}
                            </span>
                        )}
                        <span className="text-xs text-gray-500">{selectedVariant}</span>
                        <meta itemProp="priceCurrency" content="PKR" />
                        <meta itemProp="availability" content={selectedVariantStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                        <meta itemProp="url" content={`https://zakisessence.pk/products/${product.id}`} />
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading || (selectedVariantStock === 0)}
                        className={`bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-md smooth-transition flex items-center btn-animate hover-lift ${isLoading || (selectedVariantStock === 0) ? 'opacity-75 cursor-not-allowed' : ''}`}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        {isLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" role="status" aria-label="Loading"></div>
                        ) : (
                            <i className="fas fa-plus mr-2 smooth-transition group-hover:rotate-90" aria-hidden="true"></i>
                        )}
                        {isLoading ? 'Adding...' : selectedVariantStock === 0 ? 'Out of Stock' : 'Add'}
                    </button>
                </footer>
            </div>

            {/* Hidden structured data elements */}
            <div style={{ display: 'none' }}>
                <span itemProp="brand" itemScope itemType="https://schema.org/Brand">
                    <span itemProp="name">Zaki's Essence</span>
                </span>
                <span itemProp="sku">{product.id}</span>
                <span itemProp="mpn">{product.id}</span>
            </div>
        </article>
    );
}

export default ProductCard;
