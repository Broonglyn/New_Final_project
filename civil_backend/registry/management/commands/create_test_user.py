from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from registry.models import SystemConfiguration

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test admin user and system configuration'

    def handle(self, *args, **options):
        # Create test admin user
        if not User.objects.filter(email='admin@test.com').exists():
            user = User.objects.create_user(
                username='admin',
                email='admin@test.com',
                password='admin123',
                full_name='Test Admin',
                is_admin=True,
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created test admin user: {user.email}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Test admin user already exists')
            )

        # Create system configuration if it doesn't exist
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
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Created system configuration')
            )
        else:
            self.stdout.write(
                self.style.WARNING('System configuration already exists')
            )

        self.stdout.write(
            self.style.SUCCESS('\nTest credentials:')
        )
        self.stdout.write('Email: admin@test.com')
        self.stdout.write('Password: admin123')
