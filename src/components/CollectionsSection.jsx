import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useAnimations.js';
import { ProductService } from '../services/productService.js';
import { useNavigate } from 'react-router-dom';

function CollectionsSection({ showAll = false }) {
    const [sectionRef, isSectionVisible] = useIntersectionObserver();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (showAll) {
            loadAllCollections();
        } else {
            loadFeaturedCollections();
        }
    }, [showAll]);

    const loadFeaturedCollections = async () => {
        try {
            const featuredCollections = await ProductService.getFeaturedCollections();
            setCollections(featuredCollections);
        } catch (error) {
            console.error('Error loading featured collections:', error);
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAllCollections = async () => {
        try {
            const allCollections = await ProductService.getAllCollections();
            setCollections(allCollections);
        } catch (error) {
            console.error('Error loading all collections:', error);
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
                    <h2 className="text-luxury-title text-3xl md:text-4xl mb-4 animate-fade">
                        {showAll ? 'All Collections' : 'Featured Collections'}
                    </h2>
                    <p className="text-luxury-body text-gray-600 max-w-2xl mx-auto animate-fade delay-1">
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
                                    alt={`${collection.name} fragrance collection - ${collection.description}`}
                                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <h3 className="text-collection-title text-xl text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    {collection.name}
                                </h3>
                                <p className="text-luxury-body text-gray-200 mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    {collection.description}
                                </p>
                                <button
                                    onClick={() => navigate(`/shop?collection=${collection.id}`)}
                                    className="text-button text-white border border-white px-4 py-2 rounded-md hover:bg-white hover:text-gray-900 transition-all duration-300 inline-block w-max btn-animate transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-150"
                                >
                                    View Collection
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CollectionsSection
