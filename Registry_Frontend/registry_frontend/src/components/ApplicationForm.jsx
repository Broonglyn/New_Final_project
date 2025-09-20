import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  FloatingLabel,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import api from "../api.jsx";

function ApplicationForm() {
  const [docTypes, setDocTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [docTypeId, setDocTypeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [file, setFile] = useState(null);
  const [fileDescription, setFileDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedDocType, setSelectedDocType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const fetchData = async () => {
      try {
        const [docRes, branchRes] = await Promise.all([
          api.get("/document-types/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/registry-branches/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        // Handle paginated responses
        const docTypesData = Array.isArray(docRes.data) ? docRes.data : docRes.data.results || [];
        const branchesData = Array.isArray(branchRes.data) ? branchRes.data : branchRes.data.results || [];
        setDocTypes(docTypesData);
        setBranches(branchesData);
      } catch (err) {
        setError("Failed to load form options.");
      }
    };
    fetchData();
  }, []);

  const handleDocTypeChange = (e) => {
    const selectedId = e.target.value;
    setDocTypeId(selectedId);
    const docType = docTypes.find(type => type.id === selectedId);
    setSelectedDocType(docType);
  };

  const getUploadRequirements = () => {
    if (!selectedDocType) return null;
    
    const docName = selectedDocType.name.toLowerCase();
    
    if (docName.includes('national id') || docName.includes('nationalid')) {
      return {
        required: true,
        title: "Upload Birth Certificate or Photocopy",
        description: "For National ID applications, you must upload your birth certificate or a clear photocopy as proof of identity and age.",
        accept: ".jpg,.jpeg,.png,.pdf",
        placeholder: "Select birth certificate or photocopy...",
        icon: "🆔"
      };
    } else if (docName.includes('passport')) {
      return {
        required: true,
        title: "Upload Birth Certificate or Photocopy",
        description: "For Passport applications, you must upload your birth certificate or a clear photocopy as proof of citizenship and identity.",
        accept: ".jpg,.jpeg,.png,.pdf",
        placeholder: "Select birth certificate or photocopy...",
        icon: "📘"
      };
    } else if (docName.includes('birth certificate') || docName.includes('birthcertificate')) {
      return {
        required: true,
        title: "Upload Supporting Documents",
        description: "Please upload supporting documents such as hospital records, baptismal certificate, or other proof of birth.",
        accept: ".jpg,.jpeg,.png,.pdf",
        placeholder: "Select supporting documents...",
        icon: "📄"
      };
    } else if (docName.includes('death certificate') || docName.includes('deathcertificate')) {
      return {
        required: true,
        title: "Upload Supporting Documents",
        description: "Please upload supporting documents such as medical records, burial permit, or other proof of death.",
        accept: ".jpg,.jpeg,.png,.pdf",
        placeholder: "Select supporting documents...",
        icon: "📋"
      };
    } else {
      return {
        required: true,
        title: "Upload Required Documents",
        description: "Please upload the required documents for your application.",
        accept: ".jpg,.jpeg,.png,.pdf",
        placeholder: "Select required documents...",
        icon: "📎"
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!docTypeId || !branchId || !file) {
      setError("Please complete all fields and upload the required document.");
      return;
    }

    // Additional validation for specific document types
    if (selectedDocType) {
      const requirements = getUploadRequirements();
      if (requirements.required && !file) {
        setError(`Please upload ${requirements.title.toLowerCase()}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access");

      // Step 1: Create application
      const appRes = await api.post(
        "/applications/",
        {
          document_type: docTypeId,
          branch: branchId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Step 2: Upload attachment
      const formData = new FormData();
      formData.append("application", appRes.data.id);
      formData.append("file", file);
      if (fileDescription) {
        formData.append("description", fileDescription);
      }

      await api.post("/attachments/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setDocTypeId("");
      setBranchId("");
      setFile(null);
      setFileDescription("");
      setSelectedDocType(null);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <Card>
        <Card.Body>
          <h4 className="mb-4">📝 Apply for a Civil Document</h4>
          {success && <Alert variant="success">Application submitted!</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <FloatingLabel label="Document Type" className="mb-3">
                  <Form.Select
                    value={docTypeId}
                    onChange={handleDocTypeChange}
                  >
                    <option value="">-- Select --</option>
                    {Array.isArray(docTypes) && docTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel label="Registry Branch" className="mb-3">
                  <Form.Select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {Array.isArray(branches) && branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </Col>
            </Row>

            {/* Dynamic Upload Requirements */}
            {selectedDocType && (
              <div className="mb-4">
                <div className="alert alert-info">
                  <h6 className="fw-bold mb-2">
                    {getUploadRequirements().icon} {getUploadRequirements().title}
                  </h6>
                  <p className="mb-2">{getUploadRequirements().description}</p>
                  <small className="text-muted">
                    Accepted formats: JPG, PNG, PDF (Max 10MB)
                  </small>
                </div>
                
                <FloatingLabel 
                  label={getUploadRequirements().title} 
                  className="mb-3"
                >
                  <Form.Control
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept={getUploadRequirements().accept}
                    placeholder={getUploadRequirements().placeholder}
                    required={getUploadRequirements().required}
                  />
                </FloatingLabel>

                <FloatingLabel 
                  label="Document Description (Optional)" 
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="e.g., Original birth certificate, Photocopy of birth certificate, etc."
                  />
                </FloatingLabel>
                
                {file && (
                  <div className="alert alert-success">
                    <small>
                      ✅ Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </small>
                  </div>
                )}
              </div>
            )}

            {/* Show upload field even when no document type is selected */}
            {!selectedDocType && (
              <div className="mb-4">
                <div className="alert alert-warning">
                  <small>Please select a document type to see upload requirements.</small>
                </div>
              </div>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ApplicationForm; 