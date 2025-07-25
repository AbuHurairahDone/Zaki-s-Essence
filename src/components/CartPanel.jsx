import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useContext } from 'react';
import { CartContext } from '../contexts/CartContext.jsx';

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

function CheckoutModal({ isOpen, onClose, cartItems, totalAmount }) {
    const { createOrder, isCheckingOut } = useContext(CartContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const customerInfo = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };

            const shippingAddress = {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country
            };

            await createOrder(customerInfo, shippingAddress);
            onClose();
            // Reset form
            setFormData({
                name: '', email: '', phone: '', address: '',
                city: '', state: '', zipCode: '', country: 'United States'
            });
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Checkout</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={isCheckingOut}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Order Summary */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-2">
                                {cartItems.map((item) => (
                                    <div key={`${item.product.id}-${item.variant}`} className="flex justify-between">
                                        <span>{item.product.name} ({item.variant}) × {item.quantity}</span>
                                        <span>Rs. {(item.product.price * item.quantity).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>Rs. {totalAmount.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isCheckingOut}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isCheckingOut}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isCheckingOut}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 ${errors.address ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    disabled={isCheckingOut}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 ${errors.city ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={isCheckingOut}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 ${errors.state ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={isCheckingOut}
                                    />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        disabled={isCheckingOut}
                                    />
                                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                        disabled={isCheckingOut}
                                    >
                                        <option value="United States">United States</option>
                                        <option value="Canada">Canada</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Australia">Australia</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            disabled={isCheckingOut}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCheckingOut}
                            className="px-6 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-md transition-colors disabled:opacity-50 flex items-center"
                        >
                            {isCheckingOut ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                'Place Order'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CartPanel({ isOpen, cartItems, toggleCart, updateQuantity, removeItem, totalItems, totalAmount }) {
    const [showCheckout, setShowCheckout] = useState(false);

    const handleCheckout = () => {
        setShowCheckout(true);
    };

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
                                    Rs. {totalAmount.toFixed(0)}
                                </span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-yellow-700 hover:bg-yellow-800 text-white py-4 rounded-md transition-all duration-300 font-medium text-lg btn-animate hover-lift shadow-lg hover:shadow-xl"
                            >
                                Proceed to Checkout
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                Shipping and taxes calculated at checkout
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                cartItems={cartItems}
                totalAmount={totalAmount}
            />
        </>
    );
}

export default CartPanel;
