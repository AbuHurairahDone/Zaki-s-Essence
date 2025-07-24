import React, { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useIntersectionObserver, usePreventAnimationFlash, useScrollAnimation } from '../hooks/useAnimations.js';

function HeroSection() {
    const heroRef = useRef(null);
    const [contentRef, isContentVisible] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();
    const scrollY = useScrollAnimation();

    // Calculate parallax transforms with reduced intensity
    const backgroundTransform = `translateY(${scrollY * 0.3}px)`;
    const overlayTransform = `translateY(${scrollY * 0.2}px)`;
    const contentTransform = `translateY(${scrollY * 0.1}px)`;

    return (
        <section ref={heroRef} className="relative h-screen md:h-[80vh] flex items-center overflow-hidden">
            {/* Parallax Background */}
            <div
                className="absolute inset-0 w-full h-[120%] -top-[10%] gpu-accelerated"
                style={{ transform: backgroundTransform }}
            >
                <img
                    src="./src/assets/hero.jpg"
                    alt="Luxury perfume bottles elegantly displayed on a marble surface with soft lighting"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Parallax Overlay */}
            <div
                className="absolute inset-0 bg-black/30 hero-overlay gpu-accelerated"
                style={{ transform: overlayTransform }}
            ></div>

            {/* Parallax Content */}
            <div
                ref={contentRef}
                className={`container mx-auto px-4 relative z-10 text-white gpu-accelerated ${isContentVisible && isReady ? 'animate-fade' : 'opacity-0'
                    }`}
                style={{ transform: contentTransform }}
            >
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Discover Your Signature Scent
                    </h1>
                    <p className="text-lg md:text-xl mb-8">
                        Experience the art of perfumery with our curated collection of luxury fragrances from around the world.
                    </p>
                    <a
                        href="#shop"
                        className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100 smooth-transition inline-flex items-center btn-animate hover-lift"
                    >
                        Explore Now &nbsp; <FontAwesomeIcon icon={faArrowRight} className="smooth-transition" />
                    </a>
                </div>
            </div>

            {/* Enhanced scroll indicator */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <a href="#shop" className="animate-float inline-block hover:text-yellow-300 smooth-transition">
                    <i className="fas fa-chevron-down text-white text-2xl"></i>
                </a>
            </div>
        </section>
    );
}

export default HeroSection
