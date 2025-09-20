import React, { useState, useEffect } from "react";
import { Card, Button, Form, Alert, Spinner, Modal, Table, Badge, Row, Col } from "react-bootstrap";
import { FaQrcode, FaSearch, FaCheckCircle, FaTimesCircle, FaUserCheck, FaEye, FaCheck, FaSync } from "react-icons/fa";
import api from "../api.jsx";

function CollectionManagement() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [application, setApplication] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [readyApplications, setReadyApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [identityVerified, setIdentityVerified] = useState(false);

  useEffect(() => {
    loadReadyApplications();
  }, []);

  const loadReadyApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await api.get("/applications/?status=ready");
      // Filter out any collected applications that might still be in the response
      const readyApps = response.data.filter(app => app.status === 'ready');
      setReadyApplications(readyApps);
    } catch (err) {
      console.error("Error loading applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      setError("Please enter a reference number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setApplication(null);

    try {
      const response = await api.get(`/applications/?reference_number=${referenceNumber}`);
      
      if (response.data && response.data.length > 0) {
        const app = response.data[0];
        setApplication(app);
        
        if (app.status === 'ready') {
          setSuccess("Application found and ready for collection!");
        } else if (app.status === 'collected') {
          setError("This application has already been collected.");
        } else {
          setError(`Application is not ready for collection. Current status: ${app.status}`);
        }
      } else {
        setError("No application found with this reference number.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search for application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQrScan = () => {
    setShowQrModal(true);
  };

  const handleQrResult = (qrData) => {
    setReferenceNumber(qrData);
    setShowQrModal(false);
    handleSearch({ preventDefault: () => {} });
  };

  const handleCollection = (app) => {
    setSelectedApp(app);
    setShowCollectionModal(true);
    setIdentityVerified(false);
  };

  const confirmCollection = async () => {
    if (!identityVerified) {
      setError("Please verify the applicant's identity before confirming collection.");
      return;
    }

    try {
      await api.patch(`/applications/${selectedApp.id}/`, {
        status: 'collected'
      });
      
      setSuccess("Application marked as collected successfully!");
      setShowCollectionModal(false);
      setSelectedApp(null);
      setIdentityVerified(false);
      
      // Reload the ready applications list to remove the collected one
      await loadReadyApplications();
      
      // Clear search results if this was the searched application
      if (application && application.id === selectedApp.id) {
        setApplication(null);
        setReferenceNumber("");
        setError("");
        setSuccess("");
      }
    } catch (err) {
      console.error("Collection error:", err);
      setError("Failed to mark application as collected. Please try again.");
    }
  };

  const resetForm = () => {
    setReferenceNumber("");
    setApplication(null);
    setError("");
    setSuccess("");
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      submitted: "secondary",
      review: "info",
      approved: "success",
      printed: "warning",
      ready: "primary",
      collected: "dark",
      rejected: "danger",
    };
    return colors[status] || "secondary";
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4" style={{ minHeight: '85vh' }}>
        {/* Search Application Panel */}
        <div className="col-md-6">
          <div 
            className="card border-0 position-relative overflow-hidden collection-search-panel" 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              minHeight: '75vh',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(255,255,255,0.2)',
              animation: 'float 6s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 30px 60px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255,255,255,0.1)';
            }}
          >
            {/* Floating decorative elements */}
            <div className="position-absolute top-0 end-0" style={{ 
              width: '120px', 
              height: '120px', 
              background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))', 
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
              animation: 'pulse 4s ease-in-out infinite'
            }}></div>
            <div className="position-absolute bottom-0 start-0" style={{ 
              width: '100px', 
              height: '100px', 
              background: 'linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', 
              borderRadius: '50%',
              transform: 'translate(-30px, 30px)',
              animation: 'pulse 4s ease-in-out infinite 2s'
            }}></div>
            <div className="position-absolute top-1/2 start-0" style={{ 
              width: '60px', 
              height: '60px', 
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))', 
              borderRadius: '50%',
              transform: 'translate(-15px, -30px)',
              animation: 'float 8s ease-in-out infinite 1s'
            }}></div>
            
            <div className="card-body p-4 d-flex flex-column position-relative" style={{ zIndex: 2 }}>
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3" 
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))', 
                    borderRadius: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}
                >
                  <FaSearch className="text-white" style={{ fontSize: '1.8rem', animation: 'bounce 2s ease-in-out infinite' }} />
                </div>
                <div>
                <h2 className="text-white fw-bold mb-0 gradient-text-white" style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '700',
                  background: 'linear-gradient(45deg, #fff, #f0f9ff, #e0f2fe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  animation: 'slideInDown 0.8s ease-out'
                }}>🔍 Search Application</h2>
                <p className="text-white-50 mb-0 gradient-text-white-50" style={{ 
                  fontSize: '1rem', 
                  opacity: '0.9',
                  animation: 'slideInDown 0.8s ease-out 0.2s both'
                }}>✨ Find and verify applications with magic!</p>
                </div>
              </div>

              <Form onSubmit={handleSearch}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-white mb-3" style={{ 
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    animation: 'slideInLeft 0.6s ease-out 0.3s both'
                  }}>🎯 Reference Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter reference number (e.g., TW-LH3SKLV)"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                    className="border-0"
                    style={{ 
                      borderRadius: '16px', 
                      padding: '16px 20px',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                      border: '2px solid rgba(255,255,255,0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: 'slideInUp 0.6s ease-out 0.4s both'
                    }}
                    onFocus={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                    }}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="light"
                  size="lg"
                  disabled={loading}
                  className="w-100 d-flex align-items-center justify-content-center gap-2 mb-3 border-0"
                  style={{ 
                    fontSize: '1.1rem', 
                    padding: '18px 24px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #fff, #f8fafc, #e2e8f0)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    animation: 'slideInUp 0.6s ease-out 0.5s both'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px) scale(1.02)';
                    e.target.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1)';
                    e.target.style.background = 'linear-gradient(135deg, #fff, #f1f5f9, #e2e8f0)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)';
                    e.target.style.background = 'linear-gradient(135deg, #fff, #f8fafc, #e2e8f0)';
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>🔍 Searching...</span>
                    </>
                  ) : (
                    <>
                      <FaSearch style={{ animation: 'bounce 2s ease-in-out infinite' }} />
                      <span>🚀 Search Application</span>
                    </>
                  )}
                </Button>
              </Form>

              {error && (
                <div 
                  className="mt-4 p-4 rounded-2xl border-0" 
                  style={{ 
                    background: error.includes('already been collected') ? 
                      'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))' :
                      'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                    border: error.includes('already been collected') ? 
                      '2px solid rgba(34, 197, 94, 0.3)' :
                      '2px solid rgba(239, 68, 68, 0.3)',
                    color: error.includes('already been collected') ? '#16a34a' : '#dc2626',
                    borderRadius: '20px',
                    animation: 'slideInDown 0.5s ease',
                    boxShadow: error.includes('already been collected') ? 
                      '0 12px 40px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)' :
                      '0 12px 40px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Floating decorative elements */}
                  <div className="position-absolute top-0 end-0" style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', 
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}></div>
                  
                  <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
                    <div 
                      className="d-flex align-items-center justify-content-center me-3" 
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: error.includes('already been collected') ? 
                          'linear-gradient(135deg, #22c55e, #16a34a, #15803d)' :
                          'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)', 
                        borderRadius: '16px',
                        boxShadow: error.includes('already been collected') ? 
                          '0 8px 24px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)' :
                          '0 8px 24px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        animation: 'bounce 2s ease-in-out infinite'
                      }}
                    >
                      {error.includes('already been collected') ? 
                        <FaCheckCircle style={{ fontSize: '1.3rem', color: 'white' }} /> :
                        <FaTimesCircle style={{ fontSize: '1.3rem', color: 'white' }} />
                      }
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold" style={{ 
                        fontSize: '1.2rem', 
                        margin: 0,
                        background: error.includes('already been collected') ? 
                          'linear-gradient(45deg, #16a34a, #22c55e)' :
                          'linear-gradient(45deg, #dc2626, #ef4444)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {error.includes('already been collected') ? '✅ Already Collected' : '🚨 Oops! Something\'s Not Right'}
                      </h6>
                      <span style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>{error}</span>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div 
                  className="mt-4 p-4 rounded-2xl border-0" 
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    color: '#16a34a',
                    borderRadius: '20px',
                    animation: 'slideInDown 0.5s ease',
                    boxShadow: '0 12px 40px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Floating decorative elements */}
                  <div className="position-absolute top-0 end-0" style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', 
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)',
                    animation: 'pulse 3s ease-in-out infinite 1s'
                  }}></div>
                  
                  <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
                    <div 
                      className="d-flex align-items-center justify-content-center me-3" 
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)', 
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        animation: 'bounce 2s ease-in-out infinite'
                      }}
                    >
                      <FaCheckCircle style={{ fontSize: '1.3rem', color: 'white' }} />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold" style={{ 
                        fontSize: '1.2rem', 
                        margin: 0,
                        background: 'linear-gradient(45deg, #16a34a, #22c55e)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>🎉 Awesome! You Did It!</h6>
                      <span style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>{success}</span>
                    </div>
                  </div>
                </div>
              )}

              {application && (
                <div 
                  className="mt-4 p-4 rounded-lg border-0" 
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    animation: 'slideInUp 0.4s ease',
                    borderRadius: '12px'
                  }}
                >
                  <div className="row">
                    <div className="col-6">
                      <small className="text-white-50 fw-semibold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reference</small>
                      <p className="fw-bold mb-3 text-white" style={{ fontSize: '1rem' }}>{application.reference_number}</p>
                      
                      <small className="text-white-50 fw-semibold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document</small>
                      <p className="mb-3 text-white" style={{ fontSize: '0.9rem' }}>{application.document_type_name}</p>
                    </div>
                    <div className="col-6">
                      <small className="text-white-50 fw-semibold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applicant</small>
                      <p className="fw-bold mb-3 text-white" style={{ fontSize: '1rem' }}>{application.applicant_name}</p>
                      
                      <small className="text-white-50 fw-semibold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch</small>
                      <p className="mb-3 text-white" style={{ fontSize: '0.9rem' }}>{application.branch_name}</p>
                    </div>
                  </div>
                  
                  <div className="row mt-2">
                    <div className="col-12">
                      <small className="text-white-50 fw-semibold" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</small>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span 
                          className="badge"
                          style={{
                            background: application.status === 'ready' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))' : 
                                       application.status === 'collected' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))' :
                                       application.status === 'rejected' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))' :
                                       'linear-gradient(135deg, rgba(156, 163, 175, 0.2), rgba(107, 114, 128, 0.1))',
                            color: application.status === 'ready' ? '#16a34a' : 
                                   application.status === 'collected' ? '#16a34a' :
                                   application.status === 'rejected' ? '#dc2626' :
                                   '#6b7280',
                            border: `2px solid ${application.status === 'ready' ? 'rgba(34, 197, 94, 0.4)' : 
                                              application.status === 'collected' ? 'rgba(34, 197, 94, 0.4)' :
                                              application.status === 'rejected' ? 'rgba(239, 68, 68, 0.4)' :
                                              'rgba(156, 163, 175, 0.4)'}`,
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            boxShadow: `0 4px 16px ${application.status === 'ready' ? 'rgba(34, 197, 94, 0.2)' : 
                                              application.status === 'collected' ? 'rgba(34, 197, 94, 0.2)' :
                                              application.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                                              'rgba(156, 163, 175, 0.2)'}`,
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          {application.status === 'ready' ? 'Ready for Collection' :
                           application.status === 'collected' ? 'Collected' :
                           application.status === 'rejected' ? 'Rejected' :
                           application.status === 'submitted' ? 'Submitted' :
                           application.status === 'review' ? 'Under Review' :
                           application.status === 'approved' ? 'Approved' :
                           application.status === 'printed' ? 'Printed' :
                           application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {application.status === 'ready' && (
                    <div className="text-center mt-3">
                      <Button
                        variant="success"
                        size="lg"
                        onClick={() => handleCollection(application)}
                        className="d-flex align-items-center justify-content-center gap-2 mx-auto border-0"
                        style={{
                          borderRadius: '8px',
                          padding: '10px 24px',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          background: 'rgba(34, 197, 94, 0.9)',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
                          e.target.style.background = 'rgba(34, 197, 94, 1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.3)';
                          e.target.style.background = 'rgba(34, 197, 94, 0.9)';
                        }}
                      >
                        <FaCheck />
                        Mark as Collected
                      </Button>
                    </div>
                  )}
                  

                  {application.status !== 'ready' && application.status !== 'collected' && (
                    <div className="text-center mt-4">
                      <div 
                        className="p-4 rounded-2xl border-0" 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderRadius: '16px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-center gap-3 text-white">
                          <div 
                            className="d-flex align-items-center justify-content-center" 
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))', 
                              borderRadius: '10px',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                            }}
                          >
                            <FaTimesCircle style={{ fontSize: '1.1rem' }} />
                          </div>
                          <div className="text-center">
                            <h6 className="mb-1 fw-bold" style={{ fontSize: '1rem', margin: 0 }}>⏳ Not Ready Yet</h6>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', opacity: '0.9' }}>
                              Application must be ready for collection before marking as collected
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ready for Collection Panel */}
        <div className="col-md-6">
          <div 
            className="card border-0 position-relative overflow-hidden collection-ready-panel" 
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
              minHeight: '75vh',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid rgba(255,255,255,0.2)',
              animation: 'float 6s ease-in-out infinite 2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 30px 60px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255,255,255,0.1)';
            }}
          >
            <div className="position-absolute top-0 start-0" style={{ 
              width: '80px', 
              height: '80px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%',
              transform: 'translate(-25px, -25px)'
            }}></div>
            <div className="position-absolute bottom-0 end-0" style={{ 
              width: '120px', 
              height: '120px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%',
              transform: 'translate(40px, 40px)'
            }}></div>
            
            <div className="card-body p-4 d-flex flex-column position-relative" style={{ zIndex: 2 }}>
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '15px',
                  }}
                >
                  <FaCheckCircle className="text-white" style={{ fontSize: '1.8rem' }} />
                </div>
                <div className="flex-grow-1">
                <h2 className="text-white fw-bold mb-0 gradient-text-white" style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '700',
                  background: 'linear-gradient(45deg, #fff, #f0fdf4, #dcfce7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  animation: 'slideInDown 0.8s ease-out'
                }}>🎉 Ready for Collection</h2>
                <p className="text-white-50 mb-0 gradient-text-white-50" style={{ 
                  fontSize: '1rem', 
                  opacity: '0.9',
                  animation: 'slideInDown 0.8s ease-out 0.2s both'
                }}>✨ Applications ready to be collected with joy!</p>
                </div>
                <Button
                  variant="light"
                  size="sm"
                  onClick={loadReadyApplications}
                  disabled={loadingApplications}
                  className="d-flex align-items-center gap-2"
                  style={{
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                    border: '2px solid rgba(255,255,255,0.4)',
                    color: '#059669',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: '8px 16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    animation: 'slideInRight 0.6s ease-out 0.4s both'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,1), rgba(255,255,255,0.9))';
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  }}
                >
                  <FaSync className={loadingApplications ? 'fa-spin' : ''} style={{ fontSize: '0.9rem' }} />
                  🔄 Refresh
                </Button>
              </div>

              <div className="flex-grow-1">
                {loadingApplications ? (
                  <div className="text-center py-5">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-3" 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '50%',
                      }}
                    >
                      <Spinner animation="border" variant="light" />
                    </div>
                    <p className="text-white-50">Loading applications...</p>
                  </div>
                ) : readyApplications.length === 0 ? (
                  <div className="text-center py-5">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-3" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '50%',
                      }}
                    >
                      <FaCheckCircle className="text-white-50" style={{ fontSize: '2.5rem' }} />
                    </div>
                    <h6 className="text-white-50 fw-bold">No Applications Ready</h6>
                    <p className="text-white-50 small">There are no applications ready for collection at the moment.</p>
                  </div>
                ) : (
                  <div 
                    className="rounded-lg" 
                    style={{ 
                      maxHeight: '50vh', 
                      overflowY: 'auto',
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      padding: '0',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="p-3">
                      {readyApplications.map((app, index) => (
                        <div 
                          key={app.id}
                          className="d-flex align-items-center justify-content-between p-4 mb-3 rounded-xl collection-card"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
                            border: '2px solid rgba(255,255,255,0.3)',
                            animation: `slideInUp 0.6s ease ${index * 0.1}s both`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,1), rgba(255,255,255,0.95))';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))';
                          }}
                        >
                          <div className="d-flex align-items-center flex-grow-1">
                            <div className="me-3">
                              <strong className="text-dark" style={{ fontSize: '0.95rem', fontWeight: '600' }}>{app.reference_number}</strong>
                            </div>
                            <div className="me-3">
                              <span className="text-muted" style={{ fontSize: '0.85rem' }}>{app.document_type_name}</span>
                            </div>
                            <div className="flex-grow-1">
                              <span className="text-dark fw-semibold" style={{ fontSize: '0.9rem' }}>{app.applicant_name}</span>
                            </div>
                          </div>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCollection(app)}
                            className="d-flex align-items-center gap-2 border-0"
                            style={{
                              borderRadius: '12px',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
                              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              padding: '10px 16px',
                              border: '2px solid rgba(255,255,255,0.2)',
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px) scale(1.05)';
                              e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.5)';
                              e.target.style.background = 'linear-gradient(135deg, #059669, #10b981, #34d399)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0) scale(1)';
                              e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
                              e.target.style.background = 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)';
                            }}
                          >
                            <FaCheck style={{ fontSize: '0.9rem', animation: 'bounce 2s ease-in-out infinite' }} />
                            🎉 Collect
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaQrcode className="me-2" />
            Scan QR Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-3">
            <p>Position the QR code within the camera view to scan it automatically.</p>
            <div className="border border-2 border-dashed border-primary p-4 rounded">
              <FaQrcode className="text-muted" style={{ fontSize: '4rem' }} />
              <p className="text-muted mt-2">QR Code Scanner Placeholder</p>
              <p className="small text-muted">
                For now, please enter the reference number manually or ask the citizen to show their QR code.
              </p>
            </div>
          </div>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowQrModal(false)}
          >
            Close
          </Button>
        </Modal.Body>
      </Modal>

      {/* Collection Confirmation Modal */}
      <Modal show={showCollectionModal} onHide={() => setShowCollectionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCheckCircle className="me-2" />
            Confirm Collection
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp && (
            <div>
              <h6 className="fw-bold">Application Details:</h6>
              <p><strong>Reference:</strong> {selectedApp.reference_number}</p>
              <p><strong>Applicant:</strong> {selectedApp.applicant_name}</p>
              <p><strong>Document:</strong> {selectedApp.document_type_name}</p>
              <p><strong>Branch:</strong> {selectedApp.branch_name}</p>
              
              <hr />
              
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="identityVerification"
                  checked={identityVerified}
                  onChange={(e) => setIdentityVerified(e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor="identityVerification">
                  I have verified the applicant's identity and they are authorized to collect this document.
                </label>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCollectionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={confirmCollection}
            disabled={!identityVerified}
          >
            <FaCheck className="me-2" />
            Confirm Collection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CollectionManagement;
