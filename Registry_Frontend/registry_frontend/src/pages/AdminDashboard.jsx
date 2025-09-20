import React from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaUsers,
  FaChartBar,
  FaCogs,
  FaSignOutAlt,
} from "react-icons/fa";


function AdminDashboard() {
  const navigate = useNavigate();

  return (
  <div className="admin-dashboard-container container">
      <h2 className="text-center mb-4">Admin Dashboard</h2>
      <div className="row g-4">
        {/* Top Row: Manage Users & Create Super User */}
        <div className="col-md-6">
          <div className="card shadow border-0 h-100 text-center p-3">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaUsers size={50} className="text-primary" />
            </div>
            <h5>Manage Users</h5>
            <p>View, approve, or remove citizen accounts.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/users")}
            >
              Manage Users
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow border-0 h-100 text-center p-3">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaUserShield size={50} className="text-info" />
            </div>
            <h5>Create Super User</h5>
            <p>Create new admin/super user accounts.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/create-superuser")}
            >
              Create Super User
            </button>
          </div>
        </div>
        {/* Bottom Row: Reports & Settings */}
        <div className="col-md-6">
          <div className="card shadow border-0 h-100 text-center p-3">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaChartBar size={50} className="text-success" />
            </div>
            <h5>Reports</h5>
            <p>Access detailed reports and analytics.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/reports")}
            >
              View Reports
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow border-0 h-100 text-center p-3">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaCogs size={50} className="text-warning" />
            </div>
            <h5>System Settings</h5>
            <p>Configure system preferences and policies.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/settings")}
            >
              Go to Settings
            </button>
          </div>
        </div>
        {/* Logout: Full width below cards */}
        <div className="col-12">
          <div className="card shadow border-0 h-100 text-center p-3 mt-3">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaSignOutAlt size={50} className="text-danger" />
            </div>
            <h5>Logout</h5>
            <p>Sign out from your admin account securely.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
