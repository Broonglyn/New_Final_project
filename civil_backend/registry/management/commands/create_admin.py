from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an admin user'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Username for admin user')
        parser.add_argument('--email', type=str, default='admin@example.com', help='Email for admin user')
        parser.add_argument('--password', type=str, default='admin123', help='Password for admin user')
        parser.add_argument('--full-name', type=str, default='Administrator', help='Full name for admin user')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        full_name = options['full_name']

        try:
            with transaction.atomic():
                # Check if admin user already exists
                if User.objects.filter(username=username).exists():
                    user = User.objects.get(username=username)
                    user.is_admin = True
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Admin user "{username}" already exists. Updated to admin status.')
                    )
                else:
                    # Create new admin user
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        full_name=full_name,
                        is_admin=True
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully created admin user "{username}"')
                    )
                
                self.stdout.write(f'Username: {username}')
                self.stdout.write(f'Email: {email}')
                self.stdout.write(f'Password: {password}')
                self.stdout.write(f'Is Admin: {user.is_admin}')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {str(e)}')
            )
