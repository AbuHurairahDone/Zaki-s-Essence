import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

import { CartContext } from './contexts/contexts.js'
import { ProductContext } from './contexts/contexts.js'
import { CartProvider } from './contexts/CartContext.jsx'
import { ProductProvider } from './contexts/Product.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import analytics hooks
import { usePageTracking, usePerformanceTracking } from './hooks/useAnalytics.js'

import { Navbar, MobileMenu } from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import ShopSection from './components/ShopSection.jsx'
import CartPanel from './components/CartPanel.jsx'
import CollectionsSection from './components/CollectionsSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import NewsLetterSection from './components/NewsLetterSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'
import AdminPanel from './components/admin/AdminPanel.jsx'

// Simplified page transition component
function PageTransition({ children }) {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState("fadeIn");

    useEffect(() => {
        if (location !== displayLocation) {
            setTransitionStage("fadeOut");
        }
    }, [location, displayLocation]);

    useEffect(() => {
        if (transitionStage === "fadeOut") {
            const timer = setTimeout(() => {
                setTransitionStage("fadeIn");
                setDisplayLocation(location);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [transitionStage, location]);

    return (
        <div
            className={`smooth-transition gpu-accelerated ${transitionStage === "fadeOut" ? "opacity-0" : "opacity-100"
                }`}
        >
            {children}
        </div>
    );
}

function AppCode() {
    const { isMobileMenuOpen, setIsMobileMenuOpen, isCartOpen, setIsCartOpen, toggleCart, cartItems, totalItems, totalAmount, addToCart, updateQuantity, removeItem } = useContext(CartContext);
    const { products } = useContext(ProductContext);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize analytics tracking
    usePageTracking();
    usePerformanceTracking();

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollButton(window.scrollY >= 200);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reduced loading time to prevent jitter
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsCartOpen(false);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-yellow-700 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h2 className="text-lg font-medium text-gray-800">Loading...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <Routes>
                {/* Admin Routes */}
                <Route path="/admin/*" element={<AdminPanel />} />

                {/* Main Website Routes */}
                <Route path="/*" element={
                    <>
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

                        <main className="overflow-hidden">
                            <PageTransition>
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
                                        element={
                                            <div className="pt-20">
                                                <div className="container mx-auto px-4 py-16">
                                                    <ShopSection products={products} addToCart={addToCart} />
                                                </div>
                                            </div>
                                        }
                                    />
                                    <Route
                                        path="/collections"
                                        element={
                                            <div className="pt-20">
                                                <div className="container mx-auto px-4 py-16">
                                                    <CollectionsSection />
                                                </div>
                                            </div>
                                        }
                                    />
                                    <Route
                                        path="/about"
                                        element={
                                            <div className="pt-20">
                                                <div className="container mx-auto px-4 py-16">
                                                    <AboutSection />
                                                </div>
                                            </div>
                                        }
                                    />
                                    <Route
                                        path="/contact"
                                        element={
                                            <div className="pt-20">
                                                <div className="container mx-auto px-4 py-16">
                                                    <ContactSection />
                                                </div>
                                            </div>
                                        }
                                    />
                                </Routes>
                            </PageTransition>
                        </main>

                        <Footer />

                        <button
                            onClick={scrollToTop}
                            className={`fixed bottom-6 right-6 bg-yellow-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-yellow-800 smooth-transition z-40 hover-lift gpu-accelerated ${showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                                }`}
                            aria-label="Scroll to top"
                        >
                            <FontAwesomeIcon icon={faArrowUp} className="smooth-transition" />
                        </button>
                    </>
                } />
            </Routes>

            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <ProductProvider>
                        <AppCode />
                    </ProductProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
