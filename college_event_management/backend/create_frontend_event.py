import os
from datetime import datetime, time, timedelta

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_management.settings')
django.setup()

from django.utils import timezone
from events.models import Category, Event, Venue
from users.models import Department, User

print("\n" + "="*70)
print("🎯 CREATING NEW EVENT FOR FRONTEND DISPLAY")
print("="*70)

# Get or create necessary related objects
try:
    category = Category.objects.get(category_name='Sports')
except:
    category = Category.objects.create(category_name='Sports', description='Sports Events')
    print(f"✓ Created category: {category.category_name}")

try:
    venue = Venue.objects.get(venue_name='Sports Complex')
except:
    venue = Venue.objects.create(
        venue_name='Sports Complex',
        location='Main Campus',
        capacity=300
    )
    print(f"✓ Created venue: {venue.venue_name}")

department = Department.objects.first()
if not department:
    print("✗ Error: No department found")
    exit(1)

organizer = User.objects.filter(role='faculty').first()
if not organizer:
    print("✗ Error: No faculty user found")
    exit(1)

# Create event with published status so it's visible to everyone
event_date = (timezone.now() + timedelta(days=10)).date()

event = Event.objects.create(
    title='Annual College Sports Day',
    description='Join us for an exciting day of sports competitions, team events, and outdoor activities. Participate in various sports and win prizes!',
    category=category,
    venue=venue,
    event_date=event_date,
    start_time=time(9, 0),
    end_time=time(17, 0),
    department=department,
    max_capacity=150,
    created_by=organizer,
    status='published',  # IMPORTANT: Must be published to show on frontend
    event_type='sports',
    registration_deadline=event_date - timedelta(days=3)
)

print("\n" + "="*70)
print("✅ EVENT CREATED SUCCESSFULLY")
print("="*70)
print(f"  Event ID: {event.id}")
print(f"  Title: {event.title}")
print(f"  Status: {event.status}")
print(f"  Date: {event.event_date}")
print(f"  Time: {event.start_time} - {event.end_time}")
print(f"  Venue: {event.venue.venue_name}")
print(f"  Category: {event.category.category_name}")
print(f"  Capacity: {event.max_capacity}")
print(f"  Created by: {event.created_by.username}")
print("="*70 + "\n")

# Verify it's in the API
import requests

response = requests.get('http://localhost:8000/api/events/')
if response.status_code == 200:
    events = response.json()
    print(f"✓ API verification: {len(events)} event(s) in API")
    for e in events:
        print(f"  - {e['title']} (Status: {e['status']})")
else:
    print(f"✗ API verification failed: {response.status_code}")
