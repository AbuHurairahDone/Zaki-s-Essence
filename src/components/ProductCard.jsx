import React, { useState } from 'react';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';

function ProductCard({ product, addToCart }) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [cardRef, isCardVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();

    const handleAddToCart = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        addToCart(product, selectedVariant);
        setIsLoading(false);
    };

    return (
        <div
            ref={cardRef}
            className={`product-card bg-white rounded-lg shadow-md overflow-hidden hover-lift smooth-transition group gpu-accelerated ${isCardVisible && isReady ? 'animate-fade' : 'opacity-0'
                }`}
        >
            <div className="product-image relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover smooth-transition group-hover:scale-105"
                />
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
                </div>

                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-800">
                        ${product.price}
                    </span>
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
