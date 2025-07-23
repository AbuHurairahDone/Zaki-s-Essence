 import React, { useState } from 'react';
 import ProductCard from './ProductCard.jsx';
 function ShopSection({ products, addToCart }) {
            const [selectedCategory, setSelectedCategory] = useState("All");
            
            const filteredProducts = selectedCategory === "All" 
                ? products 
                : products.filter(product => product.category === selectedCategory);
            
            const categories = ["All", "Floral", "Oriental", "Fresh", "Woody", "Aquatic", "Amber"];
            return (
                <section id="shop" className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 animate-slide">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Fragrance Collection</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Discover our exquisite selection of perfumes crafted with the finest ingredients.</p>
                        </div>
                        
                        <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide animate-slide delay-1">
                            <div className="flex space-x-4">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-full ${selectedCategory === category ? 'bg-yellow-700 text-white' : 'bg-white text-gray-800 border border-gray-200 hover:border-yellow-700'}`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    addToCart={addToCart}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            );
        }
        
        export default ShopSection;