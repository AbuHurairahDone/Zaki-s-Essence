import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/productService.js';
import { OrderService } from '../../services/orderService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faWarehouse,
    faChartBar,
    faBoxes,
    faDollarSign,
    faEye,
    faExclamationTriangle,
    faSearch,
    faChartLine,
    faCalendarAlt,
    faLayerGroup,
    faStar,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { format, subDays } from 'date-fns';
import { toast } from 'react-toastify';

// Color schemes for charts
const COLORS = ['#b45309', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
const WARNING_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

function InventoryManagement() {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('All');
    const [inventoryStats, setInventoryStats] = useState({});
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductDetails, setShowProductDetails] = useState(false);
    const [stockAlertThreshold, setStockAlertThreshold] = useState(10);

    useEffect(() => {
        loadInventoryData();
    }, []);

    const loadInventoryData = async () => {
        try {
            setLoading(true);

            // Load all necessary data
            const [productsData, collectionsData, ordersData] = await Promise.all([
                ProductService.getAllProducts(),
                ProductService.getAllCollections(),
                OrderService.getAllOrders(null, 1000)
            ]);

            setProducts(productsData);
            setCollections(collectionsData);
            setOrders(ordersData);

            // Calculate inventory statistics
            calculateInventoryStats(productsData, ordersData);

            // Find low stock products
            findLowStockProducts(productsData);

        } catch (error) {
            console.error('Error loading inventory data:', error);
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const calculateInventoryStats = (productsData, ordersData) => {
        const stats = {
            totalProducts: productsData.length,
            totalVariants: 0,
            totalStock: 0,
            totalSold: 0,
            totalValue: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            topSellingProducts: [],
            stockByCollection: {},
            salesTrend: [],
            revenueByProduct: []
        };

        // Calculate product-level statistics
        productsData.forEach(product => {
            if (product.variants && product.stock && product.variantPricing) {
                product.variants.forEach(variant => {
                    stats.totalVariants++;
                    const stock = product.stock[variant] || 0;
                    const sold = product.sold?.[variant] || 0;
                    const price = product.variantPricing[variant] || 0;

                    stats.totalStock += stock;
                    stats.totalSold += sold;
                    stats.totalValue += stock * price;

                    if (stock === 0) stats.outOfStockCount++;
                    else if (stock <= stockAlertThreshold) stats.lowStockCount++;
                });
            }
        });

        // Calculate stock by collection
        productsData.forEach(product => {
            const collectionName = getCollectionName(product.collectionRef);
            if (!stats.stockByCollection[collectionName]) {
                stats.stockByCollection[collectionName] = { stock: 0, value: 0 };
            }

            if (product.variants && product.stock && product.variantPricing) {
                product.variants.forEach(variant => {
                    const stock = product.stock[variant] || 0;
                    const price = product.variantPricing[variant] || 0;
                    stats.stockByCollection[collectionName].stock += stock;
                    stats.stockByCollection[collectionName].value += stock * price;
                });
            }
        });

        // Calculate top selling products
        const productSales = productsData.map(product => {
            const totalSold = product.variants?.reduce((sum, variant) =>
                sum + (product.sold?.[variant] || 0), 0) || 0;
            const totalRevenue = product.variants?.reduce((sum, variant) =>
                sum + (product.sold?.[variant] || 0) * (product.variantPricing?.[variant] || 0), 0) || 0;

            return {
                ...product,
                totalSold,
                totalRevenue
            };
        }).sort((a, b) => b.totalSold - a.totalSold).slice(0, 10);

        stats.topSellingProducts = productSales;

        // Calculate revenue by product for chart
        stats.revenueByProduct = productSales.slice(0, 5).map(product => ({
            name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
            revenue: product.totalRevenue,
            sold: product.totalSold
        }));

        // Calculate sales trend (last 30 days)
        const salesTrend = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dayOrders = ordersData.filter(order => {
                const orderDate = order.createdAt;
                return orderDate && format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            });

            const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const dayItems = dayOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

            salesTrend.push({
                date: format(date, 'MMM dd'),
                revenue: dayRevenue,
                items: dayItems,
                orders: dayOrders.length
            });
        }

        stats.salesTrend = salesTrend;
        setInventoryStats(stats);
    };

    const findLowStockProducts = (productsData) => {
        const lowStock = [];

        productsData.forEach(product => {
            if (product.variants && product.stock) {
                product.variants.forEach(variant => {
                    const stock = product.stock[variant] || 0;
                    if (stock <= stockAlertThreshold && stock > 0) {
                        lowStock.push({
                            ...product,
                            variant,
                            stock,
                            alertLevel: stock <= 5 ? 'critical' : 'warning'
                        });
                    }
                });
            }
        });

        setLowStockProducts(lowStock.sort((a, b) => a.stock - b.stock));
    };

    const getCollectionName = (collectionId) => {
        const collection = collections.find(c => c.id === collectionId);
        return collection?.name || 'Unknown Collection';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
        }).format(amount);
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
        if (stock <= 5) return { status: 'Critical', color: 'text-red-600 bg-red-100' };
        if (stock <= stockAlertThreshold) return { status: 'Low Stock', color: 'text-brown-600 bg-brown-100' };
        return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCollection = selectedCollection === 'All' || product.collectionRef === selectedCollection;
        return matchesSearch && matchesCollection;
    });

    // Prepare data for charts
    const stockByCollectionData = Object.entries(inventoryStats.stockByCollection || {}).map(([name, data]) => ({
        name,
        stock: data.stock,
        value: data.value
    }));

    const stockStatusData = [
        { name: 'In Stock', value: inventoryStats.totalVariants - inventoryStats.lowStockCount - inventoryStats.outOfStockCount, color: '#10b981' },
        { name: 'Low Stock', value: inventoryStats.lowStockCount, color: '#f59e0b' },
        { name: 'Out of Stock', value: inventoryStats.outOfStockCount, color: '#ef4444' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-amber-950 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-600">Monitor stock levels, sales analytics, and inventory insights</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Alert Threshold:</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={stockAlertThreshold}
                            onChange={(e) => setStockAlertThreshold(parseInt(e.target.value) || 10)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-950"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <FontAwesomeIcon icon={faBoxes} className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</p>
                            <p className="text-xs text-gray-500">{inventoryStats.totalVariants} variants</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <FontAwesomeIcon icon={faWarehouse} className="text-green-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Stock</p>
                            <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalStock}</p>
                            <p className="text-xs text-gray-500">units available</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <FontAwesomeIcon icon={faDollarSign} className="text-purple-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryStats.totalValue)}</p>
                            <p className="text-xs text-gray-500">current value</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-amber-200">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-800 text-xl" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                            <p className="text-2xl font-bold text-gray-900">{inventoryStats.lowStockCount + inventoryStats.outOfStockCount}</p>
                            <p className="text-xs text-gray-500">need attention</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Status Pie Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FontAwesomeIcon icon={faChartBar} className="mr-2 text-blue-600" />
                        Stock Status Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stockStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {stockStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Product */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FontAwesomeIcon icon={faChartLine} className="mr-2 text-green-600" />
                        Top Revenue Products
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventoryStats.revenueByProduct}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                                <Bar dataKey="revenue" fill="#b45309" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock by Collection */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-purple-600" />
                        Stock by Collection
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stockByCollectionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="stock" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales Trend */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-blue-600" />
                        Sales Trend (30 Days)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={inventoryStats.salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.3}
                                    name="Revenue"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold flex items-center text-red-600">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                            Low Stock Alerts ({lowStockProducts.length})
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lowStockProducts.slice(0, 6).map((item, index) => (
                                <div
                                    key={`${item.id}-${item.variant}`}
                                    className={`p-4 rounded-lg border-l-4 ${item.alertLevel === 'critical' ? 'border-red-500 bg-red-50' : 'border-amber-600 bg-amber-100'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-600">{item.variant}</p>
                                            <p className={`text-sm font-medium ${item.alertLevel === 'critical' ? 'text-red-600' : 'text-amber-800'
                                                }`}>
                                                {item.stock} units left
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.alertLevel === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-200 text-amber-800'
                                                }`}>
                                                {item.alertLevel === 'critical' ? 'Critical' : 'Low'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {lowStockProducts.length > 6 && (
                            <div className="mt-4 text-center">
                                <span className="text-sm text-gray-500">
                                    And {lowStockProducts.length - 6} more products need attention
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Product Inventory Table */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-lg font-semibold">Product Inventory Details</h3>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-950"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-950"
                                value={selectedCollection}
                                onChange={(e) => setSelectedCollection(e.target.value)}
                            >
                                <option value="All">All Collections</option>
                                {collections.map(collection => (
                                    <option key={collection.id} value={collection.id}>{collection.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variants</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sold</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => {
                                const totalStock = product.variants?.reduce((sum, variant) =>
                                    sum + (product.stock?.[variant] || 0), 0) || 0;
                                const totalSold = product.variants?.reduce((sum, variant) =>
                                    sum + (product.sold?.[variant] || 0), 0) || 0;
                                const totalRevenue = product.variants?.reduce((sum, variant) =>
                                    sum + (product.sold?.[variant] || 0) * (product.variantPricing?.[variant] || 0), 0) || 0;
                                const minStock = product.variants?.reduce((min, variant) =>
                                    Math.min(min, product.stock?.[variant] || 0), Infinity) || 0;
                                const stockStatus = getStockStatus(minStock);

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded mr-3"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        <FontAwesomeIcon icon={faStar} className="text-amber-400 mr-1" />
                                                        {product.rating || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getCollectionName(product.collectionRef)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.variants?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {totalStock}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {totalSold}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(totalRevenue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                                {stockStatus.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setShowProductDetails(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Details Modal */}
            {showProductDetails && selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    collections={collections}
                    onClose={() => {
                        setShowProductDetails(false);
                        setSelectedProduct(null);
                    }}
                    formatCurrency={formatCurrency}
                    getCollectionName={getCollectionName}
                    getStockStatus={getStockStatus}
                />
            )}
        </div>
    );
}

// Product Details Modal Component
function ProductDetailsModal({ product, collections, onClose, formatCurrency, getCollectionName, getStockStatus }) {
    // Prepare variant data for chart
    const variantData = product.variants?.map(variant => ({
        variant,
        stock: product.stock?.[variant] || 0,
        sold: product.sold?.[variant] || 0,
        price: product.variantPricing?.[variant] || 0,
        revenue: (product.sold?.[variant] || 0) * (product.variantPricing?.[variant] || 0)
    })) || [];

    const totalStock = variantData.reduce((sum, v) => sum + v.stock, 0);
    const totalSold = variantData.reduce((sum, v) => sum + v.sold, 0);
    const totalRevenue = variantData.reduce((sum, v) => sum + v.revenue, 0);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Product Inventory Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Product Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-4">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div>
                                <h3 className="text-xl font-semibold">{product.name}</h3>
                                <p className="text-gray-600">{getCollectionName(product.collectionRef)}</p>
                                <p className="text-sm text-gray-500">{product.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Stock</p>
                                <p className="text-2xl font-bold text-blue-600">{totalStock}</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Sold</p>
                                <p className="text-2xl font-bold text-green-600">{totalSold}</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600">Revenue</p>
                                <p className="text-lg font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Variant Analytics Chart */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Variant Performance</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={variantData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="variant" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="stock" fill="#3b82f6" name="Stock" />
                                    <Bar dataKey="sold" fill="#10b981" name="Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Variant Details Table */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Variant Details</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Variant</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Stock</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sold</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Revenue</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {variantData.map((variant) => {
                                        const stockStatus = getStockStatus(variant.stock);
                                        return (
                                            <tr key={variant.variant}>
                                                <td className="px-4 py-2 font-medium">{variant.variant}</td>
                                                <td className="px-4 py-2">{formatCurrency(variant.price)}</td>
                                                <td className="px-4 py-2">{variant.stock}</td>
                                                <td className="px-4 py-2">{variant.sold}</td>
                                                <td className="px-4 py-2">{formatCurrency(variant.revenue)}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                                        {stockStatus.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryManagement;
