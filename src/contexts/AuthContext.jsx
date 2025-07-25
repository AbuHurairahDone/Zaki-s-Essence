import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/authService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { AuthContext } from './contexts.js';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);

            // Initialize analytics for the user
            if (user) {
                AnalyticsService.initializeUser(user);
            }
        });

        return unsubscribe;
    }, []);

    const signIn = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const userData = await AuthService.signIn(email, password);
            setUser(userData);

            // Track login event
            AnalyticsService.trackLogin('email');
            AnalyticsService.initializeUser(userData);

            return userData;
        } catch (error) {
            setError(error.message);
            AnalyticsService.trackError('auth_error', error.message, 'sign_in');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email, password, displayName, isAdmin = false) => {
        try {
            setError(null);
            setLoading(true);
            const userData = await AuthService.signUp(email, password, displayName, isAdmin);
            setUser(userData);

            // Track signup event
            AnalyticsService.trackSignup('email');
            AnalyticsService.initializeUser(userData);

            return userData;
        } catch (error) {
            setError(error.message);
            AnalyticsService.trackError('auth_error', error.message, 'sign_up');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await AuthService.signOut();
            setUser(null);
        } catch (error) {
            setError(error.message);
            AnalyticsService.trackError('auth_error', error.message, 'sign_out');
            throw error;
        }
    };

    const isAdmin = () => {
        return user?.isAdmin || false;
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const value = {
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        isAdmin,
        isAuthenticated,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
