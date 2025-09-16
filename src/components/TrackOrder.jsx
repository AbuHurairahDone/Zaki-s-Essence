import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faBox,
    faPhone,
    faMapMarkerAlt,
    faCalendarAlt,
    faCheckCircle,
    faClock,
    faTruck,
    faTimesCircle,
    faSpinner,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { OrderService } from '../services/orderService.js';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { GetCountries } from 'react-country-state-city';
import Select from 'react-select';

// Status icon mapping
const getStatusIcon = (status) => {
    const statusMap = {
        'pending': faClock,
        'confirmed': faCheckCircle,
        'processing': faBox,
        'shipped': faTruck,
        'delivered': faCheckCircle,
        'cancelled': faTimesCircle
    };
    return statusMap[status?.toLowerCase()] || faClock;
};

// Status color mapping
const getStatusColor = (status) => {
    const colorMap = {
        'pending': 'text-brown-600 bg-amber-100 border-brown-200',
        'confirmed': 'text-blue-600 bg-blue-50 border-blue-200',
        'processing': 'text-purple-600 bg-purple-50 border-purple-200',
        'shipped': 'text-indigo-600 bg-indigo-50 border-indigo-200',
        'delivered': 'text-green-600 bg-green-50 border-green-200',
        'cancelled': 'text-red-600 bg-red-50 border-red-200'
    };
    return colorMap[status?.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
};

// Search Form Component
const SearchForm = ({ searchTerm, setSearchTerm, searchBy, setSearchBy, onSearch, loading, error, phoneCountry, setPhoneCountry }) => {
    const [countryList, setCountryList] = React.useState([]);

    React.useEffect(() => {
        GetCountries().then((result) => {
            const countries = result.map(country => ({
                value: country.iso2.toLowerCase(),
                label: country.name,
                ...country
            }));
            setCountryList(countries);
        });
    }, []);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <FontAwesomeIcon icon={faSearch} className="text-2xl text-amber-950" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Track Your Order</h2>
                <p className="text-gray-600">Enter your order details to track your package</p>
            </div>

            {/* Search Type Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Search by:</label>
                <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${searchBy === 'orderId'
                        ? 'border-amber-600 bg-amber-100 text-amber-950'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input
                            type="radio"
                            name="searchBy"
                            value="orderId"
                            checked={searchBy === 'orderId'}
                            onChange={(e) => setSearchBy(e.target.value)}
                            className="sr-only"
                        />
                        <FontAwesomeIcon icon={faBox} className="mr-2" />
                        <span className="font-medium">Order ID</span>
                    </label>
                    <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${searchBy === 'phoneNumber'
                        ? 'border-amber-600 bg-amber-100 text-amber-950'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input
                            type="radio"
                            name="searchBy"
                            value="phoneNumber"
                            checked={searchBy === 'phoneNumber'}
                            onChange={(e) => setSearchBy(e.target.value)}
                            className="sr-only"
                        />
                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                        <span className="font-medium">Phone Number</span>
                    </label>
                </div>
            </div>

            {/* Search Input */}
            <div className="mb-4">
                {searchBy === 'phoneNumber' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <Select
                                value={phoneCountry}
                                onChange={setPhoneCountry}
                                options={countryList}
                                isSearchable
                                placeholder="Select country..."
                                className="w-full"
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        borderColor: state.isFocused ? '#b45309' : '#d1d5db',
                                        boxShadow: state.isFocused ? '0 0 0 2px rgba(180, 83, 9, 0.2)' : 'none',
                                        '&:hover': { borderColor: '#b45309' }
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isSelected ? '#b45309' : state.isFocused ? '#fef3c7' : 'white',
                                        color: state.isSelected ? 'white' : '#374151'
                                    })
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <PhoneInput
                                country={phoneCountry?.value || 'us'}
                                value={searchTerm}
                                onChange={setSearchTerm}
                                inputProps={{
                                    name: 'phone',
                                    required: true,
                                    className: "w-full pl-12 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-950"
                                }}
                                containerClass="w-full"
                                buttonClass="!border-gray-300 hover:!border-amber-950"
                                dropdownClass="!z-50"
                                disabled={loading}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon
                                icon={searchBy === 'orderId' ? faBox : faPhone}
                                className="text-gray-400"
                            />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Enter ${searchBy === 'orderId' ? 'order ID (e.g., ZE12345678)' : 'phone number'}`}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-sm md:text-base"
                            disabled={loading}
                        />
                    </div>
                )}
            </div>

            {/* Search Button */}
            <button
                onClick={onSearch}
                disabled={loading || !searchTerm.trim()}
                className="w-full bg-primary hover:bg-secondary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        Searching...
                    </span>
                ) : (
                    <span className="flex items-center justify-center">
                        <FontAwesomeIcon icon={faSearch} className="mr-2" />
                        Track Order
                    </span>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Order Status Badge Component
const OrderStatusBadge = ({ status }) => {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
            <FontAwesomeIcon icon={getStatusIcon(status)} className="mr-2" />
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
};

// Order Details Component
const OrderDetails = ({ order }) => {
    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR'
            }).format(amount || 0);
        } catch (error) {
            console.error('Currency formatting error:', error);
            return `PKR ${(amount || 0).toFixed(2)}`;
        }
    };

    const formatDate = (date) => {
        try {
            if (!date) return 'N/A';

            // Handle different date formats
            let dateObj;

            // Check if it's already a Date object
            if (date instanceof Date) {
                dateObj = date;
            }
            // Handle the specific format: "July 25, 2025 at 9:16:38 PM UTC+5"
            else if (typeof date === 'string' && date.includes(' at ') && date.includes('UTC')) {
                // Parse the custom format
                const [datePart, timePart] = date.split(' at ');
                const [timeWithoutTz, timezone] = timePart.split(' UTC');

                // Construct a parseable date string
                const parseableDate = `${datePart} ${timeWithoutTz}`;
                dateObj = new Date(parseableDate);

                // If the parsing failed, try alternative parsing
                if (isNaN(dateObj.getTime())) {
                    // Remove timezone and try parsing
                    const cleanDate = date.replace(/ UTC[+-]\d+/, '').replace(' at ', ' ');
                    dateObj = new Date(cleanDate);
                }
            }
            // Handle ISO strings, timestamps, or other standard formats
            else if (typeof date === 'string' || typeof date === 'number') {
                dateObj = new Date(date);
            }
            else {
                return 'Invalid date';
            }

            // Check if date is valid after parsing
            if (isNaN(dateObj.getTime())) {
                // If standard parsing fails, try to extract readable parts
                if (typeof date === 'string') {
                    // For display purposes, if we can't parse it, show the original string
                    // but clean it up a bit
                    return date.replace(' UTC+5', '').replace(' at ', ' at ');
                }
                return 'Invalid date';
            }

            return new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(dateObj);
        } catch (error) {
            console.error('Date formatting error:', error);
            // Fallback: if it's a string that looks like a date, return it cleaned up
            if (typeof date === 'string' && date.length > 0) {
                return date.replace(' UTC+5', '').replace(' at ', ' at ');
            }
            return 'Date unavailable';
        }
    };

    const formatAddress = (address) => {
        try {
            if (!address || typeof address === 'string') {
                return address || 'No address provided';
            }

            const parts = [
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country
            ].filter(Boolean);

            return parts.length > 0 ? parts.join(', ') : 'No address provided';
        } catch (error) {
            console.error('Address formatting error:', error);
            return 'Address unavailable';
        }
    };

    // Add error boundary for the entire component
    if (!order) {
        return (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
                <div className="text-center text-gray-500">
                    <p>Order details unavailable</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                            Order #{order.orderId || 'N/A'}
                        </h3>
                        <p className="text-gray-600">Order placed on {formatDate(order.date)}</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <OrderStatusBadge status={order.status || 'pending'} />
                    </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <FontAwesomeIcon icon={faPhone} className="text-gray-400 mt-1 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Contact Number</p>
                                <p className="text-gray-900">{order.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mt-1 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Order Date</p>
                                <p className="text-gray-900">{formatDate(order.date)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                                <p className="text-gray-900 leading-relaxed">{formatAddress(order.shippingAddress)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h4>
                <div className="space-y-4">
                    {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center mb-4 sm:mb-0 sm:flex-1">
                                <img
                                    src={item.product?.image || '/placeholder-image.jpg'}
                                    alt={item.product?.name || 'Product'}
                                    className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <h5 className="font-medium text-gray-900 truncate">
                                        {item.product?.name || 'Unknown Product'}
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                        Variant: {item.variant || 'Standard'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Quantity: {item.quantity || 1}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right sm:ml-4">
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency((item.product?.price || 0) * (item.quantity || 1))}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {formatCurrency(item.product?.price || 0)} each
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-8">
                            <p>No items found for this order</p>
                        </div>
                    )}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-amber-950">
                            {formatCurrency(order.total || 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status History (if available) */}
            {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h4>
                    <div className="space-y-4">
                        {order.statusHistory.map((history, index) => (
                            <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center mr-4">
                                    <FontAwesomeIcon
                                        icon={getStatusIcon(history.status)}
                                        className="text-amber-950 text-sm"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 capitalize">
                                        {history.status || 'Unknown'}
                                    </p>
                                    {history.notes && (
                                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(history.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main TrackOrder Component
function TrackOrder() {
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState(null);
    const [searchBy, setSearchBy] = useState('orderId');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneCountry, setPhoneCountry] = useState(null);

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

            if (result) {
                setOrder({
                    ...result,
                    orderId: result.orderNumber || result.id,
                    phoneNumber: result.customerInfo?.phone || '',
                    date: result.createdAt || new Date().toISOString(),
                    total: result.totalAmount || 0,
                    shippingAddress: result.shippingAddress || {},
                    items: result.items || [],
                    status: result.status || 'pending',
                    statusHistory: result.statusHistory || []
                });
            } else {
                setError('Order not found. Please check your details and try again.');
            }
        } catch (err) {
            console.error('Error searching order:', err);
            if (err.message === 'Order not found' || err.message.includes('No order found')) {
                setError('Order not found. Please check your details and try again.');
            } else {
                setError('An error occurred while searching for the order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <SearchForm
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchBy={searchBy}
                    setSearchBy={setSearchBy}
                    onSearch={handleSearch}
                    loading={loading}
                    error={error}
                    phoneCountry={phoneCountry}
                    setPhoneCountry={setPhoneCountry}
                />

                {order && <OrderDetails order={order} />}

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Need help? Contact our support team for assistance with your order.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default TrackOrder;
