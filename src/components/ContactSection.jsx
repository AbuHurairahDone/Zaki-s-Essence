import React, { useState } from 'react';
import { toast } from "react-toastify";

function ContactSection() {
            const [formData, setFormData] = useState({
                name: '',
                email: '',
                message: ''
            });

            const handleChange = (e) => {
                setFormData({
                    ...formData,
                    [e.target.name]: e.target.value
                });
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                toast.success("Message sent successfully!", 
                    {
                        position: "bottom-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    }
                );
                setFormData({ name: '', email: '', message: '' });
            };

            return (
                <section id="contact" className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 animate-slide">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Have questions? Reach out to our fragrance experts.</p>
                        </div>
                        
                        <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-md p-8">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                        required
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-3 rounded-md transition font-medium"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            );
        }
        
        export default ContactSection