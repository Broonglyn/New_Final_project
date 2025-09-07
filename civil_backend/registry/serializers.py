from rest_framework import serializers
from .models import User, DocumentType, Application, Attachment, RegistryBranch
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'phone_number', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True, 'allow_blank': False},
        }

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def create(self, validated_data):
        # Check if the username already exists
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        
        # Check if the email already exists
        if User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already taken."})

        # Create the user
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('full_name', ''),
            # If you have a custom user model, you may need to handle full_name differently
            # If using a Profile model, save to that model instead.
        )
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        
        # If using a Profile model, create or update the profile here
        # Profile.objects.create(user=user, phone_number=validated_data['phone_number'])

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


class ApplicationSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    user = UserSerializer(read_only=True)
    document_type = serializers.SlugRelatedField(
        queryset=DocumentType.objects.all(),
        slug_field='name'
    )
    branch = serializers.PrimaryKeyRelatedField(
        queryset=RegistryBranch.objects.all()
    )
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
        data['is_admin'] = self.user.is_staff  # or use is_superuser
        return data
