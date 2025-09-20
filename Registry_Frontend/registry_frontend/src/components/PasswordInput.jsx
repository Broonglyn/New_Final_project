import React from "react";
import { InputGroup, Form, Button } from "react-bootstrap";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  placeholder,
  ...props
}) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <InputGroup>
        <InputGroup.Text>
          <FaLock className={label === "Confirm Password" ? "text-success" : "text-warning"} />
        </InputGroup.Text>
        <Form.Control
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          {...props}
        />
        <Button
          variant="outline-secondary"
          onClick={onToggleShow}
          tabIndex={-1}
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </Button>
      </InputGroup>
    </Form.Group>
  );
}
