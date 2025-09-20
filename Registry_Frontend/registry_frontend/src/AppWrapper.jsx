import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Modal } from "react-bootstrap";
import AppNavbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import CitizenDashboard from "./components/CitizenDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ApplicationForm from "./components/ApplicationForm";
import ApplicationStatus from "./components/ApplicationStatus";
import CollectionManagement from "./components/CollectionManagement";
import { useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

function ProtectedRoute({ children, allowedRole }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.role !== allowedRole) return <Navigate to="/login" />;
    return children;
}

function AppWrapper() {
    const { user, loading } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            if (location.pathname === "/register") {
                setShowRegister(true);
            } else {
                setShowLogin(true);
            }
        } else {
            setShowLogin(false);
            setShowRegister(false);
        }
    }, [location.pathname, user]);

    return (
        <NotificationProvider>
            <AppNavbar />
            
            <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
                <Modal.Body>
                    <Login onClose={() => setShowLogin(false)} />
                </Modal.Body>
            </Modal>

            <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
                <Modal.Body>
                    <Register 
                        onClose={() => setShowRegister(false)} 
                        onShowLogin={() => {
                            setShowRegister(false);
                            setShowLogin(true);
                        }}
                    />
                </Modal.Body>
            </Modal>

            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 w-100">
                {!loading && (
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Navigate to={user?.role === "admin" ? "/admin/dashboard" : "/citizen/dashboard"} />} />
                        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/citizen/dashboard" element={<ProtectedRoute allowedRole="citizen"><CitizenDashboard /></ProtectedRoute>} />
                        <Route path="/apply" element={<ProtectedRoute allowedRole="citizen"><ApplicationForm /></ProtectedRoute>} />
                        <Route path="/status" element={<ProtectedRoute allowedRole="citizen"><ApplicationStatus /></ProtectedRoute>} />
                        <Route path="/status/:trackingId" element={<ProtectedRoute allowedRole="citizen"><ApplicationStatus /></ProtectedRoute>} />
                        <Route path="/admin/collection" element={<ProtectedRoute allowedRole="admin"><CollectionManagement /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                )}
            </div>
        </NotificationProvider>
    );
}

export default AppWrapper;