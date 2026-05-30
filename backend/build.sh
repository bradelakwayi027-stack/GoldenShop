#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Building project for Render..."
python -m pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Running migrations..."
python manage.py migrate

echo "Seeding admin user..."
python manage.py seed_admin

echo "Build complete."
