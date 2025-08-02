import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faBars } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.png';
import logoDark from '../assets/logo_dark.PNG';


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
                        <img
                            src={scrolled ? logoDark : logo}
                            alt="Zaki's Essence Logo"
                            className="h-8 w-auto max-w-none transition-transform hover:scale-110"
                            style={{ maxHeight: '32px', width: 'auto' }}
                        />
                    </Link>
                </div>

                <nav className="hidden md:flex space-x-8 animate-fade delay-1">
                    {[
                        { to: "/", label: "Home" },
                        { to: "/shop", label: "Shop" },
                        { to: "/collections", label: "Collections" },
                        { to: "/about", label: "About" },
                        { to: "/contact", label: "Contact" },
                        { to: "/track-order", label: "Track Order" }
                    ].map((item, index) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`text-nav ${scrolled ? 'text-gray-800' : 'text-gray-200'} hover:text-yellow-600 transition-all duration-300 relative group`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {item.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-700 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4 animate-slide-right">
                    <button
                        className={`relative ${scrolled ? 'text-gray-800' : 'text-gray-200'}  hover:text-yellow-700 transition-all duration-300 hover:scale-110 ${cartPulse ? 'cart-pulse' : ''
                            }`}
                        onClick={toggleCart}
                    >
                        <FontAwesomeIcon icon={faCartShopping} className="text-xl " />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-yellow-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scale font-bold">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        className={`md:hidden ${scrolled ? 'text-gray-800' : 'text-gray-200'} hover:text-yellow-700 transition-all duration-300 hover:scale-110 p-2`}
                        onClick={toggleMobileMenu}
                    >
                        <FontAwesomeIcon icon={faBars} className="text-xl" />
                    </button>
                </div>
            </div>
        </header>
    );
}


import { faXmark } from '@fortawesome/free-solid-svg-icons';

export function MobileMenu({ isOpen, toggleMobileMenu }) {
    const menuItems = [
        { href: "/", label: "Home" },
        { href: "/shop", label: "Shop" },
        { href: "/collections", label: "Collections" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/track-order", label: "Track Order" }
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleMobileMenu}
            />

            {/* Slide-in Menu */}
            <div className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white z-50 shadow-lg transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Close Button */}
                <div className="flex justify-end px-5 py-4">
                    <button onClick={toggleMobileMenu} aria-label="Close menu">
                        <FontAwesomeIcon icon={faXmark} className="text-2xl text-gray-600 hover:text-yellow-700 transition" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col px-6 py-2 space-y-4">
                    {menuItems.map((item, index) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={toggleMobileMenu}
                            className="text-lg text-gray-800 hover:text-yellow-700 font-medium tracking-wide transition-all duration-300"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
