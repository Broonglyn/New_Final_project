from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from . import utils

class RegistryBranch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    national_id_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    registry_branch = models.ForeignKey(RegistryBranch, null=True, blank=True, on_delete=models.SET_NULL)
    is_admin = models.BooleanField(default=False)
    sms_notifications_enabled = models.BooleanField(default=True)

    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'{self.full_name} ({self.email})'

class DocumentType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    processing_days = models.PositiveIntegerField(default=1)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    requirements = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f'{self.name}'

class Application(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('printed', 'Printed'),
        ('ready', 'Ready for Collection'),
        ('collected', 'Collected'),
        ('rejected', 'Rejected'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE)
    branch = models.ForeignKey(RegistryBranch, on_delete=models.CASCADE)
    reference_number = models.CharField(max_length=20, blank=True, null=True, editable=False, unique=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Name : {self.user.full_name} | Ref: {self.reference_number} | Status: {self.status}'

    def save(self, *args, **kwargs):
        if not self.reference_number:
            user_name = self.user.full_name if self.user.full_name else "NA"
            self.reference_number = utils.generate_reference_number(user_name)
        super().save(*args, **kwargs)
        if not self.qr_code and self.reference_number:
            qr_image = utils.generate_qr_code(self.reference_number)
            self.qr_code.save(f'{self.reference_number}_qr.png', qr_image, save=False)
            super().save(update_fields=['qr_code'])

    class Meta:
        ordering = ['-created_at']
class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='attachments/')
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'{self.application.user.full_name} | Ref: {self.application.reference_number}'

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('status_update', 'Status Update'),
        ('application_approved', 'Application Approved'),
        ('application_rejected', 'Application Rejected'),
        ('application_ready', 'Application Ready for Collection'),
        ('system', 'System Notification'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    application = models.ForeignKey(Application, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='system')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} - {self.title}'

class SystemConfiguration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site_name = models.CharField(max_length=200, default='Civil Registry System')
    site_description = models.TextField(default='Digital Civil Registry Management System')
    maintenance_mode = models.BooleanField(default=False)
    allow_registration = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    max_file_size = models.PositiveIntegerField(default=10)  # in MB
    allowed_file_types = models.CharField(max_length=200, default='pdf,jpg,jpeg,png,doc,docx')
    session_timeout = models.PositiveIntegerField(default=30)  # in minutes
    password_min_length = models.PositiveIntegerField(default=8)
    require_email_verification = models.BooleanField(default=False)
    auto_approve_applications = models.BooleanField(default=False)
    notification_email = models.EmailField(blank=True, null=True)
    sms_api_key = models.CharField(max_length=200, blank=True, null=True)
    backup_frequency = models.CharField(max_length=20, default='daily', choices=[
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ])
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        verbose_name = "System Configuration"
        verbose_name_plural = "System Configuration"

    def __str__(self):
        return f'System Configuration - {self.site_name}'