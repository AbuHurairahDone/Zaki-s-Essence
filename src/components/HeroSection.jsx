import React, { useRef, useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useIntersectionObserver, usePreventAnimationFlash, useScrollAnimation } from '../hooks/useAnimations.js';
import { AppDataService } from '../services/appDataService.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import heroImage from '@assets/hero.jpg';
// Use framer-motion for smooth, modern transitions
import { motion, useReducedMotion } from 'framer-motion';

// Alias motion.img so JSX usage is recognized by the linter
const MotionImg = motion.img;

function HeroSection() {
    const heroRef = useRef(null);
    const [contentRef,] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();
    const scrollY = useScrollAnimation();

    // Respect user reduced-motion preference
    const prefersReducedMotion = useReducedMotion();

    // Hero images state
    const [heroData, setHeroData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // base image index
    const [overlayIndex, setOverlayIndex] = useState(null); // incoming image index
    const [overlayLoaded, setOverlayLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        loadHeroData();
    }, []);

    const nextImage = useCallback(() => {
        if (!heroData?.images || heroData.images.length <= 1) return;
        if (overlayIndex !== null) return; // Already transitioning
        setIsTransitioning(true);
        const nextIdx = (currentImageIndex + 1) % heroData.images.length;
        setOverlayLoaded(false);
        setOverlayIndex(nextIdx);
        // Fade-out of previous is handled after overlay animates in
    }, [heroData?.images, currentImageIndex, overlayIndex]);

    // Auto-slide effect for carousel
    useEffect(() => {
        if (!heroData?.carouselEnabled || !heroData?.images || heroData.images.length <= 1) {
            return;
        }
        const interval = setInterval(() => {
            if (!isTransitioning) {
                nextImage();
            }
        }, heroData.autoSlideInterval || 5000);
        return () => clearInterval(interval);
    }, [heroData, isTransitioning, nextImage]);

    const loadHeroData = async () => {
        try {
            const data = await AppDataService.getHeroImages();
            setHeroData(data);
            const activeImageIndex = data.images.findIndex(img => img.isActive);
            setCurrentImageIndex(activeImageIndex >= 0 ? activeImageIndex : 0);
        } catch (error) {
            console.error('Error loading hero data:', error);
            setHeroData({
                images: [{
                    id: 'default',
                    url: heroImage,
                    alt: 'Luxury perfume bottles elegantly displayed on a marble surface with soft lighting',
                    isActive: true
                }],
                carouselEnabled: false
            });
        } finally {
            setLoading(false);
        }
    };

    // Preload next image to avoid flash between transitions
    useEffect(() => {
        if (!heroData?.images || heroData.images.length <= 1) return;
        const nextIdx = (currentImageIndex + 1) % heroData.images.length;
        const nextImageObj = heroData.images[nextIdx];
        if (!nextImageObj) return;
        const src = getOptimizedImageUrl(nextImageObj) || nextImageObj.url;
        if (!src) return;
        const img = new Image();
        img.src = src;
    }, [heroData, currentImageIndex]);

    // Get optimized image URL for current viewport with best quality
    const getOptimizedImageUrl = (image) => {
        if (!image) return null;
        return CloudinaryService.getHeroQualityUrl(image.url, {
            width: window.innerWidth > 1920 ? 2560 : window.innerWidth * 1.5,
            height: window.innerHeight > 1080 ? 1440 : window.innerHeight * 1.5
        });
    };

    // Calculate parallax transforms with reduced intensity
    const backgroundTransform = `translateY(${scrollY * 0.3}px)`;
    const overlayTransform = `translateY(${scrollY * 0.2}px)`;
    const contentTransform = `translateY(${scrollY * 0.1}px)`;

    if (loading) {
        return (
            <section className="relative h-screen flex items-center overflow-hidden bg-gray-900">
                <img src={heroImage} alt="Loading hero" className="w-full h-full object-cover" loading="eager" />
            </section>
        );
    }

    const currentImage = heroData?.images?.[currentImageIndex];
    const overlayImage = overlayIndex !== null ? heroData?.images?.[overlayIndex] : null;

    return (
        <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
            {/* Parallax Background */}
            <div
                className="absolute inset-0 w-full h-[120%] -top-[10%] gpu-accelerated bg-black"
                style={{ transform: backgroundTransform }}
            >
                {/* Base image stays visible */}
                {currentImage && (
                    <MotionImg
                        key={`base-${currentImage.id || currentImage.url || currentImageIndex}`}
                        src={getOptimizedImageUrl(currentImage) || currentImage.url}
                        alt={currentImage.alt}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none will-change-transform will-change-opacity"
                        initial={false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0 }}
                        loading="eager"
                    />
                )}

                {/* Overlay image waits for load, then crossfades in; on complete, swap base */}
                {overlayImage && (
                    <MotionImg
                        key={`overlay-${overlayImage.id || overlayImage.url || overlayIndex}`}
                        src={getOptimizedImageUrl(overlayImage) || overlayImage.url}
                        alt={overlayImage.alt}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none will-change-transform will-change-opacity"
                        onLoad={() => setOverlayLoaded(true)}
                        initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.05 }}
                        animate={{ opacity: overlayLoaded ? 1 : 0, scale: 1 }}
                        transition={{ duration: prefersReducedMotion ? 0.4 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                        onAnimationComplete={() => {
                            if (overlayLoaded && overlayIndex !== null) {
                                setCurrentImageIndex(overlayIndex);
                                setOverlayIndex(null);
                                setOverlayLoaded(false);
                                setIsTransitioning(false);
                            }
                        }}
                    />
                )}
            </div>

            {/* Parallax Overlay */}
            <div className="absolute inset-0 bg-black/50 hero-overlay gpu-accelerated" style={{ transform: overlayTransform }}></div>

            {/* Parallax Content */}
            <div
                ref={contentRef}
                className={`container mx-auto px-4 relative z-10 text-white gpu-accelerated ${isReady ? 'animate-fade' : 'opacity-0'}`}
                style={{ transform: contentTransform }}
            >
                <div className="max-w-4xl">
                    <p className="text-hero-title text-4xl md:text-6xl text-gold-gradient  pb-4 text-shadow-luxury ">
                        Discover Your Signature Scent
                    </p>
                    <p className="text-luxury-body text-lg md:text-2xl mb-8 text-white/90 pb-4">
                        Experience the art of perfumery with our curated collection of luxury fragrances from around the world.
                    </p>
                    <a
                        href="#shop"
                        className="text-button bg-white text-gray-900 px-6 py-3 rounded-md hover:bg-gray-200 smooth-transition inline-flex items-center btn-animate hover-lift"
                    >
                        Explore Now &nbsp; <FontAwesomeIcon icon={faArrowRight} className="smooth-transition" />
                    </a>
                </div>
            </div>

            {/* Enhanced scroll indicator */}
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
                <a href="#shop" className="animate-float inline-block hover:text-amber-400 smooth-transition">
                    <i className="fas fa-chevron-down text-white text-2xl"></i>
                </a>
            </div>
        </section>
    );
}

export default HeroSection
