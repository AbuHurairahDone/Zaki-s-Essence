import React, { Suspense, lazy } from 'react';

// Lazy load heavy components to reduce initial bundle size
const LazyAdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const LazyAdminPanel = lazy(() => import('./admin/AdminPanel'));
const LazyCollectionManagement = lazy(() => import('./admin/CollectionManagement'));
const LazyInventoryManagement = lazy(() => import('./admin/InventoryManagement'));
const LazyOrderManagement = lazy(() => import('./admin/OrderManagement'));
const LazyProductManagement = lazy(() => import('./admin/ProductManagement'));
const LazyContactMessages = lazy(() => import('./admin/ContactMessages'));
const LazyHeroImageManagement = lazy(() => import('./admin/HeroImageManagement'));
const LazyReviewOrder = lazy(() => import('./ReviewOrder'));
const LazyTrackOrder = lazy(() => import('./TrackOrder'));

// Loading spinner component
const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        <p className="text-gray-600 text-sm">{message}</p>
    </div>
);

// Error boundary for lazy components
class LazyLoadErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Lazy load error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
                    <div className="text-red-500 text-sm">Failed to load component</div>
                    <button
                        className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper component for lazy loaded components
const LazyWrapper = ({ children, fallback }) => (
    <LazyLoadErrorBoundary>
        <Suspense fallback={fallback || <LoadingSpinner />}>
            {children}
        </Suspense>
    </LazyLoadErrorBoundary>
);

// Export lazy components with wrappers
export const AdminDashboard = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Dashboard..." />}>
        <LazyAdminDashboard {...props} />
    </LazyWrapper>
);

export const AdminPanel = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Admin Panel..." />}>
        <LazyAdminPanel {...props} />
    </LazyWrapper>
);

export const CollectionManagement = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Collections..." />}>
        <LazyCollectionManagement {...props} />
    </LazyWrapper>
);

export const InventoryManagement = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Inventory..." />}>
        <LazyInventoryManagement {...props} />
    </LazyWrapper>
);

export const OrderManagement = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Orders..." />}>
        <LazyOrderManagement {...props} />
    </LazyWrapper>
);

export const ProductManagement = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Products..." />}>
        <LazyProductManagement {...props} />
    </LazyWrapper>
);

export const ContactMessages = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Messages..." />}>
        <LazyContactMessages {...props} />
    </LazyWrapper>
);

export const HeroImageManagement = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Hero Settings..." />}>
        <LazyHeroImageManagement {...props} />
    </LazyWrapper>
);

export const ReviewOrder = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Order Review..." />}>
        <LazyReviewOrder {...props} />
    </LazyWrapper>
);

export const TrackOrder = (props) => (
    <LazyWrapper fallback={<LoadingSpinner message="Loading Order Tracking..." />}>
        <LazyTrackOrder {...props} />
    </LazyWrapper>
);

export default LazyWrapper;
