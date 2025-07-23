import React, { useState, useEffect, useContext } from 'react'
import { CartContext, CartProvider } from './contexts/CartContext.jsx'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'

import { products } from './products.js'

import {Navbar, MobileMenu} from './components/Navbar.jsx'
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
        <HeroSection />
        <ShopSection products={products} addToCart={addToCart} />
        <CollectionsSection />
        <AboutSection />
        <NewsLetterSection />
        <ContactSection />
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
      
        </div>
    </>
  )
}

function App() {
  return (
    <CartProvider>
      <AppCode />
    </CartProvider>
  )
}

export default App
