import React from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Card,
  Badge,
  ListGroup,
  Image,
  Alert,
  Tab,
  Tabs,
} from "react-bootstrap";

function ApplicationDetailModal({ application, show, onHide, onStatusChange }) {
  if (!application) return null;

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

  const statusColors = {
    submitted: "secondary",
    review: "info",
    approved: "success",
    printed: "warning",
    ready: "primary",
    collected: "dark",
    rejected: "danger",
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          Application Details - {application.reference_number}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="details" id="application-tabs">
          {/* Application Details Tab */}
          <Tab eventKey="details" title="📋 Details">
            <Row className="mt-3">
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>👤 Applicant Information</Card.Header>
                  <Card.Body>
                    <p><strong>Name:</strong> {application.applicant_name}</p>
                    <p><strong>Email:</strong> {application.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {application.user?.phone_number || 'N/A'}</p>
                    <p><strong>National ID:</strong> {application.user?.national_id_number || 'N/A'}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>📄 Application Information</Card.Header>
                  <Card.Body>
                    <p><strong>Document Type:</strong> {application.document_type_name}</p>
                    <p><strong>Branch:</strong> {application.branch_name}</p>
                    <p><strong>Status:</strong> 
                      <Badge bg={statusColors[application.status]} className="ms-2">
                        {application.status.toUpperCase()}
                      </Badge>
                    </p>
                    <p><strong>Reference:</strong> {application.reference_number}</p>
                    {application.rejection_reason && (
                      <Alert variant="danger" className="mt-2">
                        <strong>Rejection Reason:</strong> {application.rejection_reason}
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Card>
                  <Card.Header>🕒 Timeline</Card.Header>
                  <Card.Body>
                    <p><strong>Submitted:</strong> {new Date(application.created_at).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(application.updated_at).toLocaleString()}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>🔗 QR Code</Card.Header>
                  <Card.Body className="text-center">
                    {application.qr_code ? (
                      <Image src={application.qr_code} alt="QR Code" style={{ maxWidth: "150px" }} />
                    ) : (
                      <p className="text-muted">QR Code not generated yet</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Attachments Tab */}
          <Tab eventKey="attachments" title="📎 Attachments">
            <div className="mt-3">
              {application.attachments && application.attachments.length > 0 ? (
                <ListGroup variant="flush">
                  {application.attachments.map((attachment, index) => (
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
            </div>
          </Tab>

          {/* Status Management Tab */}
          <Tab eventKey="status" title="⚙️ Status Management">
            <div className="mt-3">
              <Card>
                <Card.Header>Update Application Status</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <div className="mb-3">
                        <label className="form-label">Current Status</label>
                        <div>
                          <Badge bg={statusColors[application.status]} className="fs-6">
                            {application.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Change Status To</label>
                        <select 
                          className="form-select"
                          onChange={(e) => onStatusChange(application.id, e.target.value)}
                          value={application.status}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="review">Under Review</option>
                          <option value="approved">Approved</option>
                          <option value="printed">Printed</option>
                          <option value="ready">Ready for Collection</option>
                          <option value="collected">Collected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h6>Status History</h6>
                        <div className="timeline">
                          <div className="timeline-item">
                            <small className="text-muted">Submitted</small>
                            <br />
                            <small>{new Date(application.created_at).toLocaleDateString()}</small>
                          </div>
                          {application.status !== 'submitted' && (
                            <div className="timeline-item">
                              <small className="text-muted">Updated</small>
                              <br />
                              <small>{new Date(application.updated_at).toLocaleDateString()}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ApplicationDetailModal;