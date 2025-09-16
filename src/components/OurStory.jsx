import React from 'react';
import { useIntersectionObserver } from '../hooks/useAnimations.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHeart,
    faStar,

    faAward,
    faUsers,
    faHistory,
    faLightbulb,
    faHandsHelping,
    faShieldAlt,
    faBullseye
} from '@fortawesome/free-solid-svg-icons';
import logo_bg from '@assets/logo_bg.JPG';
import { useSEO } from '../hooks/useSEO.js';

function OurStory() {
    useSEO('our-story');
    const [heroRef, isHeroVisible] = useIntersectionObserver();
    const [storyRef, isStoryVisible] = useIntersectionObserver();
    const [craftsmanshipRef, isCraftsmanshipVisible] = useIntersectionObserver();
    const [valuesRef, areValuesVisible] = useIntersectionObserver();
    const [missionRef, isMissionVisible] = useIntersectionObserver();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-32 overflow-hidden"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div
                        className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isHeroVisible ? 'animate-fade opacity-100' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        <h1 className="text-heading-artistic text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
                            Our <span className="text-gold-gradient">Story</span>
                        </h1>
                        <p className="text-luxury-body text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
                            Where Scent Meets Soul
                        </p>
                        <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Welcome & Brand Story */}
            <section
                ref={storyRef}
                className="py-16 md:py-24 bg-white"
            >
                <div className="container mx-auto px-4">
                    <div
                        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isStoryVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        {/* Text Content */}
                        <div className="order-2 lg:order-1">
                            <div className="flex items-center mb-6">
                                <FontAwesomeIcon icon={faHeart} className="text-yellow-700 text-2xl mr-3" />
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Welcome to Zaki's Essence</h2>
                            </div>
                            <div className="space-y-6 text-gray-700 leading-relaxed">
                                <p className="text-lg">
                                    At <strong className="text-yellow-700">Zaki's Essence</strong>, we don't just create perfumes —
                                    we craft unforgettable experiences. Born out of a passion for excellence and a deep respect
                                    for authenticity, our brand represents a new era of fragrance in Pakistan: one that fuses
                                    premium quality, modern aesthetics, and timeless values.
                                </p>
                                <p>
                                    We believe in <em className="text-yellow-700 font-semibold">letting the product speak for itself</em>.
                                    That's why you won't see exaggerated celebrity endorsements or artificial hype. Instead,
                                    our growth is rooted in real experiences, word-of-mouth, and a loyal community that believes
                                    in substance over noise.
                                </p>
                                <p>
                                    We don't follow trends or chase impressions — <em className="text-yellow-700 font-semibold">we create
                                        our own space with a unique identity that sets us apart in the market.</em>
                                </p>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="order-1 lg:order-2">
                            <div className="relative group">
                                <img
                                    src={logo_bg}
                                    alt="Zaki's Essence - Where scent meets soul"
                                    className="w-full rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Craftsmanship & Quality */}
            <section
                ref={craftsmanshipRef}
                className="py-16 md:py-24 bg-gray-50"
            >
                <div className="container mx-auto px-4">
                    <div
                        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isCraftsmanshipVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        {/* Image */}
                        <div className="relative group">
                            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-8 shadow-2xl">
                                <div className="flex items-center justify-center h-64">
                                    <FontAwesomeIcon icon={faAward} className="text-yellow-700 text-8xl" />
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div>
                            <div className="flex items-center mb-6">
                                <FontAwesomeIcon icon={faLightbulb} className="text-yellow-700 text-2xl mr-3" />
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Craftsmanship</h2>
                            </div>
                            <div className="space-y-6 text-gray-700 leading-relaxed">
                                <p className="text-lg">
                                    Each scent is a labor of love — developed through meticulous research, carefully
                                    blended by hand, and enhanced through cutting-edge machinery to ensure consistency
                                    and excellence.
                                </p>
                                <p>
                                    Our perfumes are made to last, to impress, and to become a part of your daily journey —
                                    whether you're heading to a professional meeting or a casual outing.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    <div className="bg-white p-4 rounded-lg shadow-md">
                                        <FontAwesomeIcon icon={faHistory} className="text-yellow-700 text-xl mb-2" />
                                        <h4 className="font-semibold text-gray-900">Meticulous Research</h4>
                                        <p className="text-sm text-gray-600">Every fragrance starts with careful study and planning</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-md">
                                        <FontAwesomeIcon icon={faHandsHelping} className="text-yellow-700 text-xl mb-2" />
                                        <h4 className="font-semibold text-gray-900">Hand-Blended</h4>
                                        <p className="text-sm text-gray-600">Carefully crafted by skilled artisans</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values & Principles */}
            <section
                ref={valuesRef}
                className="py-16 md:py-24 bg-white"
            >
                <div className="container mx-auto px-4">
                    <div
                        className={`text-center mb-16 transition-all duration-1000 ${areValuesVisible ? 'animate-fade opacity-100' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Our Values & Principles
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            We take pride in maintaining our values with clean brand identity and unwavering ethical foundation
                        </p>
                    </div>

                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${areValuesVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        {/* Value Cards */}
                        {[
                            {
                                icon: faShieldAlt,
                                title: "Authentic Excellence",
                                description: "We believe in substance over noise, letting our products speak for themselves without artificial hype.",
                                color: "text-blue-600 bg-blue-100"
                            },
                            {
                                icon: faUsers,
                                title: "Community Driven",
                                description: "Our growth is rooted in real experiences, word-of-mouth, and a loyal community that believes in quality.",
                                color: "text-green-600 bg-green-100"
                            },
                            {
                                icon: faLightbulb,
                                title: "Unique Identity",
                                description: "We create our own space in the market with distinctive character that sets us apart from the crowd.",
                                color: "text-purple-600 bg-purple-100"
                            },
                            {
                                icon: faHeart,
                                title: "Islamic Values",
                                description: "We never compromise on our Islamic principles, maintaining ethical standards in all our practices.",
                                color: "text-red-600 bg-red-100"
                            },
                            {
                                icon: faStar,
                                title: "Modest Marketing",
                                description: "Clean, honest marketing that reflects our values without contradicting our ethical foundation.",
                                color: "text-yellow-600 bg-yellow-100"
                            },
                            {
                                icon: faAward,
                                title: "Premium Quality",
                                description: "Uncompromising commitment to excellence in every bottle we create and every experience we deliver.",
                                color: "text-indigo-600 bg-indigo-100"
                            }
                        ].map((value, index) => (
                            <div
                                key={value.title}
                                className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group animate-scale border-l-4 border-yellow-700`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <FontAwesomeIcon icon={value.icon} className="text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Statement */}
            <section
                ref={missionRef}
                className="py-16 md:py-24 bg-gradient-to-r from-yellow-700 to-yellow-800 text-white"
            >
                <div className="container mx-auto px-4">
                    <div
                        className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isMissionVisible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-10'
                            }`}
                    >
                        <div className="flex items-center justify-center mb-8">
                            <FontAwesomeIcon icon={faBullseye} className="text-yellow-200 text-4xl mr-4" />
                            <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl mb-8">
                            <p className="text-xl md:text-2xl font-semibold mb-4 text-yellow-100">
                                Our mission is bold yet simple:
                            </p>
                            <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-6">
                                <em>To become Pakistan's #1 premium, trusted, and unique scent brand —
                                    and to take this identity global.</em>
                            </p>
                        </div>

                        <div className="text-lg md:text-xl text-yellow-100 leading-relaxed">
                            <p>
                                If you're looking for something that stands out — not just in scent but in spirit —
                                then welcome to <strong className="text-white">Zaki's Essence</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 md:py-24 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Experience the Difference
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                            Join our community and discover why substance matters more than noise
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/shop"
                                className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                Explore Our Collection
                            </a>
                            <a
                                href="/contact"
                                className="border-2 border-yellow-700 text-yellow-700 hover:bg-primary hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                            >
                                Get in Touch
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default OurStory;
