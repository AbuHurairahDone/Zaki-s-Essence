import React, { useState } from 'react';
import { OrderService } from '../services/orderService.js'; // Adjust path if needed

function TrackOrder() {
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState(null);
    const [searchBy, setSearchBy] = useState('orderId');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setError('');
        setOrder(null);
        setLoading(true);

        if (!searchTerm.trim()) {
            setError('Please enter a search term');
            setLoading(false);
            return;
        }

        try {
            let result = null;

            if (searchBy === 'orderId') {
                result = await OrderService.trackOrderByOrderNumber(searchTerm.trim());
            } else if (searchBy === 'phoneNumber') {
                result = await OrderService.trackOrderByPhone(searchTerm.trim());
            }
            console.log(result);

            if (result) {
                setOrder({
                    ...result,
                    orderId: result.orderNumber || result.id,
                    phoneNumber: result.customerInfo?.phone || '',
                    date: result.createdAt?.toLocaleDateString() || '',
                    total: result.totalAmount || 0,
                    shippingAddress: `${result.shippingAddress.country}, ${result.shippingAddress.state}, ${result.shippingAddress.city}, ${result.shippingAddress.street}, ${result.shippingAddress.zipCode}`,
                    items: result.items || [],
                    status: result.status
                });
            } else {
                setError('Order not found. Please check your ID/phone number and try again.');
            }
        } catch (err) {
            console.error('Error searching order:', err);
            setError('An error occurred while searching for the order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-3xl font-bold mb-6">Track Your Order</h2>

                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <div className="mr-4">
                                <input
                                    type="radio"
                                    id="orderId"
                                    name="searchBy"
                                    checked={searchBy === 'orderId'}
                                    onChange={() => setSearchBy('orderId')}
                                />
                                <label htmlFor="orderId" className="ml-2">Order ID</label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="phoneNumber"
                                    name="searchBy"
                                    checked={searchBy === 'phoneNumber'}
                                    onChange={() => setSearchBy('phoneNumber')}
                                />
                                <label htmlFor="phoneNumber" className="ml-2">Phone Number</label>
                            </div>
                        </div>

                        <div className="flex">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Enter ${searchBy === 'orderId' ? 'order ID' : 'phone number'}`}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            />
                            <button
                                onClick={handleSearch}
                                className="ml-4 bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-md transition"
                            >
                                {loading ? 'Searching...' : 'Track'}
                            </button>
                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>

                    {order && (
                        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
                            <h3 className="text-2xl font-bold mb-4">Order Details</h3>
                            <div className="mb-4">
                                <p className="text-gray-700"><strong>Order ID:</strong> {order.orderId}</p>
                                <p className="text-gray-700"><strong>Phone Number:</strong> {order.phoneNumber}</p>
                                <p className="text-gray-700"><strong>Date:</strong> {order.date}</p>
                                <p className="text-gray-700"><strong>Status:</strong> <span className={`font-semibold ${order.status === 'Delivered' ? 'text-green-500' : 'text-yellow-500'}`}>{order.status}</span></p>
                                <p className="text-gray-700"><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                            </div>

                            <h4 className="mt-4 font-semibold text-lg">Items:</h4>
                            <ul className="divide-y divide-gray-200">
                                {order.items.map((item, index) => (
                                    <li key={index} className="flex items-center justify-between py-4">
                                        <div className="flex items-center">
                                            <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                            <div>
                                                <p className="text-gray-800 font-medium">{item.product.name} ({item.variant})</p>
                                                <p className="text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-800">${(item.product.price * item.quantity)}</p>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="mt-4 flex justify-between">
                                <span className="text-lg font-bold">Total:</span>
                                <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}

export default TrackOrder;
