import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function AdminLogin() {
    const { signIn, loading, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const user = await signIn(formData.email, formData.password);

            if (!user.isAdmin) {
                toast.error('Access denied. Admin privileges required.');
                return;
            }

            toast.success('Welcome to admin panel!');
        } catch (error) {
            toast.error(error.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <img
                        className="mx-auto h-16 w-auto"
                        src="../../assets/logo.png"
                        alt="Zaki's Essence"
                    />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access the admin dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-200"
                                placeholder="admin@zakisessence.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEyeSlash : faEye}
                                        className="text-gray-400 hover:text-gray-600"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-700 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Authorized personnel only. All access is logged and monitored.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
