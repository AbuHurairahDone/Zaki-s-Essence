import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faWhatsapp, } from '@fortawesome/free-brands-svg-icons';
import { useIntersectionObserver } from '../hooks/useAnimations.js';

function Footer() {
    const [footerRef, isFooterVisible] = useIntersectionObserver();

    const footerSections = [
        {
            title: "Zaki's Essence",
            content: "Luxury perfumes crafted with passion and precision.",
            type: "brand"
        },
        {
            title: "Shop",
            links: [
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: "Collections", href: "/collections" },
                { label: "About", href: "/about" },
            ]
        },
        {
            title: "Help",
            links: [
                { label: "Contact", href: "/contact" },
                { label: "Track Order", href: "/track-order" }
            ]
        },
        {
            title: "Connect",
            type: "social"
        }
    ];

    const socialIcons = [
        { icon: faFacebook, href: "https://www.facebook.com/profile.php?id=61577027240104", label: "Facebook" },
        { icon: faInstagram, href: "https://www.instagram.com/zakisessence/", label: "Instagram" },
        { icon: faWhatsapp, href: "https://api.whatsapp.com/send/?phone=923156684779", label: "WhatsApp" }
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
                                                target='_blank'
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
                                            <li key={link.label}>
                                                <a
                                                    href={link.href}
                                                    className="text-gray-400 hover:text-white transition-all duration-300 relative group animate-slide-left"
                                                    style={{ animationDelay: `${linkIndex * 0.1}s` }}
                                                >
                                                    {link.label}
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
                        © 2025 Zaki's Essence. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer
