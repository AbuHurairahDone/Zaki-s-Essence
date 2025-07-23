import React from 'react';
function AboutSection() {
            return (
                <section id="about" className="py-16 bg-gray-900 text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-1/2 mb-8 md:mb-0">
                                <img 
                                    src="https://placehold.co/600x400/EEE/31343C?text=Perfume+Creation" 
                                    alt="Perfume artisan carefully crafting fragrance with natural ingredients" 
                                    className="rounded-lg shadow-lg w-full"
                                />
                            </div>
                            <div className="md:w-1/2 md:pl-12 animate-slide delay-1">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">The Art of Perfumery</h2>
                                <p className="mb-4">Founded in 2010, Essence has been dedicated to creating exceptional fragrances that capture emotions and memories.</p>
                                <p className="mb-6">Our master perfumers combine traditional techniques with modern innovation to craft scents that stand the test of time.</p>
                                <button className="bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-3 rounded-md font-medium transition">
                                    Read Our Story
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            );
        }
        
        export default AboutSection;