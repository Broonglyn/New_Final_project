import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FaCog, FaSave, FaBell, FaShieldAlt, FaDatabase, FaGlobe, FaEnvelope } from 'react-icons/fa';
import api from '../api.jsx';

function SystemConfiguration() {
  const [config, setConfig] = useState({
    site_name: 'Civil Registry System',
    site_description: 'Digital Civil Registry Management System',
    maintenance_mode: false,
    allow_registration: true,
    email_notifications: true,
    sms_notifications: false,
    max_file_size: 10,
    allowed_file_types: 'pdf,jpg,jpeg,png,doc,docx',
    session_timeout: 30,
    password_min_length: 8,
    require_email_verification: false,
    auto_approve_applications: false,
    notification_email: '',
    sms_api_key: '',
    backup_frequency: 'daily'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await api.get('/system-config/');
      setConfig({ ...config, ...response.data });
    } catch (err) {
      setError('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await api.put('/system-config/', config);
      setSuccess('Configuration saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const handleToggle = (field) => {
    setConfig({ ...config, [field]: !config[field] });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaCog className="me-2 text-secondary" />
            <h5 className="mb-0">System Configuration</h5>
          </div>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <FaSave className="me-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Row>
            {/* General Settings */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <FaGlobe className="me-2" />
                    General Settings
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Site Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={config.site_name}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Site Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={config.site_description}
                      onChange={(e) => handleInputChange('site_description', e.target.value)}
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Form.Label className="mb-0">Maintenance Mode</Form.Label>
                      <small className="text-muted d-block">Disable public access</small>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={config.maintenance_mode}
                      onChange={() => handleToggle('maintenance_mode')}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Form.Label className="mb-0">Allow Registration</Form.Label>
                      <small className="text-muted d-block">Allow new user registrations</small>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={config.allow_registration}
                      onChange={() => handleToggle('allow_registration')}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Notification Settings */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <FaBell className="me-2" />
                    Notification Settings
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Form.Label className="mb-0">Email Notifications</Form.Label>
                      <small className="text-muted d-block">Send email notifications</small>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={config.email_notifications}
                      onChange={() => handleToggle('email_notifications')}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Form.Label className="mb-0">SMS Notifications</Form.Label>
                      <small className="text-muted d-block">Send SMS notifications</small>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={config.sms_notifications}
                      onChange={() => handleToggle('sms_notifications')}
                    />
                  </div>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Notification Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={config.notification_email}
                      onChange={(e) => handleInputChange('notification_email', e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>SMS API Key</Form.Label>
                    <Form.Control
                      type="password"
                      value={config.sms_api_key}
                      onChange={(e) => handleInputChange('sms_api_key', e.target.value)}
                      placeholder="Enter SMS API key"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            {/* Security Settings */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <FaShieldAlt className="me-2" />
                    Security Settings
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Session Timeout (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      min="5"
                      max="480"
                      value={config.session_timeout}
                      onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Password Length</Form.Label>
                    <Form.Control
                      type="number"
                      min="6"
                      max="32"
                      value={config.password_min_length}
                      onChange={(e) => handleInputChange('password_min_length', parseInt(e.target.value))}
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Form.Label className="mb-0">Email Verification Required</Form.Label>
                      <small className="text-muted d-block">Require email verification for new users</small>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={config.require_email_verification}
                      onChange={() => handleToggle('require_email_verification')}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Form.Label className="mb-0">Auto-approve Applications</Form.Label>
                      <small className="text-muted d-block">Automatically approve new applications</small>
                    </div>
                    <Form.Check
                      type="switch"
                      checked={config.auto_approve_applications}
                      onChange={() => handleToggle('auto_approve_applications')}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* File Upload Settings */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <FaDatabase className="me-2" />
                    File Upload Settings
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum File Size (MB)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="100"
                      value={config.max_file_size}
                      onChange={(e) => handleInputChange('max_file_size', parseInt(e.target.value))}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Allowed File Types</Form.Label>
                    <Form.Control
                      type="text"
                      value={config.allowed_file_types}
                      onChange={(e) => handleInputChange('allowed_file_types', e.target.value)}
                      placeholder="pdf,jpg,jpeg,png,doc,docx"
                    />
                    <Form.Text className="text-muted">
                      Comma-separated list of allowed file extensions
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Backup Frequency</Form.Label>
                    <Form.Select
                      value={config.backup_frequency}
                      onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* System Status */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">System Status</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <Badge bg={config.maintenance_mode ? 'danger' : 'success'} className="fs-6">
                      {config.maintenance_mode ? 'Maintenance' : 'Online'}
                    </Badge>
                    <p className="mt-2 mb-0">System Status</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <Badge bg={config.allow_registration ? 'success' : 'warning'} className="fs-6">
                      {config.allow_registration ? 'Open' : 'Closed'}
                    </Badge>
                    <p className="mt-2 mb-0">Registration</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <Badge bg={config.email_notifications ? 'success' : 'secondary'} className="fs-6">
                      {config.email_notifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <p className="mt-2 mb-0">Email Notifications</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <Badge bg={config.sms_notifications ? 'success' : 'secondary'} className="fs-6">
                      {config.sms_notifications ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <p className="mt-2 mb-0">SMS Notifications</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SystemConfiguration;
