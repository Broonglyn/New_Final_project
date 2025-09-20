import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { FaSignInAlt, FaUserCircle } from "react-icons/fa";
import EmailInput from "./EmailInput"; // Ensure this is defined
import PasswordInput from "./PasswordInput"; // Ensure this is defined
import { useAuth } from "../context/AuthContext"; // Import the AuthContext
import LoadingSpinner from "./LoadingSpinner"; // Spinner for loading state

function Login() {
    const { login } = useAuth(); // Get the login function from context
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password); // Call login from context
            navigate("/dashboard"); // Redirect after successful login
        } catch (err) {
            setError(err.message); // Set error message
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <div className="card shadow-lg border-0 p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <div className="text-center mb-4">
                    <FaUserCircle size={60} className="text-primary mb-2" />
                    <h2 className="fw-bold mb-0" style={{ letterSpacing: 1 }}>Civil Registry Login</h2>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin} autoComplete="off">
                    <EmailInput value={email} onChange={e => setEmail(e.target.value)} required />
                    <PasswordInput
                        label="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        showPassword={showPassword}
                        onToggleShow={() => setShowPassword(prev => !prev)}
                        placeholder="Enter your password"
                        required
                    />
                    <Button type="submit" variant="primary" className="w-100 fw-bold py-2" disabled={loading}>
                        <FaSignInAlt className="me-2" /> {loading ? "Logging in..." : "Login"}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Link to="/register" className="text-decoration-none text-primary fw-bold">
                        No account? Register
                    </Link>
                </div>
            </div>
            {loading && <LoadingSpinner />}
        </div>
    );
}

export default Login;