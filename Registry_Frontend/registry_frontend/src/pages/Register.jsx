import React, { useState } from 'react';
import './Register.css';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const nav = useNavigate();
  const [data, setData] = useState({
    phone: '',
    email: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (data.password !== data.password2) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/register/`, data);
      localStorage.setItem('token', res.data.token);
      toast.success('Account created!');
      nav('/dashboard');
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
          <Form.Label>Phone Number</Form.Label>
          <Form.Control type="tel" name="phone" required value={data.phone} onChange={handleChange} placeholder="+263..." />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email (optional)</Form.Label>
          <Form.Control type="email" name="email" value={data.email} onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" required value={data.password} onChange={handleChange} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control type="password" name="password2" required value={data.password2} onChange={handleChange} />
        </Form.Group>

        <Button type="submit" disabled={loading} className="w-100">
          {loading ? 'Creating...' : 'Register'}
        </Button>
      </Form>
    </Container>
  );
}