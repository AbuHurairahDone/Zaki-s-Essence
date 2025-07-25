import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = AuthService.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const userData = await AuthService.signIn(email, password);
            setUser(userData);
            return userData;
        } catch (error) {
            setError(error.message);
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
            return userData;
        } catch (error) {
            setError(error.message);
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
