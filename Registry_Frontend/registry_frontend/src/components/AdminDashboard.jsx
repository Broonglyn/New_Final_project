import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { FaIdBadge, FaUser, FaFileAlt, FaBuilding, FaCheckCircle, FaTimesCircle, FaPaperclip, FaQrcode, FaClock, FaEye } from "react-icons/fa";
import {
  Table,
  Badge,
  Spinner,
  Alert,
  Form,
  FloatingLabel,
  Card,
  Modal,
  Button,
  Row,
  Col,
  Image,
  ListGroup,
} from "react-bootstrap";
import api from "../api.jsx";
import AdminMenu from "./AdminMenu";
import ManageUsers from "./ManageUsers";
import ApplicationDetailModal from "./ApplicationDetailModal";
import RegistryBranches from "./RegistryBranches";
import DocumentTypes from "./DocumentTypes";

function StatusBadge({ status }) {
  const getStatusStyle = (status) => {
    // Simple, clean colors
    switch (status) {
      case 'submitted':
      case 'review':
        return {
          background: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #bfdbfe'
        };
      case 'approved':
      case 'ready':
      case 'collected':
        return {
          background: '#dcfce7',
          color: '#16a34a',
          border: '1px solid #bbf7d0'
        };
      case 'printed':
      case 'rejected':
        return {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        };
      default:
        return {
          background: '#f1f5f9',
          color: '#64748b',
          border: '1px solid #e2e8f0'
        };
    }
  };

  const style = getStatusStyle(status);
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'submitted':
      case 'review':
        return 'admin-status-badge-submitted';
      case 'approved':
      case 'ready':
      case 'collected':
        return 'admin-status-badge-approved';
      case 'printed':
      case 'rejected':
        return 'admin-status-badge-printed';
      default:
        return 'admin-status-badge-default';
    }
  };

  return (
    <Badge 
      className={`text-uppercase fw-medium ${getStatusClass(status)}`}
      style={{
        ...style,
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '0.75rem',
        letterSpacing: '0.025em'
      }}
    >
      {status}
    </Badge>
  );
}

function AttachmentViewer({ attachments, show, onHide }) {
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return '��️';
    } else if (['pdf'].includes(ext)) {
      return '📄';
    } else if (['doc', 'docx'].includes(ext)) {
      return '📝';
    } else {
      return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>📎 Application Attachments</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {attachments && attachments.length > 0 ? (
          <ListGroup variant="flush">
            {attachments.map((attachment, index) => (
              <ListGroup.Item key={attachment.id} className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="me-3 fs-4">{getFileIcon(attachment.file)}</span>
                  <div>
                    <div className="fw-bold">{attachment.description || 'No description'}</div>
                    <small className="text-muted">
                      {attachment.file.split('/').pop()} • {formatFileSize(attachment.file_size || 0)}
                    </small>
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => window.open(attachment.file, '_blank')}
                    className="me-2"
                  >
                    👁️ View
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = attachment.file;
                      link.download = attachment.file.split('/').pop();
                      link.click();
                    }}
                  >
                    ⬇️ Download
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info" className="text-center">
            <h5>No attachments found</h5>
            <p>This application has no uploaded documents.</p>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function AdminDashboard() {
  const [menuSelected, setMenuSelected] = useState(() => {
    return window.localStorage.getItem("admin_menu_selected") || "";
  });
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    submitted: 0,
    review: 0,
    approved: 0,
    ready: 0,
    collected: 0,
    rejected: 0
  });
  
  const [settingsMessage, setSettingsMessage] = useState("");

  const calculateStatistics = (apps) => {
    const stats = {
      total: apps.length,
      submitted: apps.filter(app => app.status === 'submitted').length,
      review: apps.filter(app => app.status === 'review').length,
      approved: apps.filter(app => app.status === 'approved').length,
      ready: apps.filter(app => app.status === 'ready').length,
      collected: apps.filter(app => app.status === 'collected').length,
      rejected: apps.filter(app => app.status === 'rejected').length
    };
    setStatistics(stats);
  };

  useEffect(() => {
    // Add a small delay to ensure token is set
    setTimeout(() => {
      api.get("/applications/")
        .then((res) => {
          // Handle paginated response
          const apps = Array.isArray(res.data) ? res.data : res.data.results || [];
          setApplications(apps);
          calculateStatistics(apps);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load applications.");
          setLoading(false);
        });
    }, 200);
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    if (newStatus === "rejected") {
      setSelectedAppId(appId);
      setShowModal(true);
      return;
    }

    try {
      await api.patch(`/applications/${appId}/`, { status: newStatus });
      const updatedApps = applications.map((app) => 
        app.id === appId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApps);
      calculateStatistics(updatedApps);
    } catch (err) {
      setError("Failed to update status. Please try again.");
    }
  };

  const submitRejection = async () => {
    try {
      await api.patch(`/applications/${selectedAppId}/`, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });
      const updatedApps = applications.map((app) =>
        app.id === selectedAppId
          ? { ...app, status: "rejected", rejection_reason: rejectionReason }
          : app
      );
      setApplications(updatedApps);
      calculateStatistics(updatedApps);
      setShowModal(false);
      setRejectionReason("");
      setSelectedAppId(null);
    } catch (err) {
      setError("Failed to submit rejection. Please try again.");
    }
  };

  const handleViewAttachments = (attachments) => {
    setSelectedAttachments(attachments || []);
    setShowAttachments(true);
  };

  const handleSettingsCardClick = (cardType) => {
    setMenuSelected(cardType);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const filteredApps = statusFilter
    ? applications.filter((app) => app.status === statusFilter)
    : applications;

  React.useEffect(() => {
    window.localStorage.setItem("admin_menu_selected", menuSelected);
  }, [menuSelected]);

  return (
  <div className="admin-dashboard-container container">
      {!menuSelected ? (
        <Card className="shadow-sm">
          <Card.Body>
            {/* Show AdminMenu first after login */}
            <AdminMenu onSelect={setMenuSelected} />
          </Card.Body>
        </Card>
      ) : menuSelected === "Manage Users" ? (
        <>
          <Button variant="outline-secondary" className="mb-3" onClick={() => {
            setMenuSelected("");
            window.localStorage.setItem("admin_menu_selected", "");
          }}>Dashboard</Button>
          <ManageUsers />
        </>
      ) : menuSelected === "Application Statistics" ? (
        <>
          <Button variant="outline-secondary" className="mb-3" onClick={() => {
            setMenuSelected("");
            window.localStorage.setItem("admin_menu_selected", "");
          }}>Dashboard</Button>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <div className="admin-icon-container me-3">
                  <FaIdBadge className="admin-icon" />
                </div>
                <h3 className="admin-card-title mb-0">Application Statistics</h3>
              </div>
              
              <Row className="g-4">
                <Col md={6} lg={4}>
                  <Card className="admin-dashboard-card h-100">
                    <Card.Body className="text-center">
                      <div className="admin-icon-container mb-3">
                        <FaIdBadge className="admin-icon" style={{ color: '#3b82f6' }} />
                      </div>
                      <h2 className="admin-card-title" style={{ color: '#3b82f6' }}>{statistics.total}</h2>
                      <h6 className="admin-card-subtitle">TOTAL APPLICATIONS</h6>
                      <p className="admin-text-muted">All document requests</p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} lg={4}>
                  <Card className="admin-dashboard-card h-100">
                    <Card.Body className="text-center">
                      <div className="admin-icon-container mb-3">
                        <FaFileAlt className="admin-icon" style={{ color: '#6b7280' }} />
                      </div>
                      <h2 className="admin-card-title" style={{ color: '#6b7280' }}>{statistics.submitted}</h2>
                      <h6 className="admin-card-subtitle">SUBMITTED</h6>
                      <p className="admin-text-muted">Waiting for review</p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} lg={4}>
                  <Card className="admin-dashboard-card h-100">
                    <Card.Body className="text-center">
                      <div className="admin-icon-container mb-3">
                        <FaEye className="admin-icon" style={{ color: '#f59e0b' }} />
                      </div>
                      <h2 className="admin-card-title" style={{ color: '#f59e0b' }}>{statistics.review}</h2>
                      <h6 className="admin-card-subtitle">UNDER REVIEW</h6>
                      <p className="admin-text-muted">Being checked by staff</p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} lg={4}>
                  <Card className="admin-dashboard-card h-100">
                    <Card.Body className="text-center">
                      <div className="admin-icon-container mb-3">
                        <FaCheckCircle className="admin-icon" style={{ color: '#10b981' }} />
                      </div>
                      <h2 className="admin-card-title" style={{ color: '#10b981' }}>{statistics.approved}</h2>
                      <h6 className="admin-card-subtitle">APPROVED</h6>
                      <p className="admin-text-muted">Ready for processing</p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} lg={4}>
                  <Card className="admin-dashboard-card h-100">
                    <Card.Body className="text-center">
                      <div className="admin-icon-container mb-3">
                        <FaIdBadge className="admin-icon" style={{ color: '#3b82f6' }} />
                      </div>
                      <h2 className="admin-card-title" style={{ color: '#3b82f6' }}>{statistics.ready}</h2>
                      <h6 className="admin-card-subtitle">READY</h6>
                      <p className="admin-text-muted">Available for pickup</p>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} lg={4}>
                  <Card className="admin-dashboard-card h-100">
                    <Card.Body className="text-center">
                      <div className="admin-icon-container mb-3">
                        <FaCheckCircle className="admin-icon" style={{ color: '#1e40af' }} />
                      </div>
                      <h2 className="admin-card-title" style={{ color: '#ffffff' }}>{statistics.collected}</h2>
                      <h6 className="admin-card-subtitle">COLLECTED</h6>
                      <p className="admin-text-muted">Successfully received</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      ) : menuSelected === "Settings" ? (
        <>
          <Button variant="outline-secondary" className="mb-3" onClick={() => {
            setMenuSelected("");
            window.localStorage.setItem("admin_menu_selected", "");
          }}>Dashboard</Button>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <div className="admin-icon-container me-3">
                  <FaBuilding className="admin-icon" />
                </div>
                <h3 className="admin-card-title mb-0">System Settings</h3>
              </div>
              
              <Row className="g-4">
                <Col md={6}>
                  <Card className="admin-dashboard-card settings-section-card h-100" style={{ cursor: 'pointer' }} onClick={() => handleSettingsCardClick('branches')}>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="admin-icon-container me-3">
                          <FaBuilding className="admin-icon" style={{ color: '#3b82f6' }} />
                        </div>
                        <h5 className="admin-card-title mb-0">Registry Branches</h5>
                      </div>
                      <p className="admin-text-muted mb-3">Manage registry office branches and their information.</p>
                      <Button variant="outline-primary" className="w-100">
                        Manage Branches
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="admin-dashboard-card settings-section-card h-100" style={{ cursor: 'pointer' }} onClick={() => handleSettingsCardClick('Manage Users')}>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="admin-icon-container me-3">
                          <FaUser className="admin-icon" style={{ color: '#10b981' }} />
                        </div>
                        <h5 className="admin-card-title mb-0">User Management</h5>
                      </div>
                      <p className="admin-text-muted mb-3">Configure user roles, permissions, and access levels.</p>
                      <Button variant="outline-success" className="w-100">
                        User Settings
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="admin-dashboard-card settings-section-card h-100" style={{ cursor: 'pointer' }} onClick={() => handleSettingsCardClick('documents')}>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="admin-icon-container me-3">
                          <FaFileAlt className="admin-icon" style={{ color: '#f59e0b' }} />
                        </div>
                        <h5 className="admin-card-title mb-0">Document Types</h5>
                      </div>
                      <p className="admin-text-muted mb-3">Manage available document types and their requirements.</p>
                      <Button variant="outline-warning" className="w-100">
                        Document Settings
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                
              </Row>
              
            </Card.Body>
          </Card>
        </>
      ) : menuSelected === "branches" ? (
        <>
          <Button variant="outline-secondary" className="mb-3" onClick={() => {
            setMenuSelected("Settings");
            window.localStorage.setItem("admin_menu_selected", "Settings");
          }}>← Back to Settings</Button>
          <RegistryBranches />
        </>
      ) : menuSelected === "documents" ? (
        <>
          <Button variant="outline-secondary" className="mb-3" onClick={() => {
            setMenuSelected("Settings");
            window.localStorage.setItem("admin_menu_selected", "Settings");
          }}>← Back to Settings</Button>
          <DocumentTypes />
        </>
  ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex align-items-center mb-4 gap-2">
              <span className="fs-2 text-primary"><FaIdBadge /></span>
              <h2 className="mb-0 fw-bold">Admin Dashboard</h2>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="mb-4 d-flex align-items-center gap-2">
              <span className="fs-5 text-info"><FaCheckCircle /></span>
              <FloatingLabel label="Filter by Status" className="flex-grow-1">
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">-- All Applications --</option>
                  {["submitted", "review", "approved", "printed", "ready", "collected", "rejected"].map((status) => (
                    <option key={status} value={status}>
                      {status.toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </div>
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <div>
                {filteredApps.length > 0 ? (
                  <Row>
                    {filteredApps.map((app) => (
                      <Col xs={12} sm={6} md={4} lg={3} key={app.id} className="mb-3">
                        <Card 
                          className="h-100 border-0 position-relative admin-dashboard-card"
                        >
                          
                          <Card.Body className="position-relative p-4">
                            <Card.Title 
                              className="fw-bold d-flex align-items-center gap-2 mb-3 admin-card-title"
                            >
                              <div className="d-flex align-items-center justify-content-center admin-icon-container">
                                <FaIdBadge className="admin-icon" />
                              </div>
                              {app.reference_number}
                            </Card.Title>
                            
                            <Card.Subtitle 
                              className="mb-3 d-flex align-items-center gap-2 admin-card-subtitle"
                            >
                              <div className="d-flex align-items-center justify-content-center admin-icon-container" style={{width:'24px',height:'24px',borderRadius:'6px'}}>
                                <FaUser className="admin-icon" style={{fontSize:'0.7rem'}} />
                              </div>
                              {app.applicant_name}
                            </Card.Subtitle>
                            
                            <div className="mb-3 d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center justify-content-center admin-icon-container" style={{width:'24px',height:'24px',borderRadius:'6px'}}>
                                <FaFileAlt className="admin-icon" style={{fontSize:'0.7rem'}} />
                              </div>
                              <span className="badge admin-badge">
                                {app.document_type_name}
                              </span>
                            </div>
                            
                            <div className="mb-3 d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center justify-content-center admin-icon-container" style={{width:'24px',height:'24px',borderRadius:'6px'}}>
                                <FaBuilding className="admin-icon" style={{fontSize:'0.7rem'}} />
                              </div>
                              <span className="badge admin-badge">
                                {app.branch_name}
                              </span>
                            </div>
                            
                            <div className="mb-3">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                {app.status === "approved" || app.status === "ready" || app.status === "collected" ? (
                                  <div className="d-flex align-items-center justify-content-center admin-status-icon-success">
                                    <FaCheckCircle className="fa-check-circle" />
                                  </div>
                                ) : null}
                                {app.status === "rejected" || app.status === "printed" ? (
                                  <div className="d-flex align-items-center justify-content-center admin-status-icon-danger">
                                    <FaTimesCircle className="fa-times-circle" />
                                  </div>
                                ) : null}
                                <Form.Select
                                  size="sm"
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                  className="admin-form-select"
                                >
                                  <option value="submitted">Submitted</option>
                                  <option value="review">Review</option>
                                  <option value="approved">Approved</option>
                                  <option value="printed">Printed</option>
                                  <option value="ready">Ready for Collection</option>
                                  <option value="collected">Collected</option>
                                  <option value="rejected">Rejected</option>
                                </Form.Select>
                                <StatusBadge status={app.status} />
                              </div>
                              {app.status === "rejected" && app.rejection_reason && (
                                <div className="p-3 rounded-3 border-0">
                                  <small className="fw-bold">Reason: {app.rejection_reason}</small>
                                </div>
                              )}
                            </div>
                            
                            <div className="mb-3 d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center justify-content-center admin-icon-container" style={{width:'24px',height:'24px',borderRadius:'6px'}}>
                                <FaPaperclip className="admin-icon" style={{fontSize:'0.7rem'}} />
                              </div>
                              {app.attachments && app.attachments.length > 0 ? (
                                <div>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => handleViewAttachments(app.attachments)}
                                    className="me-2 admin-button"
                                  >
                                    View ({app.attachments.length})
                                  </Button>
                              <small className="d-block admin-text-muted">
                                {app.attachments.length} file{app.attachments.length !== 1 ? 's' : ''}
                              </small>
                                </div>
                              ) : (
                                <span className="admin-text-muted">No attachments</span>
                              )}
                            </div>
                            
                            <div className="mb-3 d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center justify-content-center admin-icon-container" style={{width:'24px',height:'24px',borderRadius:'6px'}}>
                                <FaQrcode className="admin-icon" style={{fontSize:'0.7rem'}} />
                              </div>
                              {app.qr_code ? (
                                <img 
                                  src={app.qr_code} 
                                  alt="QR Code" 
                                  className="admin-qr-code"
                                />
                              ) : (
                                <span className="admin-text-muted">--</span>
                              )}
                            </div>
                            
                            <div className="mb-3 d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center justify-content-center admin-icon-container" style={{width:'24px',height:'24px',borderRadius:'6px'}}>
                                <FaClock className="admin-icon" style={{fontSize:'0.7rem'}} />
                              </div>
                              <small className="admin-text-muted">
                                Updated: {new Date(app.updated_at).toLocaleString()}
                              </small>
                            </div>
                            
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetails(app)}
                                className="d-flex align-items-center gap-2 admin-button"
                              >
                                <FaEye /> View Details
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center text-muted py-4">No applications found.</div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* Rejection Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rejection Reason</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Why is this application rejected?</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submitRejection} disabled={!rejectionReason.trim()}>
            Submit Rejection
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Attachments Modal */}
      <AttachmentViewer
        attachments={selectedAttachments}
        show={showAttachments}
        onHide={() => setShowAttachments(false)}
      />

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default AdminDashboard;