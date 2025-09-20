from rest_framework import serializers
from .models import User, DocumentType, Application, Attachment, RegistryBranch, Notification
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone_number', 'is_admin', 'password', 'first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'sms_notifications_enabled']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True, 'allow_blank': False},
            'username': {'required': True, 'allow_blank': False},
        }

    def get_full_name(self, obj):
        # Prioritize the full_name field, fallback to first_name + last_name
        if obj.full_name:
            return obj.full_name
        return f"{obj.first_name} {obj.last_name}".strip()

    def create(self, validated_data):
        # Check if the username already exists
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        
        # Check if the email already exists
        if User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already taken."})

        # Extract password and other fields
        password = validated_data.pop('password', None)
        
        # Create the user with specific fields only
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data.get('full_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            date_of_birth=validated_data.get('date_of_birth'),
            gender=validated_data.get('gender', ''),
            address=validated_data.get('address', ''),
            sms_notifications_enabled=validated_data.get('sms_notifications_enabled', True)
        )
        
        # Set password after user creation
        if password:
            user.set_password(password)
            user.save()

        return user

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = '__all__'

class RegistryBranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistryBranch
        fields = '__all__'

class AttachmentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='application.user.full_name', read_only=True)
    reference_number = serializers.CharField(source='application.reference_number', read_only=True)

    class Meta:
        model = Attachment
        fields = '__all__'


class DocumentTypeFlexibleField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        try:
            return super().to_internal_value(data)
        except Exception:
            try:
                return DocumentType.objects.get(name=data)
            except DocumentType.DoesNotExist:
                raise serializers.ValidationError("Invalid document_type.")


class RegistryBranchFlexibleField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        try:
            return super().to_internal_value(data)
        except Exception:
            try:
                return RegistryBranch.objects.get(name=data)
            except RegistryBranch.DoesNotExist:
                raise serializers.ValidationError("Invalid branch.")


class ApplicationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    document_type = DocumentTypeFlexibleField(queryset=DocumentType.objects.all())
    branch = RegistryBranchFlexibleField(queryset=RegistryBranch.objects.all())
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    # Add display fields for admin dashboard
    document_type_name = serializers.CharField(source='document_type.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    
    def get_applicant_name(self, obj):
        if obj.user.full_name:
            return obj.user.full_name
        elif obj.user.username:
            return obj.user.username
        else:
            name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return name or "N/A"
    
    def create(self, validated_data):
        user = self.context['request'].user
        application = Application.objects.create(user=user, **validated_data)
        return application

    class Meta:
        model = Application
        fields = '__all__'

class ApplicationStatusSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    branch = RegistryBranchSerializer(read_only=True)
    document_type = DocumentTypeSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = [
            "reference_number",
            "user",
            "document_type",
            "status",
            "rejection_reason",
            "branch",
            "created_at",
            "updated_at",
            "qr_code",
            "attachments",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    application_reference = serializers.CharField(source='application.reference_number', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'is_read', 'created_at', 'application_reference']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['is_admin'] = self.user.is_staff  # or use is_superuser
        return data
