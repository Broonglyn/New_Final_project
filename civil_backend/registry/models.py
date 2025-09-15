from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from . import utils

class RegistryBranch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    location = models.TextField()
    contact_info = models.CharField(max_length=100)

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

    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f'{self.full_name} ({self.email})'

class DocumentType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

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
        # Check if this is a new application by seeing if it exists in DB
        is_new_application = not self.pk or not Application.objects.filter(pk=self.pk).exists()
        
        # Check for status changes before saving
        if self.pk:
            try:
                old = Application.objects.get(pk=self.pk)
                if old.status != self.status and self.user.phone_number:
                    qr_url = f"http://127.0.0.1:8000{self.qr_code}" if self.qr_code else "QR code available in your account"
                    document_type = self.document_type.name if self.document_type else "Document"
                    status_msg = {
                        "rejected": f"Your {document_type} application (Ref: {self.reference_number}) was rejected. Reason: {self.rejection_reason or 'No reason provided.'} QR Code: {qr_url}",
                        "ready": f"Your {document_type} application (Ref: {self.reference_number}) is ready for collection at {self.branch.name}. QR Code: {qr_url}",
                    }.get(self.status, f"Your {document_type} application status changed to {self.status}. QR Code: {qr_url}")

                    try:
                        utils.send_sms(to=self.user.phone_number, message=status_msg)
                    except Exception as e:
                        # Log error but don't fail the save
                        print(f"SMS sending failed: {e}")
            except Application.DoesNotExist:
                pass  # New application, no status change to notify

        # Generate reference number if not exists
        if not self.reference_number:
            if self.user.full_name:
                user_name = self.user.full_name
            elif self.user.username:
                user_name = self.user.username
            else:
                combined_name = f"{self.user.first_name} {self.user.last_name}".strip()
                user_name = combined_name if combined_name else "NA"
            self.reference_number = utils.generate_reference_number(user_name)
        
        super().save(*args, **kwargs)
        
        # Send SMS for new application submission
        if is_new_application and self.user.phone_number:
            try:
                qr_url = f"http://127.0.0.1:8000{self.qr_code}" if self.qr_code else "QR code will be available shortly"
                document_type = self.document_type.name if self.document_type else "Document"
                submission_msg = f"Hi {self.user.full_name or self.user.username}, your {document_type} application (Ref: {self.reference_number}) has been submitted successfully. QR Code: {qr_url}. We'll notify you of any status updates."
                utils.send_sms(to=self.user.phone_number, message=submission_msg)
            except Exception as e:
                # Log error but don't fail the save
                print(f"SMS sending failed: {e}")
        
        # Generate QR code if not exists
        if not self.qr_code and self.reference_number:
            qr_image = utils.generate_qr_code(self.reference_number)
            self.qr_code.save(f'{self.reference_number}_qr.png', qr_image, save=True)
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