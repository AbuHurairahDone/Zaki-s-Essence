 import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faFacebook, faInstagram, faXTwitter, } from '@fortawesome/free-brands-svg-icons';



 function Footer() {
            return (
                <footer className="bg-gray-900 text-white py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <h4 className="text-xl font-bold mb-4">ESSENCE</h4>
                                <p className="text-gray-400">Luxury perfumes crafted with passion and precision.</p>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Shop</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">All Perfumes</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">Collections</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">Gift Sets</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">Limited Editions</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Help</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">Shipping</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">Returns</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Connect</h4>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                                        <FontAwesomeIcon icon={faFacebook} />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                                        <FontAwesomeIcon icon={faInstagram} />
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                                        <FontAwesomeIcon icon={faXTwitter} />
                                    </a>   
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-800 pt-8">
                            <p className="text-gray-400 text-center">© 2023 Essence Perfumes. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            );
        }
        
        export default Footer