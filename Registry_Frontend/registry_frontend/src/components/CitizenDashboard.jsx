import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Badge, Row, Col, Modal } from "react-bootstrap";
import { FaFileAlt, FaSearch, FaUserEdit, FaChartBar, FaClock, FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ProfileEdit from "./ProfileEdit";
import api from "../api.jsx";

function CitizenDashboard() {
  const { user } = useAuth();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user data
      const usersRes = await api.get("/users/");
      // Handle paginated response
      const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.results || [];
      const userData = users.find(u => u.email === user.email);
      if (userData) {
        setCurrentUser(userData);
        
        // Get user's applications
        const appsRes = await api.get("/applications/");
        // Handle paginated response
        const apps = Array.isArray(appsRes.data) ? appsRes.data : appsRes.data.results || [];
        const userApplications = apps.filter(app => app.user.id === userData.id);
        setApplications(userApplications);
      }
    } catch (err) {
      setError("Failed to load your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const submitted = applications.filter(app => app.status === 'submitted').length;
    const review = applications.filter(app => app.status === 'review').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const ready = applications.filter(app => app.status === 'ready').length;
    const collected = applications.filter(app => app.status === 'collected').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return { total, submitted, review, approved, ready, collected, rejected };
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

  const stats = getApplicationStats();

  return (
    <div className="container-fluid py-5 px-2 px-md-4 citizen-dashboard-container" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div className="position-absolute top-0 start-0" style={{
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.06), rgba(16, 185, 129, 0.04))',
        borderRadius: '50%',
        transform: 'translate(-50px, -50px)',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      <div className="position-absolute top-0 end-0" style={{
        width: '150px',
        height: '150px',
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.06), rgba(37, 99, 235, 0.04))',
        borderRadius: '50%',
        transform: 'translate(50px, -30px)',
        animation: 'float 8s ease-in-out infinite 2.5s'
      }}></div>
      <div className="position-absolute bottom-0 start-50" style={{
        width: '180px',
        height: '180px',
        background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.06), rgba(147, 51, 234, 0.04))',
        borderRadius: '50%',
        transform: 'translate(-50%, 50px)',
        animation: 'float 8s ease-in-out infinite 5s'
      }}></div>

      <div className="position-relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-3 citizen-dashboard-title" style={{
            background: 'linear-gradient(45deg, #22c55e, #16a34a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '3.2rem',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
            animation: 'slideInDown 1s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#0f172a',
            letterSpacing: '-0.02em'
          }}>
            👤 Citizen Dashboard
          </h1>
          {user && (
            <h3 className="fw-bold citizen-welcome-text" style={{
              background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.6rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              animation: 'slideInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both',
              color: '#0f172a',
              letterSpacing: '-0.01em'
            }}>
              👋 Welcome, {user.full_name || user.name || user.email.split('@')[0]}!
            </h3>
          )}
          {user && (
            <div className="mt-3">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowProfileEdit(true)}
                className="d-inline-flex align-items-center gap-2 citizen-edit-button"
                style={{
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  animation: 'slideInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both'
                }}
              >
                <FaUserEdit /> Edit Profile
              </Button>
            </div>
          )}
        </div>

        {/* Application Statistics */}
        {loading ? (
          <div className="text-center py-5">
            <div className="citizen-loading-spinner" style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p className="citizen-loading-text" style={{
              fontSize: '1.1rem',
              color: '#64748b',
              fontWeight: '500',
              animation: 'pulse 2s ease-in-out infinite'
            }}>Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="text-center mb-4">
            <Alert variant="danger" className="citizen-error-alert" style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.15)',
              animation: 'slideInUp 0.6s ease both'
            }}>
              <div className="d-flex align-items-center justify-content-center">
                <FaTimesCircle className="me-2" style={{ fontSize: '1.2rem' }} />
                {error}
              </div>
            </Alert>
          </div>
        ) : (
          <div className="mb-5">
            <Card className="citizen-stats-card border-0" style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="citizen-stats-icon" style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}>
                    <FaChartBar className="text-white" style={{ fontSize: '1.2rem' }} />
                  </div>
                  <h5 className="mb-0 fw-bold citizen-stats-title" style={{
                    fontSize: '1.4rem',
                    background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>Your Application Statistics</h5>
                </div>
                
                <Row className="g-4">
                  {[
                    { 
                      label: 'Total Applications', 
                      value: stats.total, 
                      color: '#3b82f6', 
                      icon: '📊',
                      bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      description: 'All your document requests',
                      emoji: '🎯'
                    },
                    { 
                      label: 'Submitted', 
                      value: stats.submitted, 
                      color: '#6b7280', 
                      icon: '📝',
                      bgGradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
                      description: 'Waiting for review',
                      emoji: '⏳'
                    },
                    { 
                      label: 'Under Review', 
                      value: stats.review, 
                      color: '#f59e0b', 
                      icon: '👀',
                      bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      description: 'Being checked by staff',
                      emoji: '🔍'
                    },
                    { 
                      label: 'Approved', 
                      value: stats.approved, 
                      color: '#10b981', 
                      icon: '✅',
                      bgGradient: 'linear-gradient(135deg, #10b981, #059669)',
                      description: 'Ready for processing',
                      emoji: '🎊'
                    },
                    { 
                      label: 'Ready', 
                      value: stats.ready, 
                      color: '#3b82f6', 
                      icon: '📦',
                      bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      description: 'Available for pickup',
                      emoji: '🚀'
                    },
                    { 
                      label: 'Collected', 
                      value: stats.collected, 
                      color: '#1f2937', 
                      icon: '🎉',
                      bgGradient: 'linear-gradient(135deg, #1f2937, #111827)',
                      description: 'Successfully received',
                      emoji: '🏆'
                    }
                  ].map((stat, index) => (
                    <Col xs={6} md={2} key={stat.label}>
                      <div className="text-center citizen-stat-item" style={{
                        animation: `slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.3 + index * 0.1}s both`
                      }}>
                        <div className="citizen-stat-card" style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '20px',
                          padding: '20px 16px',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                        }}>
                          {/* Animated background gradient */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: stat.bgGradient,
                            animation: 'pulse 3s ease-in-out infinite'
                          }}></div>
                          
                          {/* Icon container with fun animation */}
                          <div style={{
                            width: '60px',
                            height: '60px',
                            background: stat.bgGradient,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                            animation: 'bounce 2s ease-in-out infinite',
                            position: 'relative'
                          }}>
                            <div style={{
                              fontSize: '1.8rem',
                              animation: 'wiggle 3s ease-in-out infinite'
                            }}>
                              {stat.icon}
                            </div>
                            {/* Floating particles effect */}
                            <div style={{
                              position: 'absolute',
                              top: '-5px',
                              right: '-5px',
                              fontSize: '0.8rem',
                              animation: 'float 2s ease-in-out infinite'
                            }}>
                              {stat.emoji}
                            </div>
                          </div>
                          
                          {/* Value with count-up animation effect */}
                          <div className="citizen-stat-value" style={{
                            fontSize: '2.8rem',
                            fontWeight: '800',
                            background: stat.bgGradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            marginBottom: '8px',
                            animation: 'pulse 2s ease-in-out infinite',
                            letterSpacing: '-0.02em'
                          }}>
                            {stat.value}
                          </div>
                          
                          {/* Label with better typography */}
                          <div className="citizen-stat-label" style={{
                            color: '#374151',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            letterSpacing: '0.025em',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {stat.label}
                          </div>
                          
                          {/* Fun description */}
                          <div style={{
                            color: '#6b7280',
                            fontWeight: '500',
                            fontSize: '0.75rem',
                            lineHeight: '1.3',
                            fontStyle: 'italic'
                          }}>
                            {stat.description}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Recent Applications */}
        {!loading && !error && applications.length > 0 && (
          <div className="mb-5">
            <Card className="citizen-applications-card border-0" style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="citizen-applications-icon" style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}>
                    <FaEye className="text-white" style={{ fontSize: '1.2rem' }} />
                  </div>
                  <h5 className="mb-0 fw-bold citizen-applications-title" style={{
                    fontSize: '1.4rem',
                    background: 'linear-gradient(45deg, #06b6d4, #0891b2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>Your Recent Applications</h5>
                </div>
                
                <Row className="g-4">
                  {applications.slice(0, 3).map((app, index) => (
                    <Col md={4} key={app.id}>
                      <Card className="h-100 citizen-application-card border-0" style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        transition: 'all 0.3s ease',
                        animation: `slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.5 + index * 0.1}s both`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                      }}>
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6 className="fw-bold text-primary mb-0 citizen-app-ref" style={{
                              fontSize: '1.1rem',
                              background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>{app.reference_number}</h6>
                            <Badge 
                              bg={getStatusBadgeColor(app.status)} 
                              className="text-uppercase citizen-status-badge"
                              style={{
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontWeight: '600',
                                fontSize: '0.75rem'
                              }}
                            >
                              {app.status}
                            </Badge>
                          </div>
                          <div className="citizen-app-details">
                            <p className="text-muted mb-2" style={{ fontWeight: '500' }}>
                              <strong>📄 Document:</strong> {app.document_type_name}
                            </p>
                            <p className="text-muted mb-2" style={{ fontWeight: '500' }}>
                              <strong>🏢 Branch:</strong> {app.branch_name}
                            </p>
                            <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>
                              <FaClock className="me-2" style={{ color: '#6b7280' }} />
                              <span style={{ fontWeight: '500' }}>
                                {new Date(app.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                {applications.length > 3 && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline-primary" 
                      size="lg"
                      onClick={() => setShowAllApplications(true)}
                      className="citizen-view-all-button"
                      style={{
                        borderRadius: '12px',
                        padding: '12px 24px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both'
                      }}
                    >
                      View All Applications ({applications.length})
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        )}

        {/* No Applications Message */}
        {!loading && !error && applications.length === 0 && (
          <div className="mb-5">
            <Card className="citizen-no-apps-card border-0" style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both'
            }}>
              <Card.Body className="text-center py-5">
                <div className="citizen-no-apps-icon" style={{
                  fontSize: '4rem',
                  marginBottom: '20px',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>📄</div>
                <h5 className="citizen-no-apps-title" style={{
                  fontSize: '1.5rem',
                  color: '#64748b',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>No Applications Yet</h5>
                <p className="citizen-no-apps-text" style={{
                  color: '#9ca3af',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>You haven't submitted any applications yet. Start by applying for a document below.</p>
              </Card.Body>
            </Card>
          </div>
        )}

        <Row className="g-4">
            {/* Apply for Document */}
          <Col md={6}>
            <Card className="citizen-action-card border-0 h-100" style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              transition: 'all 0.3s ease',
              animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 35px 70px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)';
            }}>
              <Card.Body className="p-4">
                <div className="citizen-action-icon" style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)',
                  animation: 'pulse 3s ease-in-out infinite'
                }}>
                  <FaFileAlt className="text-white" style={{ fontSize: '1.5rem' }} />
                </div>
                <Card.Title className="fw-bold citizen-action-title" style={{
                  fontSize: '1.3rem',
                  background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '16px'
                }}>
                    Apply for a Document
                  </Card.Title>
                <Card.Text className="citizen-action-text" style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                    Start a new application for your National ID, Passport, or Birth Certificate. Choose your registry branch and upload required documents.
                  </Card.Text>
                <Button 
                  href="/apply" 
                  variant="primary" 
                  className="citizen-action-button"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Apply Now
                </Button>
                </Card.Body>
              </Card>
          </Col>

            {/* Track Application */}
          <Col md={6}>
            <Card className="citizen-action-card border-0 h-100" style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              transition: 'all 0.3s ease',
              animation: 'slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 35px 70px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)';
            }}>
              <Card.Body className="p-4">
                <div className="citizen-action-icon" style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)',
                  animation: 'pulse 3s ease-in-out infinite'
                }}>
                  <FaSearch className="text-white" style={{ fontSize: '1.5rem' }} />
                </div>
                <Card.Title className="fw-bold citizen-action-title" style={{
                  fontSize: '1.3rem',
                  background: 'linear-gradient(45deg, #06b6d4, #0891b2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '16px'
                }}>
                    Track Application
                  </Card.Title>
                <Card.Text className="citizen-action-text" style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                    Enter your reference number to check the status of your application. View progress, branch updates, and QR code if available.
                  </Card.Text>
                <Button 
                  href="/status" 
                  variant="success" 
                  className="citizen-action-button"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Track
                </Button>
                </Card.Body>
              </Card>
          </Col>
        </Row>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEdit 
        show={showProfileEdit} 
        onHide={() => setShowProfileEdit(false)} 
      />

      {/* All Applications Modal */}
      <Modal 
        show={showAllApplications} 
        onHide={() => setShowAllApplications(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            All Your Applications ({applications.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {applications.length === 0 ? (
            <div className="text-center py-4">
              <FaFileAlt className="text-muted mb-3" style={{ fontSize: '3rem' }} />
              <h5 className="text-muted">No Applications Found</h5>
              <p className="text-muted">You haven't submitted any applications yet.</p>
            </div>
          ) : (
            <div className="row">
              {applications.map((app) => (
                <Col md={6} key={app.id} className="mb-3">
                  <Card className="h-100 border-start border-4 border-primary">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold text-primary mb-0">{app.reference_number}</h6>
                        <Badge bg={getStatusBadgeColor(app.status)} className="text-uppercase">
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-muted small mb-2">
                        <strong>Document:</strong> {app.document_type_name}
                      </p>
                      <p className="text-muted small mb-2">
                        <strong>Branch:</strong> {app.branch_name}
                      </p>
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <FaClock className="me-1" />
                        <strong>Submitted:</strong> {new Date(app.created_at).toLocaleDateString()}
                      </div>
                      {app.qr_code && (
                        <div className="text-center mt-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                              try {
                                const qrUrl = app.qr_code.startsWith('http') 
                                  ? app.qr_code 
                                  : `http://127.0.0.1:8000${app.qr_code}`;
                                console.log('QR Code URL:', qrUrl);
                                console.log('Original QR Code field:', app.qr_code);
                                
                                // Try to open the QR code in new tab first
                                const newWindow = window.open(qrUrl, '_blank');
                                if (!newWindow) {
                                  // If pop-up blocked, show in modal
                                  setSelectedQrCode({ url: qrUrl, ref: app.reference_number });
                                  setShowQrModal(true);
                                }
                              } catch (error) {
                                console.error('Error opening QR code:', error);
                                // Show in modal as fallback
                                const qrUrl = app.qr_code.startsWith('http') 
                                  ? app.qr_code 
                                  : `http://127.0.0.1:8000${app.qr_code}`;
                                setSelectedQrCode({ url: qrUrl, ref: app.reference_number });
                                setShowQrModal(true);
                              }
                            }}
                          >
                            View QR Code
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAllApplications(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QR Code Modal */}
      <Modal 
        show={showQrModal} 
        onHide={() => setShowQrModal(false)}
        size="sm"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            QR Code - {selectedQrCode?.ref}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedQrCode && (
            <div>
              <img 
                src={selectedQrCode.url} 
                alt={`QR Code for ${selectedQrCode.ref}`}
                style={{ maxWidth: '100%', height: 'auto' }}
                onError={(e) => {
                  console.error('Error loading QR code image:', e);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }} className="text-danger">
                <p>Unable to load QR code image.</p>
                <p>URL: {selectedQrCode.url}</p>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => window.open(selectedQrCode.url, '_blank')}
                >
                  Try Opening in New Tab
                </Button>
      </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQrModal(false)}>
            Close
          </Button>
          {selectedQrCode && (
            <Button 
              variant="primary" 
              onClick={() => window.open(selectedQrCode.url, '_blank')}
            >
              Open in New Tab
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CitizenDashboard;