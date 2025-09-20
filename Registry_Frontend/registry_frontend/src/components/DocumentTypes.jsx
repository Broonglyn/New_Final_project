import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Table, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FaFileAlt, FaPlus, FaEdit, FaTrash, FaClock, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import api from '../api.jsx';

function DocumentTypes() {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDocType, setEditingDocType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    processing_days: 1,
    fee: 0,
    requirements: '',
    is_active: true
  });

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/document-types/');
      setDocumentTypes(response.data);
    } catch (err) {
      setError('Failed to load document types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDocType) {
        await api.put(`/document-types/${editingDocType.id}/`, formData);
      } else {
        await api.post('/document-types/', formData);
      }
      setShowModal(false);
      setEditingDocType(null);
      setFormData({ 
        name: '', 
        description: '', 
        processing_days: 1, 
        fee: 0, 
        requirements: '', 
        is_active: true 
      });
      fetchDocumentTypes();
    } catch (err) {
      setError('Failed to save document type');
    }
  };

  const handleEdit = (docType) => {
    setEditingDocType(docType);
    setFormData({
      name: docType.name,
      description: docType.description,
      processing_days: docType.processing_days,
      fee: docType.fee,
      requirements: docType.requirements,
      is_active: docType.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (docTypeId) => {
    if (window.confirm('Are you sure you want to delete this document type?')) {
      try {
        await api.delete(`/document-types/${docTypeId}/`);
        fetchDocumentTypes();
      } catch (err) {
        setError('Failed to delete document type');
      }
    }
  };

  const handleAddNew = () => {
    setEditingDocType(null);
    setFormData({ 
      name: '', 
      description: '', 
      processing_days: 1, 
      fee: 0, 
      requirements: '', 
      is_active: true 
    });
    setShowModal(true);
  };

  return (
    <div>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaFileAlt className="me-2 text-warning" />
            <h5 className="mb-0">Document Types Management</h5>
          </div>
          <Button variant="warning" onClick={handleAddNew}>
            <FaPlus className="me-2" />
            Add Document Type
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading document types...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>Description</th>
                    <th>Processing Time</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documentTypes.map((docType) => (
                    <tr key={docType.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaFileAlt className="me-2 text-muted" />
                          <strong>{docType.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">{docType.description}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaClock className="me-2 text-muted" />
                          <span>{docType.processing_days} day{docType.processing_days !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaDollarSign className="me-2 text-muted" />
                          <span>${docType.fee}</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg={docType.is_active ? 'success' : 'secondary'}>
                          {docType.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(docType)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(docType.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {documentTypes.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <FaFileAlt className="fs-1 mb-3" />
                  <h5>No document types found</h5>
                  <p>Add your first document type to get started.</p>
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
            {editingDocType ? 'Edit Document Type' : 'Add New Document Type'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Document Type Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Birth Certificate"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Processing Days *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.processing_days}
                    onChange={(e) => setFormData({ ...formData, processing_days: parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Fee ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Brief description of this document type"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List required documents or information needed"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active Document Type"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" type="submit">
              {editingDocType ? 'Update Document Type' : 'Add Document Type'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default DocumentTypes;
