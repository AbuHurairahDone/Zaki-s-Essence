import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSearch, faCartPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { SearchService } from '../services/searchService.js';
import { buildCartProduct, selectVariantImage } from '../utils/productImages.js';

function SearchOverlay({ isOpen, toggleSearch }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ products: [], collections: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [showResults, setShowResults] = useState(false);
    const searchInputRef = useRef(null);
    const debounceTimeout = useRef(null);
    const navigate = useNavigate();

    // Focus input when opening
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 300);
        }
    }, [isOpen]);

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSearchResults({ products: [], collections: [] });
            setShowResults(false);
        }
    }, [isOpen]);

    // Debounced search
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowResults(false);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            if (value.trim().length < 2) {
                setSearchResults({ products: [], collections: [] });
                return;
            }

            setIsLoading(true);
            try {
                const results = await SearchService.search(value);
                setSearchResults(results);

                const variants = {};
                results.products.forEach(product => {
                    if (product.variants?.length) {
                        variants[product.id] = product.variants[0];
                    }
                });
                setSelectedVariants(variants);

                setTimeout(() => setShowResults(true), 50);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 400);
    };

    const handleVariantChange = (productId, variant) => {
        setSelectedVariants(prev => ({
            ...prev,
            [productId]: variant
        }));

        // Force a re-render to update the image
        setSearchResults(prev => ({ ...prev }));
    };

    // Helper function to get variant price
    const getVariantPrice = (product, variant) => {
        // Support both new variantPricing structure and legacy price structure
        if (product.variantPricing && product.variantPricing[variant]) {
            return product.variantPricing[variant];
        }
        // Fallback to legacy single price
        return product.price || 0;
    };

    // Calculate discounted price if applicable
    const getDiscountedPrice = (price, discountPercentage) => {
        if (discountPercentage && discountPercentage > 0) {
            return price - (price * discountPercentage / 100);
        }
        return price;
    };

    const handleAddToCart = (product) => {
        const variant = selectedVariants[product.id];
        if (!variant) return;

        const cartProduct = buildCartProduct(product, variant);
        window.dispatchEvent(new CustomEvent('add-to-cart', {
            detail: { product: cartProduct, variant }
        }));

        toggleSearch();
    };

    const handleViewCollection = (collectionId) => {
        navigate(`/shop?collection=${collectionId}`);
        toggleSearch();
    };

    // New: navigate to product detail
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        toggleSearch();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black backdrop-blur-sm z-50"
                        onClick={toggleSearch}
                    />

                    {/* Search Overlay with spring animation */}
                    <motion.div
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 120,
                            damping: 20
                        }}
                        className="fixed top-0 left-0 w-full h-full z-50 flex flex-col bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Header */}
                        <div className="bg-black p-4 flex items-center justify-between">
                            <div className="relative flex-1 max-w-3xl mx-auto">
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search for products and collections..."
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-800"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <button
                                onClick={toggleSearch}
                                className="ml-4 text-white hover:text-amber-800 transition-colors"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-2xl" />
                            </button>
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 bg-white overflow-y-auto p-4">
                            <div className="max-w-6xl mx-auto">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin w-8 h-8 border-2 border-amber-950 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : searchTerm.trim().length < 1 ? (
                                    <div className="text-center text-gray-500 py-12">
                                        <p>Start typing to search for products and collections</p>
                                    </div>
                                ) :
                                    searchTerm.trim().length < 2 ? (
                                        <div className="text-center text-gray-500 py-12">
                                            <p>Type at least 2 characters to search</p>
                                        </div>
                                    ) : (
                                        <div className={`space-y-8 transition-opacity duration-500 ${showResults ? 'opacity-100' : 'opacity-0'}`}>
                                            {/* Products */}
                                            {searchResults.products.length > 0 && (
                                                <div>
                                                    <h3 className="text-xl font-bold mb-4 border-b pb-2">Products</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {searchResults.products.map(product => (
                                                            <div
                                                                key={product.id}
                                                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                                                onClick={() => handleProductClick(product.id)}
                                                            >
                                                                <div className="relative">
                                                                    <img
                                                                        src={selectVariantImage(product, selectedVariants[product.id] || product.variants?.[0])}
                                                                        alt={product.name}
                                                                        className="w-full h-48 object-cover"
                                                                    />
                                                                    {product.discountPercentage > 0 && (
                                                                        <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                                                                            {product.discountPercentage}% OFF
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="p-4">
                                                                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h4>
                                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                                                                    {product.variants?.length > 0 && (
                                                                        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Variant:</label>
                                                                            <select
                                                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-800"
                                                                                value={selectedVariants[product.id] || ''}
                                                                                onChange={(e) => handleVariantChange(product.id, e.target.value)}
                                                                            >
                                                                                {product.variants.map(variant => (
                                                                                    <option key={variant} value={variant}>{variant}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex justify-between items-center">
                                                                        <div className="text-amber-950 font-bold">
                                                                            {product.variants?.length > 0 && selectedVariants[product.id] ? (
                                                                                <>
                                                                                    {(() => {
                                                                                        const variant = selectedVariants[product.id];
                                                                                        const originalPrice = getVariantPrice(product, variant);
                                                                                        const discountedPrice = getDiscountedPrice(originalPrice, product.discountPercentage);

                                                                                        return (
                                                                                            <div className="flex flex-col">
                                                                                                <span>Rs. {discountedPrice.toFixed(0)}</span>
                                                                                                {discountedPrice !== originalPrice && (
                                                                                                    <span className="text-xs line-through text-gray-500">Rs. {originalPrice.toFixed(0)}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        );
                                                                                    })()
                                                                                    }
                                                                                </>
                                                                            ) : (
                                                                                <>Rs. {product.price}</>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                                                            className="bg-primary hover:bg-secondary text-white px-3 py-1 rounded-md flex items-center transition-colors"
                                                                        >
                                                                            <FontAwesomeIcon icon={faCartPlus} className="mr-1" />
                                                                            Add to Cart
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Collections */}
                                            {searchResults.collections.length > 0 && (
                                                <div>
                                                    <h3 className="text-xl font-bold mb-4 border-b pb-2">Collections</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {searchResults.collections.map(collection => (
                                                            <div key={collection.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                                                <div className="relative">
                                                                    <img
                                                                        src={collection.image}
                                                                        alt={collection.name}
                                                                        className="w-full h-48 object-cover"
                                                                    />
                                                                </div>
                                                                <div className="p-4">
                                                                    <h4 className="font-bold text-lg mb-2">{collection.name}</h4>
                                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{collection.description}</p>

                                                                    <div className="flex justify-end">
                                                                        <button
                                                                            onClick={() => handleViewCollection(collection.id)}
                                                                            className="bg-primary hover:bg-secondary text-white px-3 py-1 rounded-md flex items-center transition-colors"
                                                                        >
                                                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                                            View Collection
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {searchResults.products.length === 0 && searchResults.collections.length === 0 && (
                                                <div className="text-center py-12">
                                                    <p className="text-gray-500">No results found for "{searchTerm}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default SearchOverlay;
