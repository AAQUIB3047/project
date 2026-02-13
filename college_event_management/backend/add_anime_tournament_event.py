"""
Script to add "The God of High School Tournament" event
Run this in Django shell: python manage.py shell < add_anime_tournament_event.py
"""

import os
from datetime import date, datetime, time, timedelta

import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_management.settings')
django.setup()

from django.contrib.auth import get_user_model
from events.models import Category, Event, Venue
from users.models import Department, User

User = get_user_model()

def create_tournament_event():
    """Create 'The God of High School' tournament event"""
    
    print("=" * 60)
    print("🎬 Creating 'The God of High School' Tournament Event")
    print("=" * 60)
    
    try:
        # Get or create venue
        print("\n1️⃣ Setting up Venue...")
        venue, venue_created = Venue.objects.get_or_create(
            venue_name="Grand Tournament Arena",
            defaults={
                'location': "College Central Auditorium, Main Campus",
                'capacity': 500,
                'facilities': 'Professional Stage, High-end Sound System, LED Screens, Stadium Seating for 500, Broadcast Ready',
                'has_projector': True,
                'has_sound_system': True,
                'availability_status': 'available'
            }
        )
        if venue_created:
            print(f"   ✅ Venue created: {venue.venue_name}")
        else:
            print(f"   ℹ️ Using existing venue: {venue.venue_name}")
        
        # Get or create category
        print("\n2️⃣ Setting up Category...")
        category, cat_created = Category.objects.get_or_create(
            category_name="Anime Tournament",
            defaults={
                'description': "Competitive anime-themed tournaments and esports events",
                'icon': "⚔️"
            }
        )
        if cat_created:
            print(f"   ✅ Category created: {category.category_name}")
        else:
            print(f"   ℹ️ Using existing category: {category.category_name}")
        
        # Get department
        print("\n3️⃣ Assigning Department...")
        department = Department.objects.first()
        if not department:
            print("   ❌ Error: No department found in database")
            return False
        print(f"   ✅ Using department: {department.department_name}")
        
        # Get admin user
        print("\n4️⃣ Setting Creator...")
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.first()
        print(f"   ✅ Created by: {admin_user.full_name}")
        
        # Create event
        print("\n5️⃣ Creating Event...")
        event_date = date.today() + timedelta(days=14)  # 2 weeks from now
        
        event_data = {
            'title': 'The God of High School: Tournament Arc',
            'description': '''An intense tournament-style competition inspired by the God of High School anime!

🏆 TOURNAMENT STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Round 1: Qualifying Matches (Best of 3)
Round 2: Group Stage (4 groups, top 2 advance)
Round 3: Semi-Finals (Direct elimination)
Finals: Championship Match (LIVE BROADCAST)

👥 REGISTRATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Team Size: 3-5 members per team
Registration Deadline: 2 days before event
Entry Fee: FREE for college students
Age Requirement: 18+ years

🎁 PRIZES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 1st Place: Trophy + ₹5000 + Certificate + Title
🥈 2nd Place: Trophy + ₹3000 + Certificate
🥉 3rd Place: Trophy + ₹1000 + Certificate
⭐ Best Sportsmanship Award

📋 RULES & CONDUCT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Fair gameplay and respect for all participants
✅ No cheating or unsportsmanlike conduct
✅ Listen to referee decisions
✅ Celebrate wins and losses gracefully
✅ Support fellow competitors

📞 CONTACT:
For queries: tournaments@college.edu
WhatsApp: +91-XXXX-XXXX-XXXX
Website: college.edu/tournaments

Good luck warriors! 🔥⚔️🔥
''',
            'event_date': event_date,
            'start_time': time(10, 0),  # 10:00 AM
            'end_time': time(17, 0),    # 5:00 PM
            'venue': venue,
            'category': category,
            'department': department,
            'max_capacity': 100,  # 20 teams × 5 members
            'event_type': 'competition',
            'status': 'published',
            'registration_fee': 0.00,
            'registration_deadline': event_date - timedelta(days=2),
            'created_by': admin_user
        }
        
        event, created = Event.objects.get_or_create(
            title='The God of High School: Tournament Arc',
            event_date=event_date,
            defaults=event_data
        )
        
        if created:
            print(f"   ✅ Event created successfully!")
        else:
            print(f"   ℹ️ Event already exists, updating...")
            for key, value in event_data.items():
                setattr(event, key, value)
            event.save()
            print(f"   ✅ Event updated!")
        
        # Print event details
        print("\n" + "=" * 60)
        print("📊 EVENT DETAILS")
        print("=" * 60)
        print(f"ID: {event.id}")
        print(f"Title: {event.title}")
        print(f"Type: {event.get_event_type_display()}")
        print(f"Category: {event.category.category_name}")
        print(f"Department: {event.department.department_name}")
        print(f"Date: {event.event_date.strftime('%B %d, %Y')}")
        print(f"Time: {event.start_time.strftime('%H:%M')} - {event.end_time.strftime('%H:%M')}")
        print(f"Venue: {event.venue.venue_name} (Capacity: {event.venue.capacity})")
        print(f"Max Registrations: {event.max_capacity}")
        print(f"Status: {event.get_status_display()}")
        print(f"Registration Deadline: {event.registration_deadline.strftime('%B %d, %Y')}")
        print(f"Created by: {event.created_by.full_name}")
        print(f"Created at: {event.created_at}")
        print("\n" + "=" * 60)
        print("✅ Tournament event created successfully!")
        print("=" * 60)
        print("\n🌐 Access event at: http://localhost:3000/events")
        print("⚙️ Manage at: http://localhost:8000/admin/events/event/")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error creating event: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    create_tournament_event()
