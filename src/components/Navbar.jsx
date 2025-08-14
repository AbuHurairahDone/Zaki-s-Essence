import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faBars, faXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo.png';
import nav from '../assets/nav.png';

export function Navbar({ cartCount, toggleCart, toggleMobileMenu }) {
    const [scrolled, setScrolled] = useState(false);
    const [cartPulse, setCartPulse] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (cartCount > 0) {
            setCartPulse(true);
            const timer = setTimeout(() => setCartPulse(false), 500);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/shop", label: "Shop" },
        { to: "/collections", label: "Collections" },
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" },
        { to: "/track-order", label: "Track Order" }
    ];

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out bg-black py-2`}
        >
            <div className="container mx-auto px-4">
                {/* Top Row */}
                <div className="hidden md:grid grid-cols-3 items-center">
                    {/* Search */}
                    <div className="flex justify-start">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-3 py-1 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 w-56"
                        />
                    </div>

                    {/* Logo */}
                    <div className="flex justify-center">
                        <Link to="/" className="flex items-center gap-2 p-2">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-8 "
                            />
                            <img
                                src={nav}
                                alt="Logo"
                                className="h-8 "
                            />
                        </Link>
                    </div>

                    {/* Cart */}
                    <div className="flex justify-end">
                        <button
                            onClick={toggleCart}
                            className={`relative transition-transform duration-300 hover:scale-110 text-white
                            ${cartPulse ? 'animate-bounce' : ''}`}
                        >
                            <FontAwesomeIcon icon={faCartShopping} className="text-xl" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Navigation */}
                <nav className="hidden md:flex justify-center space-x-10 mt-3">
                    {navLinks.map((item, index) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="relative font-medium tracking-wide transition-all duration-300 group text-white"
                        >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-yellow-600 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                {/* Mobile Top Bar */}
                <div className="flex md:hidden justify-between items-center transition-all duration-300 ease-in-out">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <Link to="/" className="flex items-center gap-2 p-2">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-6 "
                            />
                            <img
                                src={nav}
                                alt="Logo"
                                className="h-6 "
                            />
                        </Link>
                    </div>

                    {/* Cart + Menu */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleCart}
                            className={`relative transition-transform duration-300 hover:scale-110 text-white
                            ${cartPulse ? 'animate-bounce' : ''}`}
                        >
                            <FontAwesomeIcon icon={faCartShopping} className="text-xl" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={toggleMobileMenu}
                            className="transition-transform duration-300 hover:scale-110 text-white"
                        >
                            <FontAwesomeIcon icon={faBars} className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar (Second Row) */}
                <div
                    className={`mt-3 px-2 md:hidden transition-all duration-500 ease-in-out overflow-hidden ${scrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-12 opacity-100'}`}
                    style={{ transform: scrolled ? 'translateY(-20px)' : 'translateY(0)' }}
                >
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-3 py-1 pl-8 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all duration-300 ease-in-out"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
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
        { href: "/contact", label: "Contact" },
        { href: "/track-order", label: "Track Order" }
    ];

    return (
        <>
            {/* Overlay */}
            <div
                onClick={toggleMobileMenu}
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Slide Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-end px-5 py-4">
                    <button onClick={toggleMobileMenu}>
                        <FontAwesomeIcon icon={faXmark} className="text-2xl text-gray-600 hover:text-yellow-600" />
                    </button>
                </div>

                <nav className="flex flex-col px-6 py-2 space-y-5">
                    {menuItems.map((item, index) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={toggleMobileMenu}
                            className="text-lg text-gray-800 hover:text-yellow-600 font-medium tracking-wide transition-all duration-300 ease-in-out"
                            style={{
                                transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
                                opacity: isOpen ? 1 : 0,
                                transitionDelay: `${index * 50}ms`,
                                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
