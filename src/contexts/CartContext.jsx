import React, { useState } from "react";
import { toast } from "react-toastify";
import { OrderService } from "../services/orderService.js";
import { AnalyticsService } from "../services/analyticsService.js";
import { CartContext } from "./contexts.js";

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cartItems.reduce(
        (total, item) => total + (item.product.price * item.quantity),
        0
    );

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
        setIsMobileMenuOpen(false); // Close mobile menu if open

        // Track cart view when opening
        if (!isCartOpen && cartItems.length > 0) {
            AnalyticsService.trackViewCart(cartItems, totalAmount);
        }
    };

    const removeItem = (item) => {
        // Track remove from cart
        AnalyticsService.trackRemoveFromCart(item.product, item.variant, item.quantity);

        setCartItems(prevItems =>
            prevItems.filter(cartItem =>
                !(cartItem.product.id === item.product.id && cartItem.variant === item.variant)
            )
        );
        toast.success('Item removed from cart');
    };

    const updateQuantity = (item, newQuantity) => {
        if (newQuantity < 1) return;

        const oldQuantity = item.quantity;
        const quantityDifference = newQuantity - oldQuantity;

        // Track add or remove based on quantity change
        if (quantityDifference > 0) {
            AnalyticsService.trackAddToCart(item.product, item.variant, quantityDifference);
        } else if (quantityDifference < 0) {
            AnalyticsService.trackRemoveFromCart(item.product, item.variant, Math.abs(quantityDifference));
        }

        setCartItems(prevItems =>
            prevItems.map(cartItem =>
                cartItem.product.id === item.product.id && cartItem.variant === item.variant
                    ? { ...cartItem, quantity: newQuantity }
                    : cartItem
            )
        );
    };

    const addToCart = (product, variant) => {
        // Calculate discounted price if applicable
        let variantPrice = getVariantPrice(product, variant);
        if (product.discountPercentage && product.discountPercentage > 0) {
            variantPrice = variantPrice - (variantPrice * product.discountPercentage / 100);
        }

        // Track add to cart event
        AnalyticsService.trackAddToCart(product, variant, 1);

        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.product.id === product.id && item.variant === variant
            );

            let newItems;
            if (existingItemIndex !== -1) {
                newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1
                };
            } else {
                newItems = [...prevItems, {
                    product: {
                        ...product,
                        price: variantPrice
                    },
                    variant,
                    quantity: 1
                }];
            }

            // If cart will be opened due to this add, track view cart with updated data
            if (!isCartOpen) {
                const newTotalAmount = newItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
                AnalyticsService.trackViewCart(newItems, newTotalAmount);
            }

            return newItems;
        });

        // Automatically open cart after adding
        if (!isCartOpen) {
            setIsCartOpen(true);
            setIsMobileMenuOpen(false);
        }

        toast.success(`${product.name} (${variant}) added to cart`, {
            position: "bottom-right",
            autoClose: 2000,
        });
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

    const clearCart = () => {
        setCartItems([]);
    };

    // Create order function
    const createOrder = async (customerInfo, shippingAddress = null) => {
        if (cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        // Track checkout initiation
        AnalyticsService.trackBeginCheckout(cartItems, totalAmount);
        AnalyticsService.trackFunnelStep(1, 'checkout_initiated', {
            cart_value: totalAmount,
            items_count: totalItems
        });

        setIsCheckingOut(true);
        try {
            const orderData = {
                items: cartItems,
                customerInfo,
                shippingAddress,
                totalAmount,
                totalItems
            };

            const order = await OrderService.createOrder(orderData);

            // Track successful purchase
            AnalyticsService.trackPurchase(order);
            AnalyticsService.trackFunnelStep(2, 'order_completed', {
                order_id: order.orderNumber,
                order_value: order.totalAmount
            });

            // Clear cart after successful order
            clearCart();
            setIsCartOpen(false);

            toast.success('Order created successfully!', {
                position: "bottom-right",
                autoClose: 3000,
            });

            return order;
        } catch (error) {
            console.error('Error creating order:', error);

            // Track checkout failure
            AnalyticsService.trackError('checkout_error', error.message, 'order_creation');

            toast.error('Failed to create order. Please try again.');
            throw error;
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <CartContext.Provider value={{
            isMobileMenuOpen,
            setIsMobileMenuOpen,
            cartItems,
            setCartItems,
            isCartOpen,
            setIsCartOpen,
            totalItems,
            toggleCart,
            removeItem,
            totalAmount,
            updateQuantity,
            addToCart,
            clearCart,
            createOrder,
            isCheckingOut
        }}>
            {children}
        </CartContext.Provider>
    )
}
