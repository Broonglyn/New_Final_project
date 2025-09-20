import React from "react";

function LoadingSpinner({ message = "Verifying..." }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.7)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div className="spinner-circle"></div>
      <p className="mt-3 fs-5 text-primary fw-bold">{message}</p>

      <style>
        {`
          .spinner-circle {
            width: 60px;
            height: 60px;
            border: 6px solid transparent;
            border-top: 6px solid #007bff;
            border-right: 6px solid #28a745;
            border-bottom: 6px solid #dc3545;
            border-radius: 50%;
            animation: spin 1.2s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default LoadingSpinner;