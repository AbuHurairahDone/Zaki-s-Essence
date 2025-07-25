import React, { useState } from 'react';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';
import { CloudinaryService } from '../services/cloudinaryService.js';

function ProductCard({ product, addToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [cardRef, isCardVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();

    const handleAddToCart = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        addToCart(product, selectedVariant);
        setIsLoading(false);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    // Get price for selected variant
    const getVariantPrice = (variant) => {
        // Support both new variantPricing structure and legacy price structure
        if (product.variantPricing && product.variantPricing[variant]) {
            return product.variantPricing[variant];
        }
        // Fallback to legacy single price
        return product.price || 0;
    };

    // Get price range for display
    const getPriceRange = () => {
        if (product.variantPricing) {
            const prices = Object.values(product.variantPricing).filter(price => price > 0);
            if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                if (minPrice === maxPrice) {
                    return `Rs. ${minPrice.toFixed(0)}`;
                }
                return `Rs. ${minPrice.toFixed(0)} - Rs. ${maxPrice.toFixed(0)}`;
            }
        }
        // Fallback to legacy price
        return `Rs. ${(product.price || 0).toFixed(0)}`;
    };

    const getCurrentPrice = () => {
        return getVariantPrice(selectedVariant);
    };

    // Get optimized image URL for product display with best quality
    const getOptimizedImageUrl = () => {
        if (!product.image) return null;

        // If it's a Cloudinary URL, optimize it for product card display with best quality
        if (product.image.includes('cloudinary.com')) {
            return CloudinaryService.getProductQualityUrl(product.image, {
                width: 400,
                height: 500 // 4:5 aspect ratio
            });
        }

        // Return original URL for non-Cloudinary images
        return product.image;
    };

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
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 smooth-transition"></div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg group-hover:text-yellow-700 smooth-transition">
                        {product.name}
                    </h3>
                    <div className="flex items-center text-yellow-600">
                        <span className="text-sm font-medium">{product.rating}</span>
                        <i className="fas fa-star ml-1 text-xs"></i>
                    </div>
                </div>

                <p className="text-gray-500 mb-3 text-sm leading-relaxed">{product.description}</p>

                <div className="mb-3">
                    <div className="flex space-x-2">
                        {product.variants.map((variant) => (
                            <button
                                key={variant}
                                onClick={() => setSelectedVariant(variant)}
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
                            Rs. {getCurrentPrice().toFixed(0)}
                        </span>
                        <span className="text-xs text-gray-500">{selectedVariant}</span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        className={`bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-md smooth-transition flex items-center btn-animate hover-lift ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        ) : (
                            <i className="fas fa-plus mr-2 smooth-transition group-hover:rotate-90"></i>
                        )}
                        {isLoading ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
