import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from dotenv import load_dotenv

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the default administrator user from .env file'

    def handle(self, *args, **options):
        # Ensure env is loaded
        load_dotenv()
        
        email = os.getenv('ADMIN_EMAIL')
        password = os.getenv('ADMIN_PASS')
        
        if not email or not password:
            self.stdout.write(self.style.ERROR('ADMIN_EMAIL and ADMIN_PASS must be set in .env'))
            return
            
        username = email.split('@')[0]
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists.'))
            return
            
        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            name="Principal Admin",
            role="admin"
        )
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded admin user: {email}'))
