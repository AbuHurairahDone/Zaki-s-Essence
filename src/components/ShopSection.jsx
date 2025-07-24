import React, { useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';

function ShopSection({ products, addToCart }) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [sectionRef, isSectionVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(product => product.category === selectedCategory);

    const categories = ["All", "Floral", "Oriental", "Fresh", "Woody", "Aquatic", "Amber"];

    const handleCategoryChange = async (category) => {
        if (category === selectedCategory) return;

        setIsTransitioning(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        setSelectedCategory(category);
        setIsTransitioning(false);
    };

    return (
        <section id="shop" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div
                    ref={sectionRef}
                    className={`text-center mb-12 gpu-accelerated ${isSectionVisible && isReady ? 'animate-slide' : 'opacity-0'
                        }`}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Our Fragrance Collection
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover our exquisite selection of perfumes crafted with the finest ingredients.
                    </p>
                </div>

                <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide">
                    <div className="flex space-x-4 mx-auto">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`whitespace-nowrap px-6 py-3 rounded-full font-medium smooth-transition hover-lift gpu-accelerated ${selectedCategory === category
                                        ? 'bg-yellow-700 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-800 border border-gray-200 hover:border-yellow-700 hover:text-yellow-700 hover:shadow-md'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`smooth-transition ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                addToCart={addToCart}
                            />
                        ))}
                    </div>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 animate-fade">
                        <div className="text-gray-400 text-6xl mb-4">
                            <i className="fas fa-search"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                        <p className="text-gray-500">Try selecting a different category</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ShopSection;
