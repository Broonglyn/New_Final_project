import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function AppNavbar() {
    const { user, logout } = useAuth();
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark_mode") === "true");

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("dark_mode", darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode((prev) => !prev);

    return (
        <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} expand="lg" className="shadow-sm px-3 py-2 rounded-bottom-3" style={{ minHeight: 70 }}>
            <Navbar.Brand href="/" className="fw-bold fs-3 text-primary d-flex align-items-center gap-2">
                <span style={{ fontSize: '2rem', color: darkMode ? '#60a5fa' : '#1976d2' }}>🗂️</span> Civil Registry
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
                <Nav className="ms-auto align-items-lg-center flex-lg-row flex-column gap-2">
                    <Button 
                        variant={darkMode ? "outline-light" : "outline-dark"} 
                        className="me-lg-2 mb-2 mb-lg-0 rounded-pill d-flex align-items-center gap-2" 
                        onClick={toggleDarkMode} 
                        title="Toggle dark mode" 
                        style={{ 
                            fontSize: '1.1rem', 
                            borderColor: darkMode ? '#60a5fa' : '#1976d2', 
                            color: darkMode ? '#60a5fa' : '#1976d2',
                            backgroundColor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(25, 118, 210, 0.1)'
                        }}
                    >
                        {darkMode ? <FaSun /> : <FaMoon />} <span className="d-none d-lg-inline">{darkMode ? "Light" : "Dark"}</span>
                    </Button>
                    {user ? (
                        <>
                            <div className="d-flex align-items-center me-2">
                                <NotificationBell />
                            </div>
                            <Nav.Link href="/dashboard" className="d-flex align-items-center gap-2 fw-bold rounded-pill px-3 py-2" style={{ 
                                fontSize: '1.1rem', 
                                color: darkMode ? '#60a5fa' : '#1976d2', 
                                background: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#f5faff', 
                                border: `1px solid ${darkMode ? '#60a5fa' : '#1976d2'}` 
                            }} onClick={() => {
                                localStorage.setItem("admin_menu_selected", "");
                            }}>
                                <span style={{ fontSize: '1.3rem' }}>🏠</span> Dashboard
                            </Nav.Link>
                            {user.role === 'admin' && (
                                <Nav.Link href="/admin/collection" className="d-flex align-items-center gap-2 fw-bold rounded-pill px-3 py-2" style={{ 
                                    fontSize: '1.1rem', 
                                    color: darkMode ? '#34d399' : '#28a745', 
                                    background: darkMode ? 'rgba(52, 211, 153, 0.1)' : '#f8fff8', 
                                    border: `1px solid ${darkMode ? '#34d399' : '#28a745'}` 
                                }}>
                                    <span style={{ fontSize: '1.3rem' }}>📦</span> Collection
                                </Nav.Link>
                            )}
                            <Button 
                                variant={darkMode ? "outline-light" : "outline-dark"} 
                                className="d-flex align-items-center gap-2 fw-bold rounded-pill px-3 py-2" 
                                style={{ 
                                    fontSize: '1.1rem', 
                                    color: darkMode ? '#e0e0e0' : '#333', 
                                    background: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#fff', 
                                    border: darkMode ? '1px solid #555' : '1px solid #ccc' 
                                }} 
                                onClick={logout}
                            >
                                <span style={{ fontSize: '1.3rem' }}>🚪</span> Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Nav.Link href="/login" className="d-flex align-items-center gap-2 fw-bold rounded-pill px-3 py-2" style={{ 
                                fontSize: '1.1rem', 
                                color: darkMode ? '#60a5fa' : '#1976d2', 
                                background: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#f5faff', 
                                border: `1px solid ${darkMode ? '#60a5fa' : '#1976d2'}` 
                            }}>
                                <span style={{ fontSize: '1.3rem' }}>🔑</span> Login
                            </Nav.Link>
                            <Nav.Link href="/register" className="d-flex align-items-center gap-2 fw-bold rounded-pill px-3 py-2" style={{ 
                                fontSize: '1.1rem', 
                                color: darkMode ? '#60a5fa' : '#1976d2', 
                                background: darkMode ? 'rgba(96, 165, 250, 0.1)' : '#f5faff', 
                                border: `1px solid ${darkMode ? '#60a5fa' : '#1976d2'}` 
                            }}>
                                <span style={{ fontSize: '1.3rem' }}>📝</span> Register
                            </Nav.Link>
                        </>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default AppNavbar;