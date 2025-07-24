import React, { useState } from 'react';
import { toast } from "react-toastify";
import { useIntersectionObserver } from '../hooks/useAnimations.js';

function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sectionRef, isSectionVisible] = useIntersectionObserver();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success("Message sent successfully!", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });

        setFormData({ name: '', email: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <section id="contact" className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div
                    ref={sectionRef}
                    className={`text-center mb-12 transition-all duration-800 ${isSectionVisible ? 'animate-slide' : 'opacity-0 translate-y-10'
                        }`}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade">Contact Us</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto animate-fade delay-1">
                        Have questions? Reach out to our fragrance experts.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-md p-8 hover-lift animate-scale delay-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="animate-slide delay-3">
                            <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-field w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-300"
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div className="animate-slide delay-4">
                            <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-field w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-300"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>

                        <div className="animate-slide delay-5">
                            <label htmlFor="message" className="block text-gray-700 mb-2 font-medium">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                className="form-field w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-300 resize-none"
                                placeholder="Tell us how we can help you..."
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-4 rounded-md font-medium text-lg btn-animate hover-lift transition-all duration-300 animate-fade delay-6 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                                    Sending Message...
                                </div>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default ContactSection
