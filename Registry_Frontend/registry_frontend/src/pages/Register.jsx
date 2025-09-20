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
    full_name: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
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
      // Prepare data for backend (exclude password2)
      const { password2, ...backendData } = data;
      const res = await axios.post(`${process.env.REACT_APP_API}/api/register/`, backendData);
      // Store tokens in the format expected by the app
      localStorage.setItem('access', res.data.token);
      localStorage.setItem('refresh', res.data.refresh);
      // Store user data
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account created!');
      nav('/citizen/dashboard');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      
      // Handle validation errors
      if (err.response?.data && typeof err.response.data === 'object') {
        const errors = err.response.data;
        
        // Check for field-specific errors
        if (errors.password) {
          toast.error(errors.password);
        } else if (errors.username) {
          toast.error(errors.username);
        } else if (errors.email) {
          toast.error(errors.email);
        } else if (errors.phone_number) {
          toast.error(errors.phone_number);
        } else if (errors.full_name) {
          toast.error(errors.full_name);
        } else if (errors.first_name) {
          toast.error(errors.first_name);
        } else if (errors.last_name) {
          toast.error(errors.last_name);
        } else if (errors.date_of_birth) {
          toast.error(errors.date_of_birth);
        } else if (errors.gender) {
          toast.error(errors.gender);
        } else if (errors.address) {
          toast.error(errors.address);
        } else if (errors.detail) {
          toast.error(errors.detail);
        } else if (errors.error) {
          toast.error(errors.error);
        } else {
          // Display all validation errors
          const errorMessages = Object.values(errors).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
          } else {
            toast.error('Registration failed. Please check your input.');
          }
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
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
          <Form.Label>Username *</Form.Label>
          <Form.Control type="text" name="username" required value={data.username} onChange={handleChange} placeholder="Enter username" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email *</Form.Label>
          <Form.Control type="email" name="email" required value={data.email} onChange={handleChange} placeholder="Enter email" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control type="text" name="full_name" value={data.full_name} onChange={handleChange} placeholder="Enter your full name" />
        </Form.Group>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="first_name" value={data.first_name} onChange={handleChange} placeholder="First name" />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="last_name" value={data.last_name} onChange={handleChange} placeholder="Last name" />
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number *</Form.Label>
          <Form.Control type="tel" name="phone_number" required value={data.phone_number} onChange={handleChange} placeholder="+263..." />
        </Form.Group>

        <div className="row">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" name="date_of_birth" value={data.date_of_birth} onChange={handleChange} />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select name="gender" value={data.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control as="textarea" rows={3} name="address" value={data.address} onChange={handleChange} placeholder="Enter your address" />
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