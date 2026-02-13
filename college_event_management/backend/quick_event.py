import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_management.settings')
django.setup()

from datetime import date, time, timedelta

from events.models import Category, Event, Venue
from users.models import Department, User

# Get or create required objects
venue = Venue.objects.first() or Venue.objects.create(
    venue_name="Main Hall",
    location="College Campus",
    capacity=500,
    has_projector=True,
    has_sound_system=True,
    availability_status='available'
)

category = Category.objects.first() or Category.objects.create(
    category_name="General",
    description="General Event"
)

department = Department.objects.first()
admin_user = User.objects.filter(role='admin').first()

if department and admin_user:
    # Create event
    event, created = Event.objects.get_or_create(
        title='The God of High School: Tournament Arc',
        defaults={
            'description': 'Tournament event inspired by anime',
            'event_date': date.today() + timedelta(days=7),
            'start_time': time(10, 0),
            'end_time': time(17, 0),
            'venue': venue,
            'category': category,
            'department': department,
            'max_capacity': 100,
            'event_type': 'competition',
            'status': 'published',
            'created_by': admin_user
        }
    )
    
    if created:
        print(f"✅ Event created: {event.title}")
    else:
        # Update status if exists
        event.status = 'published'
        event.save()
        print(f"✅ Event updated: {event.title}")
    
    # Verify it's visible
    visible = Event.objects.filter(status__in=['published', 'ongoing']).count()
    print(f"📊 Published/Ongoing events: {visible}")
else:
    print("❌ Missing department or admin user")
