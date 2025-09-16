import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useAnimations.js';
import { AnalyticsService } from '../services/analyticsService.js';

function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [sectionRef, isSectionVisible] = useIntersectionObserver();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Track newsletter signup attempt
            AnalyticsService.trackNewsletterSignup(email);
            AnalyticsService.trackFunnelStep(3, 'newsletter_signup', {
                email_provided: !!email,
                source: 'homepage'
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsSubscribed(true);
            setTimeout(() => {
                setEmail("");
                setIsSubscribed(false);
                setIsSubmitting(false);
            }, 3000);
        } catch (error) {
            console.error('Newsletter signup error:', error);
            AnalyticsService.trackError('newsletter_error', error.message, 'newsletter_signup');
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 bg-gray-100">
            <div className="container mx-auto px-4">
                <div
                    ref={sectionRef}
                    className={`max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 hover-lift transition-all duration-1000 ${isSectionVisible ? 'animate-scale' : 'opacity-0 scale-95'
                        }`}
                >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2 mb-6 md:mb-0 animate-slide-left delay-1">
                            <h3 className="text-luxury-title text-2xl md:text-3xl mb-3 text-gray-800">
                                Stay Updated
                            </h3>
                            <p className="text-luxury-body text-gray-600 leading-relaxed">
                                Join our newsletter for exclusive offers, new arrivals, and fragrance tips delivered to your inbox.
                            </p>
                        </div>

                        <div className="md:w-1/2 w-full animate-slide-right delay-2">
                            {isSubscribed ? (
                                <div className="text-center animate-fade">
                                    <div className="text-green-500 text-4xl mb-3 animate-bounce">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                        Thank you for subscribing!
                                    </h4>
                                    <p className="text-gray-600">
                                        You'll receive our latest updates and exclusive offers.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        className="form-field flex-1 px-4 py-3 rounded-md sm:rounded-l-md sm:rounded-r-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-950 focus:border-transparent transition-all duration-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !email}
                                        className={`bg-primary hover:bg-secondary text-white px-6 py-3 rounded-md sm:rounded-r-md sm:rounded-l-none font-medium btn-animate hover-lift transition-all duration-300 ${isSubmitting || !email ? 'opacity-75 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                Subscribing...
                                            </div>
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </form>

                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default NewsletterSection;
