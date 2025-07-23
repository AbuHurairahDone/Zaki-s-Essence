 import React, { useState } from 'react';
 function NewsletterSection() {
            const [email, setEmail] = useState("");
            
            const handleSubmit = (e) => {
                e.preventDefault();
                alert(`Thank you for subscribing with ${email}! You'll receive our latest updates and exclusive offers.`);
                setEmail("");
            };
            
            return (
                <section className="py-16 bg-gray-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
                            <div className="flex flex-col md:flex-row items-center">
                                <div className="md:w-1/2 mb-6 md:mb-0">
                                    <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
                                    <p className="text-gray-600">Join our newsletter for exclusive offers, new arrivals, and fragrance tips.</p>
                                </div>
                                <div className="md:w-1/2">
                                    <form onSubmit={handleSubmit} className="flex">
                                        <input 
                                            type="email" 
                                            placeholder="Your email address" 
                                            className="px-4 py-3 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent w-full"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <button 
                                            type="submit" 
                                            className="bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-3 rounded-r-md transition"
                                        >
                                            Subscribe
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            );
        }
        
        export default NewsletterSection;