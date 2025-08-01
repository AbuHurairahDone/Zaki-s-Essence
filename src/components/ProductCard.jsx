import React, { useState, useEffect } from 'react';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { AnalyticsService } from '../services/analyticsService.js';
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
        }
    }, [isCardVisible, product]);

    const handleAddToCart = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 200));

        const finalPrice = getDiscountedPrice(getVariantPrice(selectedVariant));
        addToCart({ ...product, price: finalPrice }, selectedVariant);

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
        <div
            ref={cardRef}
            className={`product-card bg-white rounded-lg shadow-md overflow-hidden hover-lift smooth-transition group gpu-accelerated ${isCardVisible && isReady ? 'animate-fade' : 'opacity-0'
                }`}
        >
            <div className="product-image relative overflow-hidden">
                {!imageError ? (
                    <img
                        src={getOptimizedImageUrl() || product.image}
                        alt={product.name}
                        className="w-full aspect-[4/5] object-cover smooth-transition group-hover:scale-105"
                        onError={handleImageError}
                        loading="lazy"
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

                {product.discountPercentage ? (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Limited Discount {product.discountPercentage}% OFF
                    </div>
                ) : null}

                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 smooth-transition"></div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-product-name text-lg group-hover:text-yellow-700 smooth-transition">
                        {product.name}
                    </h3>
                    <div className="flex items-center text-yellow-600">
                        <span className="text-sm font-medium">{product.rating}</span>
                        <FontAwesomeIcon icon={faStar} className="text-sm ml-1" />
                    </div>
                </div>

                <p className="text-luxury-body text-gray-500 mb-3 text-sm leading-relaxed">{product.description}</p>

                <div className="mb-3">
                    <div className="flex space-x-2">
                        {product.variants.map((variant) => (
                            <button
                                key={variant}
                                onClick={() => handleVariantChange(variant)}
                                className={`px-3 py-1 text-xs rounded-full smooth-transition hover-scale ${selectedVariant === variant
                                    ? 'bg-yellow-700 text-white shadow-md'
                                    : 'border border-gray-300 hover:border-yellow-700 hover:text-yellow-700'
                                    }`}
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

                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">
                            Rs. {discounted.toFixed(0)}
                        </span>
                        {discounted !== original && (
                            <span className="text-xs line-through text-gray-500">
                                Rs. {original.toFixed(0)}
                            </span>
                        )}
                        <span className="text-xs text-gray-500">{selectedVariant}</span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading || (selectedVariantStock === 0)}
                        className={`bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-md smooth-transition flex items-center btn-animate hover-lift ${isLoading || (selectedVariantStock === 0) ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : (
                            <i className="fas fa-plus mr-2 smooth-transition group-hover:rotate-90"></i>
                        )}
                        {isLoading ? 'Adding...' : selectedVariantStock === 0 ? 'Out of Stock' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
