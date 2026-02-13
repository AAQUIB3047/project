import os
from datetime import datetime, time, timedelta

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_management.settings')
django.setup()

from django.utils import timezone
from events.models import Category, Event, Venue
from users.models import Department, User

# Get or create the necessary objects
category = Category.objects.first() or Category.objects.create(category_name='Tournament')
venue = Venue.objects.first() or Venue.objects.create(venue_name='Main Hall', location='Campus', capacity=500)
organizer = User.objects.filter(role='faculty').first()
department = Department.objects.first()

# Create event
event_date = (timezone.now() + timedelta(days=7)).date()
event = Event.objects.create(
    title='The God of High School: Tournament Arc',
    description='An exciting high school tournament event featuring various competitions and activities. Join us for an unforgettable experience!',
    category=category,
    venue=venue,
    event_date=event_date,
    start_time=time(10, 0),
    end_time=time(18, 0),
    department=department,
    max_capacity=200,
    created_by=organizer,
    status='published',
    event_type='competition',
    registration_deadline=event_date - timedelta(days=2)
)

print(f'✅ Event created successfully!')
print(f'   ID: {event.id}')
print(f'   Title: {event.title}')
print(f'   Status: {event.status}')
print(f'   Max Capacity: {event.max_capacity}')
print(f'   Event Date: {event.event_date}')
print(f'   Start Time: {event.start_time}')
print(f'   Venue: {event.venue.venue_name}')
print(f'   Category: {event.category.category_name}')
print(f'   Created by: {event.created_by.username}')

