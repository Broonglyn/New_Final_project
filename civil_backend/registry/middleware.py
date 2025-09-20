from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from .security import SecurityHeaders
import logging

security_logger = logging.getLogger('django.security')

class SecurityMiddleware(MiddlewareMixin):
    """Custom security middleware to add security headers and monitor requests"""
    
    def process_response(self, request, response):
        """Add security headers to all responses"""
        # Add security headers
        security_headers = SecurityHeaders.get_security_headers()
        for header, value in security_headers.items():
            response[header] = value
        
        # Log suspicious requests
        if response.status_code >= 400:
            client_ip = request.META.get('REMOTE_ADDR', 'unknown')
            user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
            security_logger.warning(
                f"Suspicious request from IP {client_ip}: "
                f"{request.method} {request.path} - Status: {response.status_code} - "
                f"User-Agent: {user_agent}"
            )
        
        return response

class RequestLoggingMiddleware(MiddlewareMixin):
    """Log all requests for security monitoring"""
    
    def process_request(self, request):
        """Log incoming requests"""
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
        
        # Log only important requests
        if request.path.startswith('/api/'):
            security_logger.info(
                f"API Request: {request.method} {request.path} from IP {client_ip}"
            )
        
        return None
