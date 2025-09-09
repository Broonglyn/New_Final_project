from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import RegistryBranch
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, DocumentType, Application, Attachment, RegistryBranch
from .serializers import UserSerializer, DocumentTypeSerializer, ApplicationSerializer, AttachmentSerializer, RegistryBranchSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status as drf_status
from .serializers import ApplicationStatusSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class DocumentTypeViewSet(viewsets.ModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer

class RegistryBranchViewSet(viewsets.ModelViewSet):
    queryset = RegistryBranch.objects.all()
    serializer_class = RegistryBranchSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, username=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            print("Login successful")  # Debugging line
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'is_admin': user.is_admin 
                
            }, status=status.HTTP_200_OK)
        else:
            print("Login failed")  # Debugging line
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)



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