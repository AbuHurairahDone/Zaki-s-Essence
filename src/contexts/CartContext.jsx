import React, { useState, createContext, useMemo } from "react";
import { toast } from "react-toastify";



export const CartContext = createContext();

export const CartProvider = ({children}) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const toggleCart = () => {
      setIsCartOpen(!isCartOpen);
      setIsMobileMenuOpen(false); // Close mobile menu if open
    };
    const removeItem = (item) => {
      setCartItems(prevItems => 
          prevItems.filter(cartItem => 
              !(cartItem.product.id === item.product.id && cartItem.variant === item.variant)
          )
      );
    };
    const totalAmount = cartItems.reduce(
      (total, item) => total + (item.product.price * item.quantity), 
        0
    );
    const updateQuantity = (item, newQuantity) => {
        if (newQuantity < 1) return;

        setCartItems(prevItems => 
            prevItems.map(cartItem => 
                cartItem.product.id === item.product.id && cartItem.variant === item.variant
                    ? { ...cartItem, quantity: newQuantity }
                    : cartItem
            )
        );
    };
    const addToCart = (product, variant) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart with same variant
            const existingItemIndex = prevItems.findIndex(
                item => item.product.id === product.id && item.variant === variant
            );
            
            if (existingItemIndex !== -1) {
                // If exists, update quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };
                return updatedItems;
            } else {
                // If new, add to cart
                return [...prevItems, { product, variant, quantity: 1 }];
            }
        });
        
        // show toast
        toast.success(`${product.name} added to cart`, {
            position: "bottom-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };
    return (
        <CartContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen, cartItems, setCartItems, isCartOpen, setIsCartOpen, totalItems, toggleCart, removeItem, totalAmount, updateQuantity, addToCart}}>
            {children}
        </CartContext.Provider>
    )
}
