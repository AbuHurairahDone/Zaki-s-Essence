import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faBars } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.png';

export function Navbar({ cartCount, toggleCart, toggleMobileMenu }) {
    const [scrolled, setScrolled] = useState(false);
    const [cartPulse, setCartPulse] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animate cart when count changes
    useEffect(() => {
        if (cartCount > 0) {
            setCartPulse(true);
            const timer = setTimeout(() => setCartPulse(false), 600);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    return (
        <header className={`navbar fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
            : 'bg-transparent py-3'
            }`}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center animate-slide-left">
                    <Link to="/" className="border border-yellow-700 p-2 text-gray-800 hover:text-yellow-700 transition-all duration-300 hover:border-yellow-800 hover:shadow-md rounded">
                        <img src={logo} alt="Logo" className="h-8 transition-transform hover:scale-110" />
                    </Link>
                </div>

                <nav className="hidden md:flex space-x-8 animate-fade delay-1">
                    {[
                        { to: "/", label: "Home" },
                        { to: "/shop", label: "Shop" },
                        { to: "/collections", label: "Collections" },
                        { to: "/about", label: "About" },
                        { to: "/contact", label: "Contact" }
                    ].map((item, index) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="text-gray-800 hover:text-yellow-700 transition-all duration-300 relative group font-medium animate-fade"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-700 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4 animate-slide-right">
                    <button
                        className={`relative text-gray-800 hover:text-yellow-700 transition-all duration-300 hover:scale-110 ${cartPulse ? 'cart-pulse' : ''
                            }`}
                        onClick={toggleCart}
                    >
                        <FontAwesomeIcon icon={faCartShopping} className="text-xl" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-yellow-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scale font-bold">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        className="md:hidden text-gray-800 hover:text-yellow-700 transition-all duration-300 hover:scale-110 p-2"
                        onClick={toggleMobileMenu}
                    >
                        <FontAwesomeIcon icon={faBars} className="text-xl" />
                    </button>
                </div>
            </div>
        </header>
    );
}

export function MobileMenu({ isOpen, toggleMobileMenu }) {
    const menuItems = [
        { href: "/", label: "Home" },
        { href: "/shop", label: "Shop" },
        { href: "/collections", label: "Collections" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" }
    ];

    return (
        <div className={`mobile-menu md:hidden fixed top-16 inset-x-0 bg-white/95 backdrop-blur-md shadow-lg py-6 px-4 z-40 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
            }`}>
            <nav className="flex flex-col space-y-6">
                {menuItems.map((item, index) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`text-gray-800 hover:text-yellow-700 transition-all duration-300 font-medium text-lg py-2 border-b border-gray-100 hover:border-yellow-700 animate-slide-right ${isOpen ? 'animate-fade' : ''
                            }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={toggleMobileMenu}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
