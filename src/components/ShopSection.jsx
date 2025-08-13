import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import { useIntersectionObserver, usePreventAnimationFlash } from '../hooks/useAnimations.js';
import { ProductService } from '../services/productService.js';
import { useLocation } from 'react-router-dom';

function ShopSection({ products, addToCart }) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [categories, setCategories] = useState(["All"]);
    const [collections, setCollections] = useState([]);
    const [sectionRef, isSectionVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const collectionParam = params.get('collection');

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const collectionsData = await ProductService.getAllCollections();
                setCollections(collectionsData);
                const collectionNames = collectionsData.map(c => c.name);
                setCategories(["All", ...collectionNames]);
            } catch (error) {
                console.error('Error loading collections:', error);
                const fallbackCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
                setCategories(["All", ...fallbackCategories.sort()]);
            }
        };
        loadCollections();
    }, [products]);

    useEffect(() => {
        if (collectionParam && collections.length > 0) {
            const found = collections.find(col => col.id === collectionParam);
            if (found) setSelectedCategory(found.name);
        }
    }, [collectionParam, collections]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === "All") return products;
        const collection = collections.find(col => col.name === selectedCategory);
        if (collection) return products.filter(p => p.collectionRef === collection.id);
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory, collections]);


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
                {/* Section heading */}
                <div
                    ref={sectionRef}
                    className={`text-center mb-12 gpu-accelerated ${isSectionVisible && isReady ? 'animate-slide' : 'opacity-0'}`}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Fragrance Collection</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover our exquisite selection of perfumes crafted with the finest ingredients.
                    </p>
                </div>

                {/* Categories */}
                <div className="mb-8 flex justify-center">
                    <nav
                        className="flex overflow-x-auto scrollbar-hide pb-4 px-4 gap-3 sm:gap-4"
                        aria-label="Product categories"
                    >
                        {categories.map((category) => {
                            const isActive = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    aria-pressed={isActive}
                                    className={`flex-shrink-0 rounded-full font-medium text-sm sm:text-base smooth-transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 px-4 py-2 sm:px-5 sm:py-2.5
                        ${isActive
                                            ? 'bg-yellow-700 text-white shadow-lg scale-105'
                                            : 'bg-white text-gray-800 border border-gray-200 hover:border-yellow-700 hover:text-yellow-700 hover:shadow-md'
                                        }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className={`smooth-transition ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    {/* Mobile View: Horizontal scroll per collection */}
                    <div className="block md:hidden space-y-8">
                        {collections.map((collection) => {
                            const collectionProducts = filteredProducts.filter(
                                (product) => product.collectionRef === collection.id
                            );
                            if (collectionProducts.length === 0) return null;

                            return (
                                <div key={collection.id}>
                                    <h3 className="text-lg font-semibold mb-3 px-2">{collection.name}</h3>
                                    <div className="flex overflow-x-auto space-x-4 px-2 pb-2 scrollbar-hide">
                                        {collectionProducts.map((product) => (
                                            <div key={product.id} className="flex-shrink-0 w-64">
                                                <ProductCard product={product} addToCart={addToCart} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop View: Keep existing grid */}
                    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} addToCart={addToCart} />
                        ))}
                    </div>
                </div>

                {/* Empty State */}
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
