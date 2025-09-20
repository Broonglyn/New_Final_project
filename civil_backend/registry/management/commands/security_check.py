from django.core.management.base import BaseCommand
from django.conf import settings
import os
import logging

class Command(BaseCommand):
    help = 'Perform security checks on the system'

    def handle(self, *args, **options):
        self.stdout.write("🔒 Running Security Checks...")
        
        # Check 1: Debug mode
        if settings.DEBUG:
            self.stdout.write(self.style.WARNING("⚠️  DEBUG mode is enabled - disable in production"))
        else:
            self.stdout.write(self.style.SUCCESS("✅ DEBUG mode is disabled"))
        
        # Check 2: Secret key
        if 'django-insecure' in settings.SECRET_KEY:
            self.stdout.write(self.style.WARNING("⚠️  Using default secret key - change in production"))
        else:
            self.stdout.write(self.style.SUCCESS("✅ Custom secret key is set"))
        
        # Check 3: Allowed hosts
        if '*' in settings.ALLOWED_HOSTS:
            self.stdout.write(self.style.WARNING("⚠️  ALLOWED_HOSTS includes '*' - restrict in production"))
        else:
            self.stdout.write(self.style.SUCCESS("✅ ALLOWED_HOSTS is restricted"))
        
        # Check 4: HTTPS settings
        if not settings.SECURE_SSL_REDIRECT:
            self.stdout.write(self.style.WARNING("⚠️  HTTPS redirect is disabled - enable in production"))
        else:
            self.stdout.write(self.style.SUCCESS("✅ HTTPS redirect is enabled"))
        
        # Check 5: CORS settings
        if settings.CORS_ALLOW_ALL_ORIGINS:
            self.stdout.write(self.style.WARNING("⚠️  CORS allows all origins - restrict in production"))
        else:
            self.stdout.write(self.style.SUCCESS("✅ CORS is restricted"))
        
        # Check 6: Axes configuration
        if hasattr(settings, 'AXES_ENABLED') and settings.AXES_ENABLED:
            self.stdout.write(self.style.SUCCESS("✅ Brute force protection is enabled"))
        else:
            self.stdout.write(self.style.WARNING("⚠️  Brute force protection is disabled"))
        
        # Check 7: Password validators
        validators = settings.AUTH_PASSWORD_VALIDATORS
        min_length = 8
        for validator in validators:
            if validator['NAME'] == 'django.contrib.auth.password_validation.MinimumLengthValidator':
                min_length = validator.get('OPTIONS', {}).get('min_length', 8)
                break
        
        if min_length >= 12:
            self.stdout.write(self.style.SUCCESS("✅ Strong password policy (12+ characters)"))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️  Weak password policy ({min_length} characters)"))
        
        # Check 8: File upload limits
        max_size = settings.FILE_UPLOAD_MAX_MEMORY_SIZE
        if max_size <= 5 * 1024 * 1024:  # 5MB
            self.stdout.write(self.style.SUCCESS("✅ File upload size is limited"))
        else:
            self.stdout.write(self.style.WARNING("⚠️  File upload size is too large"))
        
        self.stdout.write("\n🔒 Security check completed!")
        self.stdout.write("For production deployment, ensure all warnings are addressed.")
