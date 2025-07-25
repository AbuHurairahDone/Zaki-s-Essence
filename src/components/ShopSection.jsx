import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard.jsx';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';
import { ProductService } from '../services/productService.js';

function ShopSection({ products, addToCart }) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [categories, setCategories] = useState(["All"]);
    const [collections, setCollections] = useState([]);
    const [sectionRef, isSectionVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const collectionsData = await ProductService.getAllCollections();
                setCollections(collectionsData);

                // Create filter options: "All" + collection names
                const collectionNames = collectionsData.map(collection => collection.name);
                setCategories(["All", ...collectionNames]);
            } catch (error) {
                console.error('Error loading collections:', error);
                // Fallback to category-based filtering if collections fail
                const fallbackCategories = [...new Set(products.map(product => product.category).filter(Boolean))];
                setCategories(["All", ...fallbackCategories.sort()]);
            }
        };

        loadCollections();
    }, [products]); // Re-load when products change

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(product => {
            // First try to filter by collection name
            const collection = collections.find(col => col.name === selectedCategory);
            if (collection) {
                return product.collectionRef === collection.id;
            }
            // Fallback to category filtering for backward compatibility
            return product.category === selectedCategory;
        });

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

                <div className="mb-8 flex justify-center">
                    <div className="flex overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex space-x-2 sm:space-x-3 px-6 sm:px-4 py-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-full font-medium text-sm sm:text-base smooth-transition hover-lift gpu-accelerated ${selectedCategory === category
                                        ? 'bg-yellow-700 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-800 border border-gray-200 hover:border-yellow-700 hover:text-yellow-700 hover:shadow-md'
                                        }`}
                                    style={{ margin: '4px' }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
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
