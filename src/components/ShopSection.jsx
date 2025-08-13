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
    const [newArrivals, setNewArrivals] = useState([]);
    const [weeklySales, setWeeklySales] = useState([]);
    const [sectionRef, isSectionVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const collectionParam = params.get('collection');

    useEffect(() => {
        const loadSpecialProducts = async () => {
            try {
                const [newArrivalsData, weeklySalesData] = await Promise.all([
                    ProductService.getNewArrivals(),
                    ProductService.getWeeklySaleProducts()
                ]);
                setNewArrivals(newArrivalsData);
                setWeeklySales(weeklySalesData);
            } catch (error) {
                console.error('Error loading special products:', error);
            }
        };
        loadSpecialProducts();
    }, []);

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

    const SectionTitle = ({ children }) => (
        <div className="flex items-center justify-center gap-6 mb-8">
            <span className="flex-1 h-[1px] bg-gray-300"></span>
            <h3 className="text-3xl md:text-4xl font-serif tracking-wide text-gray-900">
                {children}
            </h3>
            <span className="flex-1 h-[1px] bg-gray-300"></span>
        </div>
    );

    return (
        <section id="shop" className="py-20 ">
            <div className="container mx-auto px-4">

                {/* Section heading */}
                <div
                    ref={sectionRef}
                    className={`text-center mb-16 transition-all duration-700 ${isSectionVisible && isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    <h2 className="text-4xl md:text-5xl font-serif tracking-wide mb-4 text-gray-900">
                        Our Fragrance Collection
                    </h2>
                    <p className="text-lg text-gray-500 italic max-w-2xl mx-auto">
                        Discover our exquisite selection of perfumes crafted with the finest ingredients.
                    </p>
                </div>

                {/* New Arrivals */}
                {newArrivals.length > 0 && (
                    <div className="mb-20">
                        <SectionTitle>New Arrivals</SectionTitle>

                        {/* Mobile: Horizontal scroll */}
                        <div className="block md:hidden">
                            <div className="flex overflow-x-auto space-x-4 px-2 pb-2 scrollbar-hide">
                                {newArrivals.map((product, idx) => (
                                    <div
                                        key={product.id}
                                        className="flex-shrink-0 w-64 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl"
                                        style={{ transitionDelay: `${idx * 100}ms` }}
                                    >
                                        <ProductCard product={product} addToCart={addToCart} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Grid */}
                        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {newArrivals.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="transform transition duration-500 hover:scale-[1.02] hover:shadow-xl"
                                    style={{ transitionDelay: `${idx * 100}ms` }}
                                >
                                    <ProductCard product={product} addToCart={addToCart} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weekly Sale */}
                {weeklySales.length > 0 && (
                    <div className="mb-20">
                        <div className=" rounded-xl p-6">
                            <SectionTitle>Weekly Sale</SectionTitle>
                            <p className="text-center text-gray-700 italic mb-8">Special offers crafted for our connoisseurs</p>

                            {/* Mobile */}
                            <div className="block md:hidden">
                                <div className="flex overflow-x-auto space-x-4 px-2 pb-2 scrollbar-hide">
                                    {weeklySales.map((product, idx) => (
                                        <div
                                            key={product.id}
                                            className="flex-shrink-0 w-64 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl"
                                            style={{ transitionDelay: `${idx * 100}ms` }}
                                        >
                                            <ProductCard product={product} addToCart={addToCart} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop */}
                            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {weeklySales.map((product, idx) => (
                                    <div
                                        key={product.id}
                                        className="transform transition duration-500 hover:scale-[1.02] hover:shadow-xl"
                                        style={{ transitionDelay: `${idx * 100}ms` }}
                                    >
                                        <ProductCard product={product} addToCart={addToCart} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Complete Collection */}
                <SectionTitle>Complete Collection</SectionTitle>
                <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                    {/* Mobile: per collection */}
                    <div className="block md:hidden space-y-10">
                        {collections.map((collection) => {
                            const collectionProducts = filteredProducts.filter(
                                (product) => product.collectionRef === collection.id
                            );
                            if (collectionProducts.length === 0) return null;

                            return (
                                <div key={collection.id}>
                                    <h3 className="text-lg font-serif font-semibold mb-3 px-2 text-gray-800">{collection.name}</h3>
                                    <div className="flex overflow-x-auto space-x-4 px-2 pb-2 scrollbar-hide">
                                        {collectionProducts.map((product, idx) => (
                                            <div
                                                key={product.id}
                                                className="flex-shrink-0 w-64 transform transition duration-500 hover:scale-[1.02] hover:shadow-xl"
                                                style={{ transitionDelay: `${idx * 100}ms` }}
                                            >
                                                <ProductCard product={product} addToCart={addToCart} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Grid */}
                    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredProducts.map((product, idx) => (
                            <div
                                key={product.id}
                                className="transform transition duration-500 hover:scale-[1.02] hover:shadow-xl"
                                style={{ transitionDelay: `${idx * 100}ms` }}
                            >
                                <ProductCard product={product} addToCart={addToCart} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && !newArrivals.length && !weeklySales.length && (
                    <div className="text-center py-16 animate-fade">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto mb-4 text-gray-400"
                            width="64"
                            height="64"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <h3 className="text-xl font-serif text-gray-700 mb-2">Our next masterpiece is on its way</h3>
                        <p className="text-gray-500 italic">Stay inspired.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ShopSection;
