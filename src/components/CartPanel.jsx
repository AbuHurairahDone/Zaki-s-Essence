import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';

function CartItem({ item, updateQuantity, removeItem }) {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async () => {
        setIsRemoving(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        removeItem(item);
    };

    return (
        <div className={`flex justify-between items-center py-4 border-b border-gray-200 transition-all duration-300 animate-fade ${isRemoving ? 'opacity-0 scale-95 translate-x-full' : ''
            }`}>
            <div className="flex items-center space-x-4">
                <div className="relative overflow-hidden rounded-md">
                    <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover transition-transform hover:scale-110"
                    />
                </div>
                <div className="animate-slide-right delay-1">
                    <h4 className="font-medium hover:text-yellow-700 transition-colors">{item.product.name}</h4>
                    <p className="text-gray-500 text-sm">{item.variant}</p>
                    <p className="text-yellow-600 font-bold">${item.product.price}</p>
                </div>
            </div>

            <div className="flex items-center space-x-4 animate-slide-left delay-2">
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition-all duration-200 hover:text-yellow-700"
                        disabled={item.quantity <= 1}
                    >
                        -
                    </button>
                    <span className="px-3 py-2 bg-gray-50 font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition-all duration-200 hover:text-yellow-700"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110 p-2"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>
    );
}

function CartPanel({ isOpen, cartItems, toggleCart, updateQuantity, removeItem, totalItems, totalAmount }) {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={toggleCart}
            />

            {/* Cart Panel */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 animate-slide-right">
                        <h3 className="text-xl font-bold text-gray-800">
                            Your Cart ({totalItems})
                        </h3>
                        <button
                            onClick={toggleCart}
                            className="text-2xl text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110 hover:rotate-90 p-2"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full animate-fade">
                                <div className="text-gray-300 text-6xl mb-6 animate-float">
                                    <i className="fas fa-shopping-bag"></i>
                                </div>
                                <h4 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h4>
                                <p className="text-gray-500 mb-6 text-center">Discover our amazing fragrances and add them to your cart</p>
                                <button
                                    onClick={toggleCart}
                                    className="px-8 py-3 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition-all duration-300 font-medium btn-animate hover-lift"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cartItems.map((item, index) => (
                                    <div
                                        key={`${item.product.id}-${item.variant}`}
                                        className="animate-slide-left"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <CartItem
                                            item={item}
                                            updateQuantity={updateQuantity}
                                            removeItem={removeItem}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50 animate-slide-up">
                            <div className="flex justify-between items-center mb-4 text-lg">
                                <span className="text-gray-600 font-medium">Subtotal</span>
                                <span className="font-bold text-xl text-gray-800 animate-pulse">
                                    ${totalAmount.toFixed(2)}
                                </span>
                            </div>
                            <button className="w-full bg-yellow-700 hover:bg-yellow-800 text-white py-4 rounded-md transition-all duration-300 font-medium text-lg btn-animate hover-lift shadow-lg hover:shadow-xl">
                                Proceed to Checkout
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                Shipping and taxes calculated at checkout
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default CartPanel;
