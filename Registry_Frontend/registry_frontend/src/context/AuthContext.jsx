import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api.jsx'; // Adjust this import based on your API setup

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // End loading state after checking local storage
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post("login/", { email, password });
            const { access, refresh, is_admin } = res.data;

            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            const userObj = { email, role: is_admin ? "admin" : "citizen" };
            localStorage.setItem("user", JSON.stringify(userObj));
            setUser(userObj);
        } catch (err) {
            throw new Error(err.response?.data?.detail || "Login failed");
        }
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};