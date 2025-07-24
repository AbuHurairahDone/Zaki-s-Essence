import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faXTwitter, } from '@fortawesome/free-brands-svg-icons';
import { useIntersectionObserver } from '../hooks/useAnimations.js';

function Footer() {
    const [footerRef, isFooterVisible] = useIntersectionObserver();

    const footerSections = [
        {
            title: "ESSENCE",
            content: "Luxury perfumes crafted with passion and precision.",
            type: "brand"
        },
        {
            title: "Shop",
            links: [
                "All Perfumes",
                "Collections",
                "Gift Sets",
                "Limited Editions"
            ]
        },
        {
            title: "Help",
            links: [
                "FAQ",
                "Shipping",
                "Returns",
                "Contact Us"
            ]
        },
        {
            title: "Connect",
            type: "social"
        }
    ];

    const socialIcons = [
        { icon: faFacebook, href: "#", label: "Facebook" },
        { icon: faInstagram, href: "#", label: "Instagram" },
        { icon: faXTwitter, href: "#", label: "Twitter" }
    ];

    return (
        <footer className="bg-gray-900 text-white py-12 overflow-hidden">
            <div className="container mx-auto px-4">
                <div
                    ref={footerRef}
                    className={`grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 transition-all duration-1000 ${isFooterVisible ? 'animate-slide' : 'opacity-0 translate-y-10'
                        }`}
                >
                    {footerSections.map((section, index) => (
                        <div
                            key={section.title}
                            className={`animate-fade delay-${index + 1}`}
                        >
                            {section.type === "brand" ? (
                                <>
                                    <h4 className="text-xl font-bold mb-4 text-yellow-400 animate-pulse">
                                        {section.title}
                                    </h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        {section.content}
                                    </p>
                                </>
                            ) : section.type === "social" ? (
                                <>
                                    <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                                    <div className="flex space-x-4">
                                        {socialIcons.map((social, socialIndex) => (
                                            <a
                                                key={social.label}
                                                href={social.href}
                                                className="text-gray-400 hover:text-white transition-all duration-300 text-xl hover:scale-125 hover-lift animate-scale"
                                                style={{ animationDelay: `${socialIndex * 0.1}s` }}
                                                aria-label={social.label}
                                            >
                                                <FontAwesomeIcon icon={social.icon} />
                                            </a>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                                    <ul className="space-y-2">
                                        {section.links.map((link, linkIndex) => (
                                            <li key={link}>
                                                <a
                                                    href="#"
                                                    className="text-gray-400 hover:text-white transition-all duration-300 relative group animate-slide-left"
                                                    style={{ animationDelay: `${linkIndex * 0.1}s` }}
                                                >
                                                    {link}
                                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 pt-8 animate-fade delay-5">
                    <p className="text-gray-400 text-center hover:text-gray-300 transition-colors duration-300">
                        © 2023 Essence Perfumes. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer
