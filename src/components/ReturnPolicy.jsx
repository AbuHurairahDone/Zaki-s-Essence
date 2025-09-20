import React, { useEffect } from 'react';
import { useSEO } from '../hooks/useSEO.js';
import GTMService from '../services/gtmService.js';

function ReturnPolicy() {
    useSEO('return-policy');

    useEffect(() => {
        GTMService.trackPageView('return-policy');
    }, []);

    return (
        <div className="pt-10">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg p-6 shadow-md">
                    <h1 className="text-3xl font-bold mb-4">Return & Refund Policy</h1>
                    <p className="text-gray-700 mb-6">
                        We want you to be completely satisfied with your purchase. If something isn’t right,
                        our simple return policy makes it easy to request an exchange or refund where eligible.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
                            <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                <li>Returns accepted within 10 days of delivery.</li>
                                <li>Items must be unopened, unused, and in original packaging with seals intact.</li>
                                <li>Proof of purchase (order ID or receipt) is required.</li>
                            </ul>
                        </section>

                        <section className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-2">Non-Returnable Items</h2>
                            <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                <li>Opened or used perfumes.</li>
                                <li>Items without original packaging or missing accessories.</li>
                                <li>Clearance or final sale items (if applicable).</li>
                            </ul>
                        </section>

                        <section className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-2">How to Start a Return</h2>
                            <ol className="list-decimal pl-5 text-gray-700 space-y-1">
                                <li>Contact our support team within 7 days of receiving your order.</li>
                                <li>Provide your order ID, product name, and reason for return.</li>
                                <li>Our team will guide you through the pickup/return instructions.</li>
                            </ol>
                            <p className="text-sm text-gray-600 mt-2">
                                For assistance, visit our Contact page or reach us on WhatsApp.
                            </p>
                        </section>

                        <section className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-2">Refunds</h2>
                            <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                <li>Refunds are processed within 7–10 business days after inspection.</li>
                                <li>Refund will be issued to the original payment method.</li>
                                <li>Shipping fees are non-refundable unless the item is defective or incorrect.</li>
                            </ul>
                        </section>

                        <section className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-2">Damaged or Incorrect Items</h2>
                            <p className="text-gray-700">
                                If you received a damaged or incorrect product, contact us within 48 hours of delivery with
                                photos/videos. We will prioritize a replacement or a full refund after verification.
                            </p>
                        </section>

                        <section className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-2">Exchanges</h2>
                            <p className="text-gray-700">
                                Exchanges are possible for unopened items of equal value, subject to availability.
                                Please note that some products may not be eligible for exchanges.
                            </p>
                        </section>
                    </div>

                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-1">Need Help?</h3>
                        <p className="text-gray-700">
                            Our team is here to help. Reach out via our <a className="text-yellow-700 hover:underline" href="/contact">Contact</a> page or WhatsApp for quick support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReturnPolicy;
