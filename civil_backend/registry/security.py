import os
import magic
from django.core.exceptions import ValidationError
from django.conf import settings
import hashlib
import uuid

class SecurityValidator:
    """Security validation utilities for file uploads and data"""
    
    # Allowed file types and their MIME types
    ALLOWED_FILE_TYPES = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
    
    # Maximum file size (5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    @classmethod
    def validate_file_upload(cls, file):
        """Validate uploaded file for security"""
        if not file:
            raise ValidationError("No file provided")
        
        # Check file size
        if file.size > cls.MAX_FILE_SIZE:
            raise ValidationError(f"File too large. Maximum size: {cls.MAX_FILE_SIZE / (1024*1024):.1f}MB")
        
        # Get file MIME type
        file.seek(0)
        mime_type = magic.from_buffer(file.read(1024), mime=True)
        file.seek(0)
        
        # Check if MIME type is allowed
        if mime_type not in cls.ALLOWED_FILE_TYPES:
            raise ValidationError(f"File type not allowed. Allowed types: {list(cls.ALLOWED_FILE_TYPES.keys())}")
        
        # Check file extension
        file_extension = os.path.splitext(file.name)[1].lower()
        if file_extension not in cls.ALLOWED_FILE_TYPES[mime_type]:
            raise ValidationError(f"File extension {file_extension} does not match file type")
        
        return True
    
    @classmethod
    def generate_secure_filename(cls, original_filename):
        """Generate secure filename to prevent path traversal attacks"""
        # Get file extension
        _, ext = os.path.splitext(original_filename)
        
        # Generate secure filename
        secure_name = f"{uuid.uuid4().hex}{ext}"
        
        return secure_name
    
    @classmethod
    def sanitize_input(cls, input_string):
        """Sanitize user input to prevent XSS and injection attacks"""
        if not input_string:
            return ""
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '|', '`', '$']
        sanitized = input_string
        
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, '')
        
        return sanitized.strip()
    
    @classmethod
    def validate_phone_number(cls, phone_number):
        """Validate phone number format"""
        if not phone_number:
            return False
        
        # Remove all non-digit characters except +
        cleaned = ''.join(c for c in phone_number if c.isdigit() or c == '+')
        
        # Check if it starts with + and has 10-15 digits
        if cleaned.startswith('+') and 10 <= len(cleaned[1:]) <= 15:
            return True
        
        return False
    
    @classmethod
    def validate_email(cls, email):
        """Validate email format"""
        if not email:
            return False
        
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @classmethod
    def hash_sensitive_data(cls, data):
        """Hash sensitive data for logging"""
        return hashlib.sha256(data.encode()).hexdigest()[:16]

class RateLimiter:
    """Rate limiting for API endpoints"""
    
    @staticmethod
    def check_rate_limit(request, limit=100, window=3600):
        """Check if request exceeds rate limit"""
        # This would integrate with django-ratelimit
        # For now, return True (no limit exceeded)
        return True

class SecurityHeaders:
    """Security headers for responses"""
    
    @staticmethod
    def get_security_headers():
        """Get security headers for responses"""
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
        }
