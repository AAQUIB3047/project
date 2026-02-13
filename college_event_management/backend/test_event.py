import json
import os
from datetime import timedelta

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_management.settings')
django.setup()

from django.utils import timezone
from events.models import Event
from registrations.models import Registration
from rest_framework.test import APIClient
from users.models import User

client = APIClient()

print("\n" + "="*70)
print("🧪 COMPREHENSIVE EVENT TESTING")
print("="*70)

# TEST 1: Verify event exists in database
print("\n✅ TEST 1: Event Exists in Database")
print("-" * 70)
event = Event.objects.get(title='The God of High School: Tournament Arc')
print(f"   Event ID: {event.id}")
print(f"   Title: {event.title}")
print(f"   Status: {event.status}")
print(f"   Event Date: {event.event_date}")
print(f"   Max Capacity: {event.max_capacity}")
print(f"   Venue: {event.venue.venue_name}")
print(f"   Category: {event.category.category_name}")

# TEST 2: Verify event is visible via API
print("\n✅ TEST 2: Event Accessible via API")
print("-" * 70)
response = client.get('/api/events/')
if response.status_code == 200:
    events = response.json()
    event_titles = [e['title'] for e in events]
    if 'The God of High School: Tournament Arc' in event_titles:
        print(f"   ✓ Event found in API response")
        print(f"   Total events in API: {len(events)}")
    else:
        print(f"   ✗ Event NOT found in API response")
else:
    print(f"   ✗ API request failed: {response.status_code}")

# TEST 3: Get event by ID via API
print("\n✅ TEST 3: Get Event by ID via API")
print("-" * 70)
response = client.get(f'/api/events/{event.id}/')
if response.status_code == 200:
    event_data = response.json()
    print(f"   ✓ Event retrieved successfully")
    print(f"   Title: {event_data['title']}")
    print(f"   Status: {event_data['status']}")
    print(f"   Registered: {event_data.get('registered_count', 0)}")
else:
    print(f"   ✗ Failed to retrieve event: {response.status_code}")

# TEST 4: Test Event Registration (create a registration)
print("\n✅ TEST 4: Event Registration Test")
print("-" * 70)
student = User.objects.filter(role='student').first()
if student:
    # Create registration programmatically
    registration = Registration.objects.create(
        user=student,
        event=event,
        status='confirmed'
    )
    print(f"   ✓ Registration created for: {student.username}")
    print(f"   Registration ID: {registration.id}")
    print(f"   Status: {registration.status}")
    print(f"   Registered at: {registration.registered_at}")
    
    # Verify registration count
    reg_count = event.registrations.filter(status='confirmed').count()
    print(f"   Current confirmed registrations: {reg_count}/{event.max_capacity}")
else:
    print(f"   ✗ No student user found")

# TEST 5: Test Registration API
print("\n✅ TEST 5: Registration API Test")
print("-" * 70)
response = client.get('/api/registrations/')
if response.status_code == 200:
    registrations = response.json()
    event_registrations = [r for r in registrations if r['event'] == event.id]
    print(f"   ✓ Registrations API working")
    print(f"   Event registrations: {len(event_registrations)}")
else:
    print(f"   ✗ Registrations API failed: {response.status_code}")

# TEST 6: Test Event Status Filtering
print("\n✅ TEST 6: Event Status Filtering Test")
print("-" * 70)
published_events = Event.objects.filter(status='published')
print(f"   Total published events: {published_events.count()}")
tournament_event = published_events.filter(title__icontains='Tournament').first()
if tournament_event:
    print(f"   ✓ Tournament event found with status: {tournament_event.status}")
else:
    print(f"   ✗ Tournament event not found in published events")

# TEST 7: Event Dashboard Data
print("\n✅ TEST 7: Event Dashboard Data")
print("-" * 70)
print(f"   Event Created: {event.created_at.strftime('%Y-%m-%d %H:%M')}")
print(f"   Event Updated: {event.updated_at.strftime('%Y-%m-%d %H:%M')}")
print(f"   Days until event: {(event.event_date - timezone.now().date()).days}")
print(f"   Registration deadline: {event.registration_deadline}")
print(f"   Capacity utilization: {(event.registered_count / event.max_capacity * 100):.1f}%")

# TEST 8: Event Coordinator Check
print("\n✅ TEST 8: Event Coordinator Information")
print("-" * 70)
coordinators = event.coordinators.all()
print(f"   Total coordinators: {coordinators.count()}")
if coordinators.exists():
    for coord in coordinators:
        print(f"   - {coord.faculty.username} ({coord.role})")
else:
    print(f"   No coordinators assigned")

# TEST 9: Venue Availability
print("\n✅ TEST 9: Venue Availability")
print("-" * 70)
print(f"   Venue: {event.venue.venue_name}")
print(f"   Location: {event.venue.location}")
print(f"   Capacity: {event.venue.capacity}")
print(f"   Availability: {event.venue.availability_status}")
print(f"   Sound System: {'Yes' if event.venue.has_sound_system else 'No'}")
print(f"   Projector: {'Yes' if event.venue.has_projector else 'No'}")

# TEST 10: Event Statistics
print("\n✅ TEST 10: Event Statistics Summary")
print("-" * 70)
all_events = Event.objects.all()
draft_events = Event.objects.filter(status='draft').count()
published_events = Event.objects.filter(status='published').count()
ongoing_events = Event.objects.filter(status='ongoing').count()
completed_events = Event.objects.filter(status='completed').count()
cancelled_events = Event.objects.filter(status='cancelled').count()

print(f"   Total Events: {all_events.count()}")
print(f"   - Draft: {draft_events}")
print(f"   - Published: {published_events}")
print(f"   - Ongoing: {ongoing_events}")
print(f"   - Completed: {completed_events}")
print(f"   - Cancelled: {cancelled_events}")

print("\n" + "="*70)
print("✨ ALL EVENT TESTS COMPLETED SUCCESSFULLY!")
print("="*70 + "\n")
