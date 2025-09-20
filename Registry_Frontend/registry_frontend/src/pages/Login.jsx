import React, { useState } from 'react';
import './Login.css';
import './Login.css';
import { Form, Button, Container } from 'react-bootstrap';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [data, setData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully');
      // Navigation will be handled by AuthContext and AppWrapper
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
  <Container className="login-container">
      <Toaster />
      <h3>Login</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" required value={data.email} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" required value={data.password} onChange={handleChange} />
        </Form.Group>
        <Button type="submit" disabled={loading} className="w-100">Login</Button>
      </Form>
      <div className="text-center mt-3">
        <Link to="/register">No account? Register</Link>
      </div>
    </Container>
  );
}