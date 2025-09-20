import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Table, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import api from '../api.jsx';

function RegistryBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches/');
      // Handle both array and object responses
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setBranches(data);
    } catch (err) {
      setError('Failed to load branches');
      setBranches([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}/`, formData);
      } else {
        await api.post('/branches/', formData);
      }
      setShowModal(false);
      setEditingBranch(null);
      setFormData({ name: '', address: '', phone: '', email: '', is_active: true });
      fetchBranches();
    } catch (err) {
      setError('Failed to save branch');
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      is_active: branch.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`/branches/${branchId}/`);
        fetchBranches();
      } catch (err) {
        setError('Failed to delete branch');
      }
    }
  };

  const handleAddNew = () => {
    setEditingBranch(null);
    setFormData({ name: '', address: '', phone: '', email: '', is_active: true });
    setShowModal(true);
  };

  return (
    <div>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaBuilding className="me-2 text-primary" />
            <h5 className="mb-0">Registry Branches Management</h5>
          </div>
          <Button variant="primary" onClick={handleAddNew}>
            <FaPlus className="me-2" />
            Add Branch
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading branches...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaBuilding className="me-2 text-muted" />
                          <strong>{branch.name}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-muted" />
                          <span>{branch.address}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          {branch.phone && (
                            <div className="d-flex align-items-center mb-1">
                              <FaPhone className="me-2 text-muted" />
                              <small>{branch.phone}</small>
                            </div>
                          )}
                          {branch.email && (
                            <div className="d-flex align-items-center">
                              <FaEnvelope className="me-2 text-muted" />
                              <small>{branch.email}</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={branch.is_active ? 'success' : 'secondary'}>
                          {branch.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(branch)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(branch.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {branches.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <FaBuilding className="fs-1 mb-3" />
                  <h5>No branches found</h5>
                  <p>Add your first registry branch to get started.</p>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBranch ? 'Edit Branch' : 'Add New Branch'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter branch name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="Enter full address"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active Branch"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingBranch ? 'Update Branch' : 'Add Branch'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default RegistryBranches;
