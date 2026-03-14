import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContextType';
export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            if (saved && saved !== 'undefined') return JSON.parse(saved);
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
        return null;
    });
    const loading = false;

    // Persist user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user]);

    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const register = async (name, email, password) => {
        const { data } = await API.post('/auth/register', { name, email, password });
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const googleLogin = async (credential) => {
        try {
            const { data } = await API.post('/auth/google', { credential });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            setUser(data);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await API.get('/auth/logout');
        } catch (error) {
            console.error('Logout API failed:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
