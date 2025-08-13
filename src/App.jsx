import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

import { CartContext } from './contexts/contexts.js'
import { ProductContext } from './contexts/contexts.js'
import { CartProvider } from './contexts/CartContext.jsx'
import { ProductProvider } from './contexts/Product.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp, } from '@fortawesome/free-brands-svg-icons';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import SEO and analytics hooks
import { usePageTracking, usePerformanceTracking } from './hooks/useAnalytics.js'
import { useSEO, usePageTracking as useSEOPageTracking, usePerformance } from './hooks/useSEO.js'
import GTMService from './services/gtmService.js'

import { Navbar, MobileMenu } from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import ShopSection from './components/ShopSection.jsx'
import CartPanel from './components/CartPanel.jsx'
import CollectionsSection from './components/CollectionsSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import OurStory from './components/OurStory.jsx'
import NewsLetterSection from './components/NewsLetterSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import TrackOrder from './components/TrackOrder.jsx'
import Footer from './components/Footer.jsx'
import AdminPanel from './components/admin/AdminPanel.jsx'
import ReviewOrder from './components/ReviewOrder.jsx'

// SEO-aware page components
function HomePage() {
    useSEO('home');
    const { products } = useContext(ProductContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        GTMService.trackPageView('home');
    }, []);

    return (
        <>
            <HeroSection />
            <ShopSection products={products} addToCart={addToCart} />
            <CollectionsSection />
            <NewsLetterSection />
        </>
    );
}

function ShopPage() {
    useSEO('shop');
    const { products } = useContext(ProductContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        GTMService.trackPageView('shop');
        GTMService.trackCollectionView('All Products', products.length);
    }, [products.length]);

    return (
        <div className="pt-10">
            <div className="container mx-auto px-4 py-8">
                {/* <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-luxury-title">
                    Premium Fragrance Collection
                </h1> */}
                <ShopSection products={products} addToCart={addToCart} />
            </div>
        </div>
    );
}

const openWhatsApp = () => {
    const number = "+923156684779"; // Replace with your business number
    const text = encodeURIComponent("Hi! I'm interested in your fragrances.");
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
};

function CollectionsPage() {
    useSEO('collections');

    useEffect(() => {
        GTMService.trackPageView('collections');
    }, []);

    return (
        <div className="pt-10">
            <div className="container mx-auto px-4 py-8">
                {/* <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-luxury-title">
                    Curated Fragrance Collections
                </h1> */}
                <CollectionsSection showAll={true} />
            </div>
        </div>
    );
}

function AboutPage() {
    useSEO('about');

    useEffect(() => {
        GTMService.trackPageView('about');
    }, []);

    return (
        <div className="pt-10">
            <div className="container mx-auto px-4 py-8">
                <AboutSection />
            </div>
        </div>
    );
}

function ContactPage() {
    useSEO('contact');

    useEffect(() => {
        GTMService.trackPageView('contact');
    }, []);

    return (
        <div className="pt-10">
            <div className="container mx-auto px-4 py-8">
                <ContactSection />
            </div>
        </div>
    );
}

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

    // Initialize analytics and performance tracking
    usePageTracking();
    usePerformanceTracking();
    useSEOPageTracking();
    usePerformance();

    // Initialize GTM on app load
    useEffect(() => {
        GTMService.initializeDataLayer();
    }, []);

    // Track cart view when cart is opened
    useEffect(() => {
        if (isCartOpen && cartItems.length > 0) {
            GTMService.trackViewCart(cartItems, totalAmount);
        }
    }, [isCartOpen, cartItems, totalAmount]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setShowScrollButton(scrollTop >= 200);
        };

        // Debounce scroll events for better performance
        let timeoutId;
        const debouncedHandleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScroll, 10);
        };

        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('scroll', debouncedHandleScroll);
        };
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
                    <h2 className="text-lg font-medium text-gray-800">Loading Zaki's Essence...</h2>
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

                        <main className="relative">
                            <PageTransition>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/shop" element={<ShopPage />} />
                                    <Route path="/collections" element={<CollectionsPage />} />
                                    <Route path="/about" element={<AboutPage />} />
                                    <Route path="/our-story" element={
                                        <div className="pt-10">
                                            <div className="container mx-auto px-4 py-8">
                                                <OurStory />
                                            </div>
                                        </div>
                                    } />
                                    <Route path="/contact" element={<ContactPage />} />
                                    <Route path="/track-order" element={
                                        <div className="pt-10">
                                            <div className="container mx-auto px-4 py-8">
                                                <TrackOrder />
                                            </div>
                                        </div>
                                    } />
                                    <Route path="/review-order/:orderId" element={<ReviewOrder />} />
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

            <button
                onClick={openWhatsApp}
                className="fixed  top-4/5 left-0 z-50 bg-green-500 hover:bg-green-700 text-white p-2 rounded-r-4xl shadow-lg transition transform hover:scale-110 animate-bounce"
                title="Chat with us on WhatsApp"
            >
                <FontAwesomeIcon size="2x" icon={faWhatsapp} className='' />
            </button>
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
