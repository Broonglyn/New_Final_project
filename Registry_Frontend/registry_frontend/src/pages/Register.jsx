import React, { useState } from 'react';
import './Register.css';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const nav = useNavigate();
  const [data, setData] = useState({
    username: '',
    phone_number: '',
    email: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (data.password !== data.password2) return toast.error('Passwords do not match');
    
    // Validate password contains both letters and numbers
    const hasLetter = /[a-zA-Z]/.test(data.password);
    const hasNumber = /\d/.test(data.password);
    if (!hasLetter || !hasNumber) {
      return toast.error('Password must contain both letters and numbers');
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/register/`, data);
      // Store tokens in the format expected by the app
      localStorage.setItem('access', res.data.token);
      localStorage.setItem('refresh', res.data.refresh);
      // Store user data
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account created!');
      nav('/citizen/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
  <Container className="register-container">
      <Toaster />
      <h3 className="mb-3">Create Account</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" name="username" required value={data.username} onChange={handleChange} placeholder="Enter username" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control type="tel" name="phone_number" required value={data.phone_number} onChange={handleChange} placeholder="+263..." />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" required value={data.email} onChange={handleChange} placeholder="Enter email" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" required value={data.password} onChange={handleChange} placeholder="Must contain letters and numbers" />
          <Form.Text className="text-muted">
            Password must contain both letters and numbers
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control type="password" name="password2" required value={data.password2} onChange={handleChange} placeholder="Confirm your password" />
        </Form.Group>

        <Button type="submit" disabled={loading} className="w-100">
          {loading ? 'Creating...' : 'Register'}
        </Button>
      </Form>
    </Container>
  );
}