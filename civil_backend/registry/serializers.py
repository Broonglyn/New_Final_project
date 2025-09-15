from rest_framework import serializers
from .models import User, DocumentType, Application, Attachment, RegistryBranch
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone_number', 'password', 'is_admin']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': True, 'allow_blank': False},
        }

    def create(self, validated_data):
        # Check if the username already exists
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        
        # Check if the email already exists
        if User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already taken."})

        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data.get('full_name', '').strip() or None,
            phone_number=validated_data.get('phone_number', None),
        )
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        return user
    
    def update(self, instance, validated_data):
        # Handle password update separately
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
    
    def validate_username(self, value):
        # Exclude current instance when updating
        queryset = User.objects.filter(username=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def validate_email(self, value):
        # Exclude current instance when updating
        queryset = User.objects.filter(email=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This email is already taken.")
        return value

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
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['is_admin'] = self.user.is_admin
        return data


