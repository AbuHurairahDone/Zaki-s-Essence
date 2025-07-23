import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
 function CartItem({ item, updateQuantity, removeItem }) {
            return (
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-16 h-16 rounded-md object-cover"
                        />
                        <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-gray-500 text-sm">{item.variant}</p>
                            <p className="text-gray-500 font-bold">${item.product.price}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button 
                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition"
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-2">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item, item.quantity + 1)}
                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition"
                            >
                                +
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => removeItem(item)}
                            className="text-gray-400 hover:text-red-500 transition"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
            );
        }

function CartPanel({ isOpen, cartItems, toggleCart, updateQuantity, removeItem, totalItems, totalAmount }) {
            return (
                <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-xl z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'} cart-panel transition-transform duration-300 ease-in-out`}>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold">Your Cart ({totalItems})</h3>
                            <button 
                                onClick={toggleCart}
                                className="text-2xl text-gray-400 hover:text-gray-600 transition"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <i className="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500">Your cart is empty</p>
                                    <button 
                                        onClick={toggleCart}
                                        className="mt-4 px-6 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                cartItems.map(item => (
                                    <CartItem 
                                        key={`${item.product.id}-${item.variant}`}
                                        item={item}
                                        updateQuantity={updateQuantity}
                                        removeItem={removeItem}
                                    />
                                ))
                            )}
                        </div>
                        
                        {cartItems.length > 0 && (
                            <div className="border-t border-gray-200 p-4">
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-bold">${totalAmount.toFixed(2)}</span>
                                </div>
                                <button className="w-full bg-yellow-700 hover:bg-yellow-800 text-white py-3 rounded-md transition font-medium">
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        
        export default CartPanel;