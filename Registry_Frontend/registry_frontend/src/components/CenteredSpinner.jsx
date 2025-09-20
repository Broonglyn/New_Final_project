import React from "react";
import { Spinner } from "react-bootstrap";

export default function CenteredSpinner({ message }) {
  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(255,255,255,0.7)",
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        {message && <div className="mt-2 fw-bold text-primary">{message}</div>}
      </div>
    </div>
  );
}
