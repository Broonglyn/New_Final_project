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
        if not self.reference_number:
            user_name = self.user.full_name if self.user.full_name else "NA"
            self.reference_number = utils.generate_reference_number(user_name)
        super().save(*args, **kwargs)
        if not self.qr_code and self.reference_number:
            qr_image = utils.generate_qr_code(self.reference_number)
            self.qr_code.save(f'{self.reference_number}_qr.png', qr_image, save=False)
            super().save(update_fields=['qr_code'])

class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='attachments/')
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'{self.application.user.full_name} | Ref: {self.application.reference_number}'