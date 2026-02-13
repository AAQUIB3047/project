from django.contrib.auth import get_user_model
from django.db import models
from users.models import Department

User = get_user_model()


class Venue(models.Model):
    """Venue model for event locations"""
    venue_name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    capacity = models.PositiveIntegerField()
    facilities = models.TextField(blank=True)  # JSON or text field describing facilities
    has_projector = models.BooleanField(default=False)
    has_sound_system = models.BooleanField(default=False)
    AVAILABILITY_CHOICES = [
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('maintenance', 'Under Maintenance'),
    ]
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Venue'
        verbose_name_plural = 'Venues'
        ordering = ['venue_name']

    def __str__(self):
        return f"{self.venue_name} (Capacity: {self.capacity})"


class Category(models.Model):
    """Event category model"""
    category_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)  # Unicode emoji or icon name
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['category_name']

    def __str__(self):
        return self.category_name


class Event(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    EVENT_TYPE_CHOICES = [
        ('workshop', 'Workshop'),
        ('seminar', 'Seminar'),
        ('conference', 'Conference'),
        ('competition', 'Competition'),
        ('cultural', 'Cultural Event'),
        ('sports', 'Sports Event'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, related_name='events')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='organized_events')
    max_capacity = models.PositiveIntegerField()
    current_registrations = models.PositiveIntegerField(default=0)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    registration_deadline = models.DateField(null=True, blank=True)
    poster_image = models.ImageField(upload_to='event_posters/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['-event_date']
        indexes = [
            models.Index(fields=['event_date', 'status']),
            models.Index(fields=['department', 'status']),
        ]

    def __str__(self):
        return self.title

    @property
    def registered_count(self):
        return self.registrations.filter(status='confirmed').count()

    @property
    def is_full(self):
        return self.registered_count >= self.max_capacity


class EventCoordinator(models.Model):
    """Faculty coordinators assigned to events"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='coordinators')
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'faculty'}, related_name='coordinated_events')
    role = models.CharField(max_length=100, default='Coordinator')
    assigned_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Event Coordinator'
        verbose_name_plural = 'Event Coordinators'
        unique_together = ('event', 'faculty')

    def __str__(self):
        return f"{self.faculty.get_full_name()} - {self.event.title}"


class EventResource(models.Model):
    """Resources required for events"""
    RESOURCE_TYPES = [
        ('equipment', 'Equipment'),
        ('furniture', 'Furniture'),
        ('material', 'Material'),
        ('transport', 'Transport'),
        ('catering', 'Catering'),
        ('other', 'Other'),
    ]
    
    RESOURCE_STATUS = [
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('in_use', 'In Use'),
        ('damaged', 'Damaged'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPES)
    resource_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=RESOURCE_STATUS, default='available')
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Event Resource'
        verbose_name_plural = 'Event Resources'

    def __str__(self):
        return f"{self.resource_name} ({self.resource_type})"
