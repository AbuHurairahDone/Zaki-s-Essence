import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt,
    faBox,
    faShoppingCart,
    faSignOutAlt,
    faBars,
    faTimes,
    faLayerGroup,
    faImage,
    faWarehouse,
    faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import logo from '../../assets/logo.PNG';

function AdminLayout({ children, currentPage, onPageChange }) {
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
        } catch (error) {
            console.error('Error signing out:', error);
            setSidebarOpen(false);
            toast.error('Error signing out');
        }
    };

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: faTachometerAlt
        },
        {
            id: 'products',
            label: 'Products',
            icon: faBox
        },
        {
            id: 'collections',
            label: 'Collections',
            icon: faLayerGroup
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: faShoppingCart
        },
        {
            id: 'inventory',
            label: 'Inventory',
            icon: faWarehouse
        },
        {
            id: 'hero-images',
            label: 'Hero Images',
            icon: faImage
        },
        {
            id: 'contact-messages',
            label: 'Contact Messages',
            icon: faEnvelope
        }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
                    <div className="flex items-center">
                        <img src={logo} alt="Logo" className="h-8 w-8" />
                        <span className="ml-2 text-white font-semibold">Admin Panel</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <nav className="mt-8">
                    <div className="px-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onPageChange(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${currentPage === item.id
                                    ? 'bg-yellow-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <FontAwesomeIcon icon={item.icon} className="mr-3" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="absolute bottom-0 w-full p-4">
                    <div className="flex items-center mb-4 px-4">
                        <div className="w-8 h-8 bg-yellow-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user?.displayName?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="ml-3">
                            <p className="text-white text-sm font-medium">{user?.displayName || 'Admin'}</p>
                            <p className="text-gray-400 text-xs">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <FontAwesomeIcon icon={faBars} className="text-xl" />
                        </button>

                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900 capitalize">
                                {currentPage}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}

export default AdminLayout;
