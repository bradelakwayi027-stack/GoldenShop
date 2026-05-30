"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
import sys

# Auto-add PostgreSQL 18 bin directory to system PATH on Windows for psycopg loading
if sys.platform == 'win32':
    pg_path = r"C:\Program Files\PostgreSQL\18\bin"
    if os.path.exists(pg_path) and pg_path not in os.environ.get('PATH', ''):
        os.environ['PATH'] = pg_path + os.path.pathsep + os.environ.get('PATH', '')

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_asgi_application()
