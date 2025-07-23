import React,{ useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {  } from '@fortawesome/free-solid-svg-icons';
import { faCartShopping, faBars } from '@fortawesome/free-solid-svg-icons';




export function Navbar({ cartCount, toggleCart, toggleMobileMenu }) {
    const [scrolled, setScrolled] = useState(false);
    
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
    
    return (
        <header className={` navbar fixed top-0 w-full z-50 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'} transition-all duration-300`}>
            <div className=" container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <a href="#" className="border border-yellow-700 p-2 text-gray-800 hover:text-yellow-700 transition">
                        <img src="./src/assets/logo.png" alt="Logo" className="h-8" />
                    </a>
                </div>
                
                <div className="hidden md:flex space-x-6">
                    <Link to="/" className="text-gray-800 hover:text-yellow-700 transition">Home</Link>
                    <Link to="/shop" className="text-gray-800 hover:text-yellow-700 transition">Shop</Link>
                    <Link to="/collections" className="text-gray-800 hover:text-yellow-700 transition">Collections</Link>
                    <Link to="/about" className="text-gray-800 hover:text-yellow-700 transition">About</Link>
                    <Link to="/contact" className="text-gray-800 hover:text-yellow-700 transition">Contact</Link>
                    {/* <a href="#" className="text-gray-800 hover:text-yellow-700 transition">Home</a>
                    <a href="#shop" className="text-gray-800 hover:text-yellow-700 transition">Shop</a>
                    <a href="#collections" className="text-gray-800 hover:text-yellow-700 transition">Collections</a>
                    <a href="#about" className="text-gray-800 hover:text-yellow-700 transition">About</a>
                    <a href="#contact" className="text-gray-800 hover:text-yellow-700 transition">Contact</a> */}
                    
                </div>
                
                <div className="flex items-center space-x-4">
                    <button 
                        className="relative text-gray-800 hover:text-yellow-700 transition"
                        onClick={toggleCart}
                    >
                        <FontAwesomeIcon icon={faCartShopping} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-yellow-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    
                    <button 
                        className="md:hidden text-gray-800 hover:text-yellow-700 transition"
                        onClick={toggleMobileMenu}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>
            </div>
        </header>
    );
}


export function MobileMenu({ isOpen, toggleMobileMenu }) {
            return (
                <div className={`mobile-menu md:hidden fixed top-16 inset-x-0 bg-white shadow-lg py-4 px-4 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'} transform transition-all duration-300 z-40 ${isOpen ? 'block' : 'hidden'}`}>
                    <div className="flex flex-col space-y-4">
                        <a href="#" className="text-gray-800 hover:text-yellow-700 transition" onClick={toggleMobileMenu}>Home</a>
                        <a href="#shop" className="text-gray-800 hover:text-yellow-700 transition" onClick={toggleMobileMenu}>Shop</a>
                        <a href="#collections" className="text-gray-800 hover:text-yellow-700 transition" onClick={toggleMobileMenu}>Collections</a>
                        <a href="#about" className="text-gray-800 hover:text-yellow-700 transition" onClick={toggleMobileMenu}>About</a>
                    </div>
                </div>
            );
        }