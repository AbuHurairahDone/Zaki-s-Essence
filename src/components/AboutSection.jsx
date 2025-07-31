import React from 'react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useAnimations.js';
import logo_bg from '../assets/logo_bg.JPG'

function AboutSection() {
    const [sectionRef, isSectionVisible] = useIntersectionObserver();
    const [imageRef, isImageVisible] = useIntersectionObserver();
    const [textRef, isTextVisible] = useIntersectionObserver();

    return (
        <section id="about" className="py-16 bg-gray-900 text-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div
                    ref={sectionRef}
                    className="flex flex-col md:flex-row items-center gap-12"
                >
                    <div
                        ref={imageRef}
                        className={`md:w-1/2 mb-8 md:mb-0 transition-all duration-1000 ${isImageVisible ? 'animate-slide-left' : 'opacity-0 -translate-x-10'
                            }`}
                    >
                        <div className="relative group">
                            <img
                                src={logo_bg}
                                alt="Perfume artisan carefully crafting fragrance with natural ingredients"
                                className="rounded-lg shadow-2xl w-full transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>

                    <div
                        ref={textRef}
                        className={`md:w-1/2 md:pl-12 transition-all duration-1000 delay-300 ${isTextVisible ? 'animate-slide-right' : 'opacity-0 translate-x-10'
                            }`}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade delay-1">
                            Zaki's Essence — Where Scent Meets Soul
                        </h2>
                        <p className="mb-4 text-gray-300 leading-relaxed animate-fade delay-2">
                            At Zaki's Essence, we don't just create perfumes — we craft unforgettable experiences.
                        </p>
                        <p className="mb-8 text-gray-300 leading-relaxed animate-fade delay-3">
                            Born out of a passion for excellence and a deep respect for authenticity, our brand represents a new era of fragrance in Pakistan: one that fuses premium quality, modern aesthetics, and timeless values.

                        </p>
                        <Link
                            to="/our-story"
                            className="bg-yellow-700 hover:bg-yellow-800 text-white px-8 py-3 rounded-md font-medium transition-all duration-300 btn-animate hover-lift animate-fade delay-4 shadow-lg hover:shadow-xl inline-block"
                        >
                            Read Our Story
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutSection;
