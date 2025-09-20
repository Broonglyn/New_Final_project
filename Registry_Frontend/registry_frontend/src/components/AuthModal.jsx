import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from "react-bootstrap";
import AppNavbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import CitizenDashboard from "./components/CitizenDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ApplicationForm from "./components/ApplicationForm";
import ApplicationStatus from "./components/ApplicationStatus";

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Router>
        <AppNavbar
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => setShowLogin(true)}
          onRegisterClick={() => setShowRegister(true)}
        />

        {/* Login Modal */}
        <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
          <Modal.Body>
            <Login setUser={setUser} onClose={() => setShowLogin(false)} />
          </Modal.Body>
        </Modal>

        {/* Register Modal */}
        <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
          <Modal.Body>
            <Register onClose={() => setShowRegister(false)} />
          </Modal.Body>
        </Modal>

        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
          <Routes>
            <Route path="/" element={<div />} /> {/* Empty landing route */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === "admin" ? <AdminDashboard /> : <CitizenDashboard />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/apply"
              element={user ? <ApplicationForm /> : <Navigate to="/" />}
            />
            <Route
              path="/status"
              element={user ? <ApplicationStatus /> : <Navigate to="/" />}
            />
            <Route
              path="/status/:trackingId"
              element={user ? <ApplicationStatus /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;