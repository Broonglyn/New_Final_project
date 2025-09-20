import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { FaEnvelope } from "react-icons/fa";

export default function EmailInput({ value, onChange, ...props }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Email</Form.Label>
      <InputGroup>
        <InputGroup.Text><FaEnvelope className="text-primary" /></InputGroup.Text>
        <Form.Control
          type="email"
          value={value}
          onChange={onChange}
          required
          placeholder="Enter your email"
          {...props}
        />
      </InputGroup>
    </Form.Group>
  );
}
