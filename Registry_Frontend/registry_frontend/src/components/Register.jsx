import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaVenusMars, FaMapMarkerAlt, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function InputField({ icon, ...props }) {
  return (
    <div className="input-group mb-3">
      <span className="input-group-text">{icon}</span>
      <input className="form-control" {...props} />
    </div>
  );
}

const Register = ({ onClose, onShowLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    address: "",
    password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    if (formData.password !== formData.confirm_password) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", formData);
      setSuccessMsg("Registration successful! Redirecting to login...");
      
      // Handle redirect based on context
      setTimeout(() => {
        if (onClose) {
          // If in modal context, close register modal and show login modal
          onClose();
          if (onShowLogin) {
            onShowLogin();
          }
        } else {
          // If in page context, navigate to login
          navigate("/login");
        }
      }, 2000);
    } catch (error) {
      const backendError = error.response?.data;
      const readableError = typeof backendError === "object"
        ? Object.values(backendError).join(" ")
        : backendError?.message || "Registration failed. Please try again.";
      setErrorMsg(readableError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container d-flex justify-content-center align-items-center min-vh-100">
  <form className="register-form shadow-lg p-4 rounded" onSubmit={handleSubmit}>
        <h2 className="text-center mb-4 text-primary fw-bold">
          <FaUserPlus className="me-2" /> Register
        </h2>
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}
  <InputField icon={<FaUser />} type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
  <InputField icon={<FaUser />} type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
        <InputField icon={<FaEnvelope />} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <InputField icon={<FaPhone />} type="tel" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required />
        <InputField icon={<FaMapMarkerAlt />} type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <div className="input-group mb-3">
          <span className="input-group-text"><FaVenusMars /></span>
          <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <InputField icon={<FaUser />} type="date" name="date_of_birth" placeholder="Date of Birth" value={formData.date_of_birth} onChange={handleChange} required />
        <InputField icon={<FaLock />} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <InputField icon={<FaLock />} type="password" name="confirm_password" placeholder="Confirm Password" value={formData.confirm_password} onChange={handleChange} required />
        <button type="submit" className="btn btn-primary w-100 fw-bold mb-2" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : <><FaUserPlus className="me-2" /> Register</>}
        </button>
        <div className="text-center mt-2">
          <span>Already have an account?{' '}
            <button
              type="button"
              className="btn btn-link text-primary fw-bold p-0"
              onClick={() => {
                if (typeof onClose === "function") onClose();
                navigate('/login');
              }}
            >
              <FaSignInAlt className="me-1" /> Login
            </button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;