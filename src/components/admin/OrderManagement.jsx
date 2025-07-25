import React, { useState, useEffect } from 'react';
import { OrderService, ORDER_STATUS } from '../../services/orderService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faFilter,
    faEye,
    faEdit,
    faCheck,
    faTruck,
    faTimes,
    faBox
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const statusOptions = [
        'All',
        ...Object.values(ORDER_STATUS)
    ];

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const filter = statusFilter === 'All' ? null : statusFilter;
            const ordersData = await OrderService.getAllOrders(filter, 100);
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus, notes = '') => {
        try {
            await OrderService.updateOrderStatus(orderId, newStatus, notes);
            toast.success('Order status updated successfully');
            loadOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        return (
            order.orderNumber?.toLowerCase().includes(searchLower) ||
            order.customerInfo?.name?.toLowerCase().includes(searchLower) ||
            order.customerInfo?.email?.toLowerCase().includes(searchLower)
        );
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            processing: 'bg-purple-100 text-purple-800 border-purple-200',
            shipped: 'bg-green-100 text-green-800 border-green-200',
            delivered: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: faBox,
            confirmed: faCheck,
            processing: faEdit,
            shipped: faTruck,
            delivered: faCheck,
            cancelled: faTimes
        };
        return icons[status] || faBox;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-yellow-700 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600">Track and manage customer orders</p>
                </div>
                <div className="text-sm text-gray-600">
                    Total Orders: <span className="font-semibold">{orders.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by order number, customer name, or email..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.orderNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.items?.length || 0} items
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.customerInfo?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.customerInfo?.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            <FontAwesomeIcon icon={getStatusIcon(order.status)} className="mr-1" />
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <StatusDropdown
                                                currentStatus={order.status}
                                                orderId={order.id}
                                                onStatusUpdate={handleStatusUpdate}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                    onOrderUpdated={loadOrders}
                />
            )}
        </div>
    );
}

// Status Dropdown Component
function StatusDropdown({ currentStatus, orderId, onStatusUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const handleStatusChange = (newStatus) => {
        if (newStatus === currentStatus) return;

        setPendingStatus(newStatus);
        setIsOpen(false);

        if (newStatus === ORDER_STATUS.CANCELLED || newStatus === ORDER_STATUS.SHIPPED) {
            setShowNotesModal(true);
        } else {
            onStatusUpdate(orderId, newStatus);
        }
    };

    const handleNotesSubmit = () => {
        onStatusUpdate(orderId, pendingStatus, notes);
        setShowNotesModal(false);
        setNotes('');
        setPendingStatus(null);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
            >
                <FontAwesomeIcon icon={faEdit} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                        {Object.values(ORDER_STATUS).map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${status === currentStatus ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'
                                    }`}
                                disabled={status === currentStatus}
                            >
                                <FontAwesomeIcon icon={getStatusIcon(status)} className="mr-2" />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                Add Notes for Status Change
                            </h3>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                rows="4"
                                placeholder="Add any notes about this status change..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    onClick={() => {
                                        setShowNotesModal(false);
                                        setPendingStatus(null);
                                        setNotes('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNotesSubmit}
                                    className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

// Order Detail Modal Component
function OrderDetailModal({ order, onClose, onStatusUpdate, onOrderUpdated }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            Order Details - #{order.orderNumber}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-gray-600">Order Number:</span>
                                    <span className="ml-2 font-medium">#{order.orderNumber}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Date:</span>
                                    <span className="ml-2">{formatDate(order.createdAt)}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="ml-2 font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-gray-600">Name:</span>
                                    <span className="ml-2">{order.customerInfo?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <span className="ml-2">{order.customerInfo?.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="ml-2">{order.customerInfo?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <img
                                                        src={item.product?.image}
                                                        alt={item.product?.name}
                                                        className="w-12 h-12 object-cover rounded mr-3"
                                                    />
                                                    <span className="font-medium">{item.product?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{item.variant}</td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3">{formatCurrency(item.product?.price)}</td>
                                            <td className="px-4 py-3 font-medium">
                                                {formatCurrency(item.product?.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Status History</h3>
                            <div className="space-y-3">
                                {order.statusHistory.map((history, index) => (
                                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                                        <FontAwesomeIcon icon={getStatusIcon(history.status)} className="text-gray-600" />
                                        <div className="flex-1">
                                            <span className="font-medium capitalize">{history.status}</span>
                                            {history.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(history.timestamp)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper function to get status icon (defined outside component to avoid redefinition)
const getStatusIcon = (status) => {
    const icons = {
        pending: faBox,
        confirmed: faCheck,
        processing: faEdit,
        shipped: faTruck,
        delivered: faCheck,
        cancelled: faTimes
    };
    return icons[status] || faBox;
};

export default OrderManagement;
