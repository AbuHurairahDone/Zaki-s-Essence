import React from 'react';
import { useIntersectionObserver } from '../hooks/useAnimations.js';

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
                                src="https://placehold.co/600x400/EEE/31343C?text=Perfume+Creation"
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
                            The Art of Perfumery
                        </h2>
                        <p className="mb-4 text-gray-300 leading-relaxed animate-fade delay-2">
                            Founded in 2010, Essence has been dedicated to creating exceptional fragrances that capture emotions and memories.
                        </p>
                        <p className="mb-8 text-gray-300 leading-relaxed animate-fade delay-3">
                            Our master perfumers combine traditional techniques with modern innovation to craft scents that stand the test of time.
                        </p>
                        <button className="bg-yellow-700 hover:bg-yellow-800 text-white px-8 py-3 rounded-md font-medium transition-all duration-300 btn-animate hover-lift animate-fade delay-4 shadow-lg hover:shadow-xl">
                            Read Our Story
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutSection;
