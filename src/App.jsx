import React, { useState, useEffect, useContext } from 'react'
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { CartContext, CartProvider } from './contexts/CartContext.jsx'
import { ProductContext, ProductProvider } from './contexts/Product.jsx'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer } from "react-toastify";


import { Navbar, MobileMenu } from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import ShopSection from './components/ShopSection.jsx'
import CartPanel from './components/CartPanel.jsx'
import CollectionsSection from './components/CollectionsSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import NewsLetterSection from './components/NewsLetterSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'



function AppCode() {
    const { isMobileMenuOpen, setIsMobileMenuOpen, isCartOpen, setIsCartOpen, toggleCart, cartItems, totalItems, totalAmount, addToCart, updateQuantity, removeItem } = useContext(CartContext);
    const { products } = useContext(ProductContext);

    const [showScrollButton, setShowScrollButton] = useState(false);
    useEffect(() => {
      const handleScroll = () => {
        setShowScrollButton(window.scrollY >= 200);
      };
      window.addEventListener('scroll', handleScroll);
      // Cleanup on unmount
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsCartOpen(false); // Close cart if open
    };
  
  return (
    <>
    <div className="relative">
      <Navbar 
          cartCount={totalItems} 
          toggleCart={toggleCart} 
          toggleMobileMenu={toggleMobileMenu}
      />
      
      <MobileMenu 
          isOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu}
      />

      <CartPanel 
          isOpen={isCartOpen}
          cartItems={cartItems}
          toggleCart={toggleCart}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          totalItems={totalItems}
          totalAmount={totalAmount}
      />
      
      <main>
        <Routes>
            <Route
                path="/"
                element={
                  <>
                    <HeroSection />
                    <ShopSection products={products} addToCart={addToCart} />
                    <CollectionsSection />
                    <NewsLetterSection />
                  </>
                }
            />
            <Route 
                path="/shop"
                element={<div className="container mx-auto px-4 py-16"><ShopSection products={products} addToCart={addToCart} /> </div>}
            />
            <Route 
                path="/collections" 
                element={<div className="container mx-auto px-4 py-16"><CollectionsSection /> </div> } 
            />
            <Route 
                path="/about" 
                element={<div className="container my-4 mx-auto px-4 py-16"><AboutSection /></div>} 
            />
            <Route 
                path="/contact" 
                element={<div className="container mx-auto px-4 py-16"><ContactSection /></div>} 
            />
            {/* Add more routes as needed */}
        </Routes>
      </main>
      


      <Footer />
      {showScrollButton && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-yellow-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-yellow-800 transition z-40"
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
      <ToastContainer />
        </div>
    </>
  )
}

function App() {
  return (
    <Router>
        <CartProvider>
            <ProductProvider>
                <AppCode />
            </ProductProvider>
        </CartProvider>
    </Router>
  )
}

export default App
