 import React from 'react'
 import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
 import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

 function HeroSection() {
            return (
                <section className="relative h-screen md:h-[80vh] flex items-center">
                    <div className="absolute inset-0 bg-black/30 hero-overlay"></div>
                    <img 
                        src="./src/assets/hero.jpg" 
                        alt="Luxury perfume bottles elegantly displayed on a marble surface with soft lighting" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    <div className="container mx-auto px-4 relative z-10 text-white animate-slide">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Your Signature Scent</h1>
                            <p className="text-lg md:text-xl mb-8">Experience the art of perfumery with our curated collection of luxury fragrances from around the world.</p>
                            <a 
                                href="#shop" 
                                className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition inline-flex items-center"
                            >
                                Explore Now &nbsp; <FontAwesomeIcon icon={faArrowRight} />
                            </a>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <a href="#shop" className="animate-bounce inline-block">
                            <i className="fas fa-chevron-down text-white text-2xl"></i>
                        </a>
                    </div>
                </section>
            );
        }

export default HeroSection