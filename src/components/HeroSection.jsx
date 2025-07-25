import React, { useRef, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, } from '@fortawesome/free-solid-svg-icons';
import { useIntersectionObserver, usePreventAnimationFlash, useScrollAnimation } from '../hooks/useAnimations.js';
import { AppDataService } from '../services/appDataService.js';

function HeroSection() {
    const heroRef = useRef(null);
    const [contentRef,] = useIntersectionObserver();
    const isReady = usePreventAnimationFlash();
    const scrollY = useScrollAnimation();

    // Hero images state
    const [heroData, setHeroData] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        loadHeroData();
    }, []);

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
    }, [heroData, currentImageIndex, isTransitioning]);

    const loadHeroData = async () => {
        try {
            const data = await AppDataService.getHeroImages();
            setHeroData(data);

            // Set initial image to active one or first image
            const activeImageIndex = data.images.findIndex(img => img.isActive);
            setCurrentImageIndex(activeImageIndex >= 0 ? activeImageIndex : 0);
        } catch (error) {
            console.error('Error loading hero data:', error);
            // Fallback to default image
            setHeroData({
                images: [{
                    id: 'default',
                    url: './src/assets/hero.jpg',
                    alt: 'Luxury perfume bottles elegantly displayed on a marble surface with soft lighting',
                    isActive: true
                }],
                carouselEnabled: false
            });
        } finally {
            setLoading(false);
        }
    };

    const nextImage = () => {
        if (!heroData?.images || heroData.images.length <= 1) return;

        setIsTransitioning(true);
        setCurrentImageIndex((prev) => (prev + 1) % heroData.images.length);
        setTimeout(() => setIsTransitioning(false), 300);
    };



    const goToImage = (index) => {
        if (index === currentImageIndex || !heroData?.images) return;

        setIsTransitioning(true);
        setCurrentImageIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    // Get optimized image URL for current viewport
    const getOptimizedImageUrl = (image) => {
        if (!image) return null;

        // Use AppDataService's optimized URL method
        return AppDataService.getOptimizedImageUrl(image, {
            width: window.innerWidth > 1920 ? 1920 : window.innerWidth,
            height: window.innerHeight > 1080 ? 1080 : window.innerHeight,
            quality: 'auto:good',
            format: 'auto',
            crop: 'fill',
            gravity: 'auto'
        });
    };

    // Calculate parallax transforms with reduced intensity
    const backgroundTransform = `translateY(${scrollY * 0.3}px)`;
    const overlayTransform = `translateY(${scrollY * 0.2}px)`;
    const contentTransform = `translateY(${scrollY * 0.1}px)`;

    if (loading) {
        return (
            <section className="relative h-screen md:h-[80vh] flex items-center overflow-hidden bg-gray-900">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
                </div>
            </section>
        );
    }

    const currentImage = heroData?.images?.[currentImageIndex];
    const showCarouselControls = heroData?.carouselEnabled && heroData?.images?.length > 1;

    return (
        <section ref={heroRef} className="relative h-screen md:h-[80vh] flex items-center overflow-hidden">
            {/* Parallax Background */}
            <div
                className="absolute inset-0 w-full h-[120%] -top-[10%] gpu-accelerated"
                style={{ transform: backgroundTransform }}
            >
                {currentImage && (
                    <img
                        src={getOptimizedImageUrl(currentImage) || currentImage.url}
                        alt={currentImage.alt}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isTransitioning ? 'opacity-75' : 'opacity-100'
                            }`}
                        loading="eager"
                    />
                )}
            </div>

            {/* Parallax Overlay */}
            <div
                className="absolute inset-0 bg-black/30 hero-overlay gpu-accelerated"
                style={{ transform: overlayTransform }}
            ></div>

            {/* Carousel Navigation */}
            {showCarouselControls && (
                <>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
                        {heroData.images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                                    ? 'bg-white scale-125'
                                    : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Parallax Content */}
            <div
                ref={contentRef}
                className={`container mx-auto px-4 relative z-10 text-white gpu-accelerated ${isReady ? 'animate-fade' : 'opacity-0'
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
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
                <a href="#shop" className="animate-float inline-block hover:text-yellow-300 smooth-transition">
                    <i className="fas fa-chevron-down text-white text-2xl"></i>
                </a>
            </div>
        </section>
    );
}

export default HeroSection
