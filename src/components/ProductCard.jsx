import React, { useState, useEffect } from 'react';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import SEOService from '../services/seoService.js';
import GTMService from '../services/gtmService.js';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { selectVariantImage, buildCartProduct } from '../utils/productImages.js';

function ProductCard({ product, addToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [cardRef, isCardVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();

    const getSelectedImageUrl = () => selectVariantImage(product, selectedVariant);

    useEffect(() => {
        if (isCardVisible && product) {
            AnalyticsService.trackProductView(product);
            GTMService.trackProductView(product);

            const variantPrice = (product.variantPricing && product.variantPricing[selectedVariant])
                ? product.variantPricing[selectedVariant]
                : (product.price || 0);
            const discountedPrice = (product.discountPercentage && product.discountPercentage > 0)
                ? (variantPrice - (variantPrice * product.discountPercentage / 100))
                : variantPrice;
            const selectedImage = selectVariantImage(product, selectedVariant);
            const optimizedImage = selectedImage && selectedImage.includes('cloudinary.com')
                ? CloudinaryService.getProductQualityUrl(selectedImage, { width: 400, height: 500 })
                : selectedImage;
            const inStockVal = (product.stock && product.stock[selectedVariant] !== undefined)
                ? product.stock[selectedVariant] > 0
                : true;

            const productSchema = SEOService.generateProductSchema({
                ...product,
                price: discountedPrice,
                inStock: inStockVal,
                images: [optimizedImage || selectedImage]
            });

            SEOService.addStructuredData(productSchema);
        }
    }, [isCardVisible, product, selectedVariant]);

    const handleAddToCart = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        const cartProduct = buildCartProduct(product, selectedVariant);
        GTMService.trackAddToCart(cartProduct, selectedVariant, 1);
        addToCart(cartProduct, selectedVariant);
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
        GTMService.trackCustomEvent('variant_selected', {
            product_id: product.id,
            product_name: product.name,
            variant: variant,
            price: getVariantPrice(variant)
        });
    };

    const handleImageError = () => setImageError(true);

    const getVariantPrice = (variant) => product.variantPricing?.[variant] || product.price || 0;

    const getDiscountedPrice = (price) => {
        if (product.discountPercentage && product.discountPercentage > 0) {
            return price - (price * product.discountPercentage / 100);
        }
        return price;
    };

    const getPriceRange = () => {
        if (product.variantPricing) {
            const prices = Object.values(product.variantPricing).filter(p => p > 0);
            if (prices.length) {
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min === max ? `Rs. ${min.toFixed(0)}` : `Rs. ${min.toFixed(0)} - Rs. ${max.toFixed(0)}`;
            }
        }
        return `Rs. ${(product.price || 0).toFixed(0)}`;
    };

    const getCurrentPrice = () => {
        const price = getVariantPrice(selectedVariant);
        return { original: price, discounted: getDiscountedPrice(price) };
    };

    const getOptimizedImageUrl = () => {
        const baseUrl = getSelectedImageUrl();
        if (!baseUrl) return null;
        return baseUrl.includes('cloudinary.com')
            ? CloudinaryService.getProductQualityUrl(baseUrl, { width: 400, height: 500 })
            : baseUrl;
    };

    const getVariantStock = (variant) => product.stock?.[variant] ?? null;

    const { original, discounted } = getCurrentPrice();
    const selectedVariantStock = getVariantStock(selectedVariant);

    return (
        <article
            ref={cardRef}
            className={`product-card bg-white rounded-lg shadow-md overflow-hidden hover-lift smooth-transition group gpu-accelerated h-full flex flex-col ${isCardVisible && isReady ? 'animate-fade' : 'opacity-0'}`}
            itemScope
            itemType="https://schema.org/Product"
        >

            <div className="product-image relative overflow-hidden aspect-[4/5]">
                {!imageError ? (
                    <img
                        src={getOptimizedImageUrl() || getSelectedImageUrl()}
                        alt={`${product.name} - Premium fragrance`}
                        className="w-full aspect-[4/5] object-cover smooth-transition group-hover:scale-105"
                        onError={handleImageError}
                        loading="lazy"
                        width="400"
                        height="500"
                    />
                ) : (
                    <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <i className="fas fa-image text-4xl mb-2"></i>
                            <p className="text-sm">Image not available</p>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    {product.category}
                </div>
                {product.discountPercentage && (
                    <div className="absolute top-0 left-0 bg-black text-white text-xl font-medium px-2 py-1 rounded">
                        Sale
                    </div>
                )}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 smooth-transition"></div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <header className="flex justify-between items-start mb-2">
                    <h3 className="text-lg group-hover:text-yellow-700">{product.name}</h3>
                    {product.rating && (
                        <div className="flex items-center text-yellow-600">
                            <span className="text-sm font-medium">{product.rating}</span>
                            <FontAwesomeIcon icon={faStar} className="text-sm ml-1" />
                        </div>
                    )}
                </header>

                {/* Description with fixed height */}
                <p className="text-gray-500 mb-3 text-sm line-clamp-3 min-h-[3.6em]">
                    {product.description}
                </p>

                {/* Variants */}
                <div className="mb-3">
                    <div className="flex space-x-2 flex-wrap">
                        {product.variants.map((variant) => (
                            <button
                                key={variant}
                                onClick={() => handleVariantChange(variant)}
                                className={`px-3 py-1 text-xs rounded-full smooth-transition hover-scale ${selectedVariant === variant
                                    ? 'bg-yellow-700 text-white shadow-md'
                                    : 'border border-gray-300 hover:border-yellow-700 hover:text-yellow-700'}`}
                            >
                                {variant}
                            </button>
                        ))}
                    </div>
                    {product.variantPricing && (
                        <div className="mt-2 text-xs text-gray-600">
                            Price range: {getPriceRange()}
                        </div>
                    )}
                </div>

                {/* Push footer to bottom */}
                <div className="mt-auto">
                    <footer className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-gray-800">
                                Rs. {discounted.toFixed(0)}
                            </span>
                            {discounted !== original && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs line-through text-gray-500">Rs. {original.toFixed(0)}</span>
                                    <span className="text-xs text-red-500">Save Rs. {(original - discounted).toFixed(0)}</span>
                                </div>


                            )}
                            <span className="text-xs text-gray-500">{selectedVariant}</span>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={isLoading || selectedVariantStock === 0}
                            className={`bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-md flex items-center ${isLoading || selectedVariantStock === 0 ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Adding...' : selectedVariantStock === 0 ? 'Out of Stock' : 'Add'}
                        </button>
                    </footer>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
