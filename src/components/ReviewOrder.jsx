import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OrderService } from '../services/orderService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import logo from '../assets/logo_dark.PNG';

function ReviewOrder() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);

    useEffect(() => {
        async function fetchOrder() {
            setLoading(true);
            try {
                const result = await OrderService.getOrder(orderId);
                setOrder(result);
                setReviews(result.items.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    rating: 0,
                    review: ''
                })));
                // Check if reviews already exist for this order
                const existingReviews = await OrderService.getOrderReviews(orderId);
                if (existingReviews && existingReviews.length > 0) {
                    setAlreadyReviewed(true);
                }
            } catch (err) {
                console.error(err);
                toast.error('Order not found or unable to load.');
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId]);

    const handleRating = (index, rating) => {
        setReviews(prev => prev.map((r, i) => i === index ? { ...r, rating } : r));
    };

    const handleReviewChange = (index, value) => {
        setReviews(prev => prev.map((r, i) => i === index ? { ...r, review: value } : r));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await OrderService.submitOrderReviews(orderId, reviews);
            // Update product ratings for each review
            for (const review of reviews) {
                if (review.rating > 0) {
                    await import('../services/productService.js').then(({ ProductService }) =>
                        ProductService.updateProductRating(review.productId, review.rating)
                    );
                }
            }
            setSubmitted(true);
            toast.success('Thank you for your feedback!');
        } catch (err) {
            toast.error('Failed to submit reviews. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <img src={logo} alt="Logo" className="w-16 mb-6" />
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-yellow-700 text-3xl mb-2" />
                <p className="text-gray-500">Loading your order...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <img src={logo} alt="Logo" className="w-16 mb-6" />
                <p className="text-gray-500">Order not found.</p>
            </div>
        );
    }

    if (alreadyReviewed) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex flex-col items-center text-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Already Submitted</h2>
                    <p className="text-gray-600 mb-4">You have already submitted a review for this order. Thank you for your feedback!</p>
                    <img src={logo} alt="Logo" className="w-14 mt-2" />
                </div>
            </section>
        );
    }

    if (submitted) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex flex-col items-center text-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                    <p className="text-gray-600 mb-4">Your review has been submitted successfully.</p>
                    <img src={logo} alt="Logo" className="w-14 mt-2" />
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 flex flex-col items-center justify-center ">
            <div className="w-full max-w-screen-sm bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
                <div className="flex flex-col items-center mb-6 text-center">
                    <img src={logo} alt="Logo" className="w-14 mb-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Rate & Review Your Order</h2>
                    <p className="text-gray-600 text-sm">We value your feedback! Please review each product below.</p>
                </div>

                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <h3 className="font-semibold text-yellow-700 mb-1">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-700">Placed on {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(order.createdAt)}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {order.items.map((item, idx) => (
                        <div key={item.product.id} className="bg-gray-50 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4 transition hover:shadow-md">
                            <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded border border-gray-200"
                            />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{item.product.name}</h4>
                                <p className="text-xs text-gray-500 mb-2">Variant: {item.variant}</p>

                                <div className="flex items-center mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => handleRating(idx, star)}
                                            className={`text-xl transition-transform duration-150 hover:scale-110 focus:outline-none ${reviews[idx]?.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                        >
                                            <FontAwesomeIcon icon={faStar} />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">
                                        {reviews[idx]?.rating ? `${reviews[idx].rating} / 5` : 'Not rated'}
                                    </span>
                                </div>

                                <label htmlFor={`review-textarea-${item.product.id}`} className="sr-only">
                                    Review for {item.product.name}
                                </label>
                                <textarea
                                    id={`review-textarea-${item.product.id}`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 text-sm resize-none transition"
                                    rows={3}
                                    placeholder="Write your review..."
                                    value={reviews[idx]?.review}
                                    onChange={e => handleReviewChange(idx, e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ))}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-yellow-700 hover:bg-yellow-800 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Reviews'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default ReviewOrder;
