import React, { useEffect, useState } from "react";
import { Card, Table, Button, Spinner, Alert, Modal, Form, Row, Col } from "react-bootstrap";
import api from "../api.jsx";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    is_admin: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    api.get("/users/")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load users.");
        setLoading(false);
      });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username || '',
      full_name: user.full_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      is_admin: user.is_admin || false
    });
    setShowEditModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${selectedUser.id}/`, editFormData);
      setShowEditModal(false);
      loadUsers(); // Reload users list
      setError("");
    } catch (err) {
      console.error('Update user error:', err.response?.data);
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'object' ? 
                            Object.values(err.response.data).flat().join(', ') : 
                            'Failed to update user. Please try again.');
      setError(errorMessage);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/users/${selectedUser.id}/`);
      setShowDeleteModal(false);
      loadUsers(); // Reload users list
      setError("");
    } catch (err) {
      setError("Failed to delete user. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 fw-bold text-primary">Manage Users</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <div>
              {users.length > 0 ? (
                <div className="row">
                  {users.map((user, idx) => (
                    <div className="col-12 col-sm-6 col-md-4 mb-3" key={user.id ? user.id : `${user.email}-${idx}`}> 
                      <Card className="h-100 shadow-sm">
                        <Card.Body>
                          <Card.Title className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>
                            {user.full_name ? user.full_name : (user.first_name || "") + (user.last_name ? " " + user.last_name : "") || user.username || "N/A"}
                          </Card.Title>
                          <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: "0.95rem" }}>
                            {user.email}
                          </Card.Subtitle>
                          <div className="mb-2">
                            <span className={`badge ${user.is_admin ? "bg-danger" : "bg-info"} text-white`}>
                              {user.is_admin ? "ADMIN" : "CITIZEN"}
                            </span>
                          </div>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDelete(user)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">No users found.</div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={editFormData.username}
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
                    value={editFormData.full_name}
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
                    value={editFormData.email}
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
                    value={editFormData.phone_number}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_admin"
                label="Admin User"
                checked={editFormData.is_admin}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this user?</p>
          {selectedUser && (
            <div className="bg-light p-3 rounded">
              <strong>Username:</strong> {selectedUser.username}<br />
              <strong>Email:</strong> {selectedUser.email}<br />
              <strong>Full Name:</strong> {selectedUser.full_name || 'N/A'}
            </div>
          )}
          <p className="text-danger mt-2">
            <strong>Warning:</strong> This action cannot be undone!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManageUsers;
