from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import RegistryBranch
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, DocumentType, Application, Attachment, RegistryBranch, Notification, SystemConfiguration
from .serializers import UserSerializer, DocumentTypeSerializer, ApplicationSerializer, AttachmentSerializer, RegistryBranchSerializer, NotificationSerializer, SystemConfigurationSerializer
from .sms_service import sms_service
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status as drf_status
from .serializers import ApplicationStatusSerializer
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from .security import SecurityValidator
import logging

# Security logger
security_logger = logging.getLogger('django.security')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [AllowAny]  # Temporarily allow access for testing

class RegistryBranchViewSet(viewsets.ModelViewSet):
    queryset = RegistryBranch.objects.all()
    serializer_class = RegistryBranchSerializer
    permission_classes = [AllowAny]  # Temporarily allow access for testing

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [AllowAny]  # Temporarily allow access for testing
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        # Send SMS when application is submitted
        if response.status_code == 201:  # Created successfully
            application = Application.objects.get(id=response.data['id'])
            try:
                sms_result = sms_service.send_application_submission_sms(
                    application.user, 
                    application
                )
                if sms_result['success']:
                    print(f"Submission SMS sent successfully to {application.user.phone_number}")
                else:
                    print(f"Submission SMS failed: {sms_result['message']}")
            except Exception as e:
                print(f"Error sending submission SMS: {str(e)}")
        
        return response
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        
        response = super().update(request, *args, **kwargs)
        
        # Create notification if status changed
        if old_status != instance.status:
            self.create_status_notification(instance, old_status, instance.status)
        
        return response
    
    def create_status_notification(self, application, old_status, new_status):
        notification_type = 'status_update'
        title = f"Application Status Updated"
        
        status_messages = {
            'submitted': 'Your application has been submitted and is under review.',
            'review': 'Your application is currently under review.',
            'approved': 'Great news! Your application has been approved.',
            'printed': 'Your document has been printed and is being processed.',
            'ready': 'Your document is ready for collection!',
            'collected': 'Your document has been collected.',
            'rejected': 'Unfortunately, your application has been rejected.'
        }
        
        message = f"Application {application.reference_number} status changed from '{old_status}' to '{new_status}'. {status_messages.get(new_status, '')}"
        
        # Create in-app notification for the application owner
        Notification.objects.create(
            user=application.user,
            application=application,
            type=notification_type,
            title=title,
            message=message
        )
        
        # Send SMS notification
        try:
            sms_result = sms_service.send_application_status_sms(
                application.user, 
                application, 
                old_status, 
                new_status
            )
            if sms_result['success']:
                print(f"SMS sent successfully to {application.user.phone_number}")
            else:
                print(f"SMS failed: {sms_result['message']}")
        except Exception as e:
            print(f"Error sending SMS: {str(e)}")

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]  # Temporarily allow access for testing
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                
                # Send welcome SMS (non-blocking)
                try:
                    sms_result = sms_service.send_welcome_sms(user)
                    if sms_result['success']:
                        print(f"Welcome SMS sent successfully to {user.phone_number}")
                    else:
                        print(f"Welcome SMS failed: {sms_result['message']}")
                except Exception as e:
                    print(f"Error sending welcome SMS: {str(e)}")
                    # Don't fail registration if SMS fails
                
                return Response({
                    "message": "User registered successfully",
                    "user": {
                        "id": str(user.id),
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.full_name
                    }
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return Response({
                "error": "Registration failed",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='post')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Log login attempt
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        security_logger.warning(f"Login attempt from IP {client_ip} for email {email}")

        if not email or not password:
            security_logger.warning(f"Login failed - missing credentials from IP {client_ip}")
            return Response({
                'detail': 'Email and password are required.',
                'error_type': 'validation_error'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate email format
        if not SecurityValidator.validate_email(email):
            security_logger.warning(f"Login failed - invalid email format from IP {client_ip}")
            return Response({
                'detail': 'Invalid email format.',
                'error_type': 'validation_error'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            security_logger.info(f"Login successful for user: {user.email} from IP {client_ip}")
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'is_admin': user.is_admin,
                'user': {
                    'email': user.email,
                    'full_name': user.full_name,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_200_OK)
        else:
            security_logger.warning(f"Login failed - invalid credentials for email {email} from IP {client_ip}")
            return Response({
                'detail': 'Invalid email or password. Please check your credentials and try again.',
                'error_type': 'authentication_error'
            }, status=status.HTTP_401_UNAUTHORIZED)



class RegistryBranchList(APIView):
    def get(self, request):
        branches = RegistryBranch.objects.all()
        serializer = RegistryBranchSerializer(branches, many=True)
        return Response(serializer.data)
    
@api_view(["GET"])
@permission_classes([AllowAny])
def track_by_reference(request):
    ref = request.GET.get("ref")
    if not ref:
        return Response({"detail": "Reference number is required."},
                        status=drf_status.HTTP_400_BAD_REQUEST)

    try:
        application = Application.objects.get(reference_number=ref)
        serializer = ApplicationStatusSerializer(application)
        return Response(serializer.data)
    except Application.DoesNotExist:
        return Response({"detail": "Application not found."},
                        status=drf_status.HTTP_404_NOT_FOUND)

class SystemConfigurationView(APIView):
    permission_classes = [AllowAny]  # Temporarily allow access for testing
    
    def get(self, request):
        # Get or create system configuration
        config, created = SystemConfiguration.objects.get_or_create(
            defaults={
                'site_name': 'Civil Registry System',
                'site_description': 'Digital Civil Registry Management System',
                'maintenance_mode': False,
                'allow_registration': True,
                'email_notifications': True,
                'sms_notifications': False,
                'max_file_size': 10,
                'allowed_file_types': 'pdf,jpg,jpeg,png,doc,docx',
                'session_timeout': 30,
                'password_min_length': 8,
                'require_email_verification': False,
                'auto_approve_applications': False,
                'backup_frequency': 'daily'
            }
        )
        serializer = SystemConfigurationSerializer(config)
        return Response(serializer.data)
    
    def put(self, request):
        config, created = SystemConfiguration.objects.get_or_create(
            defaults={
                'site_name': 'Civil Registry System',
                'site_description': 'Digital Civil Registry Management System',
                'maintenance_mode': False,
                'allow_registration': True,
                'email_notifications': True,
                'sms_notifications': False,
                'max_file_size': 10,
                'allowed_file_types': 'pdf,jpg,jpeg,png,doc,docx',
                'session_timeout': 30,
                'password_min_length': 8,
                'require_email_verification': False,
                'auto_approve_applications': False,
                'backup_frequency': 'daily'
            }
        )
        serializer = SystemConfigurationSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)