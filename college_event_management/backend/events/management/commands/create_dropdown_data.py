from django.core.management.base import BaseCommand
from events.models import Category, Venue
from users.models import Department


class Command(BaseCommand):
    help = 'Create basic dropdown data for admin forms'

    def handle(self, *args, **options):
        # Create categories
        categories = [
            {'category_name': 'Technical', 'description': 'Technical workshops and events'},
            {'category_name': 'Cultural', 'description': 'Cultural events and festivals'},
            {'category_name': 'Sports', 'description': 'Sports competitions and activities'},
            {'category_name': 'Academic', 'description': 'Academic seminars and conferences'},
        ]

        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                category_name=cat_data['category_name'],
                defaults={'description': cat_data['description']}
            )
            status = "created" if created else "exists"
            self.stdout.write(f'Category {category.category_name}: {status}')

        # Create venues
        venues = [
            {'venue_name': 'Main Auditorium', 'location': 'Main Building', 'capacity': 500, 'has_projector': True, 'has_sound_system': True},
            {'venue_name': 'Conference Hall', 'location': 'Admin Block', 'capacity': 100, 'has_projector': True, 'has_sound_system': True},
            {'venue_name': 'Sports Ground', 'location': 'Sports Complex', 'capacity': 1000, 'has_projector': False, 'has_sound_system': False},
            {'venue_name': 'Lab 1', 'location': 'CS Department', 'capacity': 50, 'has_projector': True, 'has_sound_system': False},
        ]

        for venue_data in venues:
            venue, created = Venue.objects.get_or_create(
                venue_name=venue_data['venue_name'],
                defaults=venue_data
            )
            status = "created" if created else "exists"
            self.stdout.write(f'Venue {venue.venue_name}: {status}')

        # Create departments if they don't exist
        departments = [
            {'department_name': 'Computer Science', 'department_code': 'CSE'},
            {'department_name': 'Electronics', 'department_code': 'ECE'},
            {'department_name': 'Mechanical', 'department_code': 'ME'},
            {'department_name': 'Civil', 'department_code': 'CE'},
        ]

        for dept_data in departments:
            dept, created = Department.objects.get_or_create(
                department_code=dept_data['department_code'],
                defaults={'department_name': dept_data['department_name']}
            )
            status = "created" if created else "exists"
            self.stdout.write(f'Department {dept.department_name}: {status}')

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
