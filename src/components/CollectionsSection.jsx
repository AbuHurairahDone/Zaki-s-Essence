import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useAnimations.js';
import { ProductService } from '../services/productService.js';

function CollectionsSection() {
    const [sectionRef, isSectionVisible] = useIntersectionObserver();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeaturedCollections();
    }, []);

    const loadFeaturedCollections = async () => {
        try {
            const featuredCollections = await ProductService.getFeaturedCollections();
            setCollections(featuredCollections);
        } catch (error) {
            console.error('Error loading featured collections:', error);
            // Fallback to empty array if there's an error
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section id="collections" className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin w-8 h-8 border-2 border-yellow-700 border-t-transparent rounded-full"></div>
                    </div>
                </div>
            </section>
        );
    }

    // Don't render the section if there are no featured collections
    if (collections.length === 0) {
        return null;
    }

    return (
        <section id="collections" className="py-16">
            <div className="container mx-auto px-4">
                <div
                    ref={sectionRef}
                    className={`text-center mb-12 transition-all duration-800 ${isSectionVisible ? 'animate-slide' : 'translate-y-10'
                        }`}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade">
                        Featured Collections
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto animate-fade delay-1">
                        Explore our curated fragrance families for every occasion.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection, index) => (
                        <div
                            key={collection.id}
                            className={`relative group overflow-hidden rounded-lg hover-lift smooth-transition animate-scale delay-${index + 2}`}
                        >
                            <div className="relative overflow-hidden rounded-lg">
                                <img
                                    src={collection.image}
                                    alt={collection.name}
                                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    {collection.name}
                                </h3>
                                <p className="text-gray-200 mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    {collection.description}
                                </p>
                                <a
                                    href="#shop"
                                    className="text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-gray-900 transition-all duration-300 inline-block w-max btn-animate transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-150"
                                >
                                    View Collection
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CollectionsSection
