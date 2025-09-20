import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import api from "../api.jsx";
import { useAuth } from "../context/AuthContext";

function ProfileEdit({ show, onHide }) {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (show && user) {
      // Get current user data from API
      api.get("/users/")
        .then((res) => {
          // Handle paginated response
          const users = Array.isArray(res.data) ? res.data : res.data.results || [];
          // Find the current user by email
          const userData = users.find(u => u.email === user.email);
          if (userData) {
            setCurrentUser(userData);
            setFormData({
              username: userData.username || '',
              full_name: userData.full_name || '',
              email: userData.email || '',
              phone_number: userData.phone_number || '',
              password: '',
              confirmPassword: ''
            });
          } else {
            setError("Failed to load profile data.");
          }
        })
        .catch((err) => {
          setError("Failed to load profile data.");
        });
    }
  }, [show, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Prepare update data (exclude empty password fields)
      const updateData = {
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await api.patch(`/users/${currentUser.id}/`, updateData);
      
      setSuccess("Profile updated successfully!");
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      // Close modal after a short delay
      setTimeout(() => {
        onHide();
        setSuccess("");
      }, 1500);

    } catch (err) {
      console.error('Profile update error:', err.response?.data);
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'object' ? 
                            Object.values(err.response.data).flat().join(', ') : 
                            'Failed to update profile. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setFormData({
      username: '',
      full_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirmPassword: ''
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6 className="text-muted">Change Password (Optional)</h6>
          <p className="text-muted small">Leave blank to keep current password</p>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !currentUser}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ProfileEdit;
