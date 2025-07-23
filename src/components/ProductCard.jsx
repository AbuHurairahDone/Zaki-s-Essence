import React, { useState } from 'react';
function ProductCard({ product, addToCart }) {
            const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
            const [showDescription, setShowDescription] = useState(false);
            
            return (
                <div className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade delay-1">
                    <div className="product-image relative">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                            {product.category}
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <div className="flex items-center text-yellow-600">
                                <span>{product.rating}</span>
                                <i className="fas fa-star ml-1"></i>
                            </div>
                        </div>
                        
                        <p className="text-gray-500 mb-3">{product.description}</p>
                        
                        <div className="mb-3">
                            <div className="flex space-x-2">
                                {product.variants.map(variant => (
                                    <button
                                        key={variant}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-2 py-1 text-xs rounded ${selectedVariant === variant ? 'bg-yellow-700 text-white' : 'border border-gray-300'}`}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">${product.price}</span>
                            <button 
                                onClick={() => addToCart(product, selectedVariant)}
                                className="bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-md transition flex items-center"
                            >
                                <i className="fas fa-plus mr-2"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        
        export default ProductCard;