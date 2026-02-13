#!/usr/bin/env python
"""
Debug script to check events in database
"""
import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_management.settings')
django.setup()

from django.utils import timezone
from events.models import Event

print("\n" + "="*70)
print("📊 EVENTS DATABASE CHECK")
print("="*70)

# Check total events
total = Event.objects.count()
print(f"\n📌 Total Events: {total}")

# List all events
if total > 0:
    print("\n" + "-"*70)
    for event in Event.objects.all():
        print(f"\n🎯 Event ID: {event.id}")
        print(f"   Title: {event.title}")
        print(f"   Status: {event.status}")
        print(f"   Event Date: {event.event_date}")
        print(f"   Venue: {event.venue}")
        print(f"   Category: {event.category}")
        print(f"   Type: {event.event_type}")
        print(f"   Created By: {event.created_by}")
        print(f"   Created At: {event.created_at}")
else:
    print("\n❌ No events found in database!")

# Check if events are visible (status = published/ongoing)
published = Event.objects.filter(status__in=['published', 'ongoing']).count()
print(f"\n✅ Published/Ongoing Events: {published}")

# Check status distribution
print("\n📈 Status Distribution:")
for status_val, status_label in Event.STATUS_CHOICES:
    count = Event.objects.filter(status=status_val).count()
    print(f"   {status_label}: {count}")

print("\n" + "="*70)
print("✨ Check complete!")
print("="*70 + "\n")
