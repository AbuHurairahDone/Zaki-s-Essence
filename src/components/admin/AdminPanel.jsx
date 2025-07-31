import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import AdminLogin from './AdminLogin.jsx';
import AdminLayout from './AdminLayout.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ProductManagement from './ProductManagement.jsx';
import CollectionManagement from './CollectionManagement.jsx';
import OrderManagement from './OrderManagement.jsx';
import InventoryManagement from './InventoryManagement.jsx';
import HeroImageManagement from './HeroImageManagement.jsx';
import ContactMessages from './ContactMessages.jsx';

function AdminPanel() {
    const { user, loading, isAdmin } = useAuth();
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-yellow-700 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login if user is not authenticated or not an admin
    if (!user || !isAdmin()) {
        return <AdminLogin />;
    }

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <AdminDashboard onPageChange={setCurrentPage} />;
            case 'products':
                return <ProductManagement />;
            case 'collections':
                return <CollectionManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'inventory':
                return <InventoryManagement />;
            case 'hero-images':
                return <HeroImageManagement />;
            case 'contact-messages':
                return <ContactMessages />;
            default:
                return <AdminDashboard onPageChange={setCurrentPage} />;
        }
    };

    return (
        <AdminLayout
            currentPage={currentPage}
            onPageChange={setCurrentPage}
        >
            {renderCurrentPage()}
        </AdminLayout>
    );
}

export default AdminPanel;
