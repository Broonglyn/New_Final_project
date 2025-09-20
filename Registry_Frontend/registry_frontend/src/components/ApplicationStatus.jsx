import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ApplicationStatus.css";

const ApplicationStatus = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputRef, setInputRef] = useState(trackingId || "");

  // 🔑 API base - using direct URL to avoid proxy issues
  const API_BASE = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchStatus = () => {
      if (!trackingId) return;
  // ...existing code...
      setLoading(true);

      axios
        .get(`${API_BASE}/track-by-reference/?ref=${trackingId}`)
        .then((res) => {
          // ...existing code...
          if (
            application &&
            res.data.status &&
            res.data.status !== application.status
          ) {
            alert(`�� Status updated: ${res.data.status.toUpperCase()}`);
          }
          setApplication(res.data);
          setError("");
        })
        .catch((error) => {
          // ...existing code...
          setError(
            "❌ Could not fetch application status. Please check the reference number."
          );
          setApplication(null);
        })
        .finally(() => setLoading(false));
    };

    fetchStatus(); // fetch immediately

    return () => {
      // clearInterval(interval);
    };
  }, [trackingId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputRef.trim()) {
      navigate(`/status/${inputRef.trim()}`);
    }
  };

  const statusColors = {
    submitted: "secondary",
    review: "info",
    approved: "success",
    printed: "primary",
    ready: "warning",
    collected: "dark",
    rejected: "danger",
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-gradient">�� Application Status</h2>
        <p className="text-muted">
          Track your civil document progress in real time
        </p>
      </div>

      {/* 🔍 Search bar */}
      <form onSubmit={handleSearch} className="mb-4 text-center">
        <div className="input-group w-50 mx-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Enter reference number"
            value={inputRef}
            onChange={(e) => setInputRef(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>

      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4">
          {trackingId && (
            <div className="mb-3">
              <span className="text-muted">Reference Number:</span>
              <h5 className="fw-semibold">{trackingId}</h5>
            </div>
          )}

          {/* 🔄 Loading spinner */}
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-info" role="status"></div>
              <p className="mt-2">Fetching status...</p>
            </div>
          )}

          {/* ❌ Error */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* ✅ Application details */}
          {application && (
            <>
              <div className="row g-4">
                {/* 👤 Applicant Info */}
                <div className="col-md-6">
                  <div className="border-start ps-3">
                    <h6 className="fw-bold">�� Applicant Info</h6>
                    <p>
                      <strong>Name:</strong>{" "}
                      {application.user?.full_name ||
                        application.user?.username ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {application.user?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {application.user?.phone_number || "N/A"}
                    </p>
                  </div>
                </div>

                {/* 📑 Document */}
                <div className="col-md-6">
                  <div className="border-start ps-3">
                    <h6 className="fw-bold">�� Document Details</h6>
                    <p>
                      <strong>Type:</strong>{" "}
                      {application.document_type?.name ||
                        application.document_type ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge bg-${
                          statusColors[application.status] || "secondary"
                        }`}
                      >
                        {application.status
                          ?.replace("_", " ")
                          .toUpperCase() || "UNKNOWN"}
                      </span>
                    </p>
                    {application.status === "rejected" && (
                      <p>
                        <strong>Reason:</strong>{" "}
                        {application.rejection_reason || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {/* 🏢 Branch */}
                <div className="col-md-6">
                  <div className="border-start ps-3">
                    <h6 className="fw-bold">�� Registry Branch</h6>
                    <p>
                      <strong>Name:</strong>{" "}
                      {application.branch?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {application.branch?.location || "N/A"}
                    </p>
                    <p>
                      <strong>Contact:</strong>{" "}
                      {application.branch?.contact_info || "N/A"}
                    </p>
                  </div>
                </div>

                {/* 🕒 Timeline */}
                <div className="col-md-6">
                  <div className="border-start ps-3">
                    <h6 className="fw-bold">🕒 Timeline</h6>
                    <p>
                      <strong>Submitted:</strong>{" "}
                      {application.created_at
                        ? new Date(application.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {application.updated_at
                        ? new Date(application.updated_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* 🔗 QR Code */}
                {application.qr_code && (
                  <div className="col-12 text-center">
                    <h6 className="fw-bold">🔗 QR Code</h6>
                    <img
                      src={`http://127.0.0.1:8000${application.qr_code}`}
                      alt="QR Code"
                      className="img-fluid rounded qr-preview"
                      style={{ maxWidth: "200px" }}
                    />
                  </div>
                )}
              </div>

              <div className="text-center mt-4">
                <button
                  className="btn btn-outline-dark"
                  onClick={() => window.print()}
                >
                  🖨️ Print Status
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;