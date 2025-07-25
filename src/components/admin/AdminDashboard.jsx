import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { OrderService } from '../../services/orderService.js';
import { ProductService } from '../../services/productService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBox,
    faShoppingCart,
    faDollarSign,
    faUsers,
    faChartLine,
    faPlus
} from '@fortawesome/free-solid-svg-icons';

function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        orders: 0,
        products: 0,
        revenue: 0,
        customers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load order statistics
            const orderStats = await OrderService.getOrderStatistics();

            // Load recent orders
            const orders = await OrderService.getRecentOrders(5);

            // Load products count
            const products = await ProductService.getAllProducts();

            setStats({
                orders: orderStats.total,
                products: products.length,
                revenue: orderStats.totalRevenue,
                customers: new Set(orders.map(order => order.customerInfo?.email)).size
            });

            setRecentOrders(orders);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

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
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-green-100 text-green-800',
            delivered: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.displayName || 'Admin'}!
                </h1>
                <p className="text-gray-600">
                    Here's what's happening with your store today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 hover-lift">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover-lift">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover-lift">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <FontAwesomeIcon icon={faBox} className="text-purple-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Products</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover-lift">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100">
                            <FontAwesomeIcon icon={faUsers} className="text-yellow-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        <FontAwesomeIcon icon={faChartLine} className="text-gray-400" />
                    </div>
                </div>
                <div className="p-6">
                    {recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No recent orders</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                                                <p className="text-sm text-gray-600">{order.customerInfo?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button className="bg-yellow-700 hover:bg-yellow-800 text-white p-6 rounded-lg shadow-md transition-colors">
                    <FontAwesomeIcon icon={faPlus} className="text-2xl mb-3" />
                    <h3 className="font-semibold mb-2">Add New Product</h3>
                    <p className="text-sm opacity-90">Create a new fragrance product</p>
                </button>

                <button className="bg-gray-700 hover:bg-gray-800 text-white p-6 rounded-lg shadow-md transition-colors">
                    <FontAwesomeIcon icon={faPlus} className="text-2xl mb-3" />
                    <h3 className="font-semibold mb-2">Add Collection</h3>
                    <p className="text-sm opacity-90">Create a new product collection</p>
                </button>

                <button className="bg-blue-700 hover:bg-blue-800 text-white p-6 rounded-lg shadow-md transition-colors">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-2xl mb-3" />
                    <h3 className="font-semibold mb-2">Manage Orders</h3>
                    <p className="text-sm opacity-90">View and update order status</p>
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;
