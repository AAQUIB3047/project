from rest_framework import serializers

from .models import Category, Event, EventCoordinator, EventResource, Venue


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ['id', 'venue_name', 'location', 'capacity', 'facilities', 'has_projector', 'has_sound_system', 'availability_status']
        read_only_fields = ['id']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name', 'description', 'icon']
        read_only_fields = ['id']


class EventCoordinatorSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.get_full_name', read_only=True)
    
    class Meta:
        model = EventCoordinator
        fields = ['id', 'event', 'faculty', 'faculty_name', 'role', 'assigned_date']
        read_only_fields = ['id', 'assigned_date']


class EventResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventResource
        fields = ['id', 'event', 'resource_type', 'resource_name', 'quantity', 'status', 'cost']
        read_only_fields = ['id']


class EventSerializer(serializers.ModelSerializer):
    venue_details = VenueSerializer(source='venue', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    registration_count = serializers.SerializerMethodField()
    coordinators = EventCoordinatorSerializer(many=True, read_only=True)
    resources = EventResourceSerializer(many=True, read_only=True)
    poster_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_date', 'start_time', 'end_time',
            'venue', 'venue_details', 'category', 'category_details', 'department',
            'department_name', 'max_capacity', 'current_registrations', 'registration_count',
            'event_type', 'status', 'registration_fee', 'registration_deadline',
            'poster_image', 'poster_image_url', 'created_by', 'created_by_name', 'created_at', 'updated_at',
            'coordinators', 'resources'
        ]
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'registration_count', 'poster_image_url')
    
    def get_registration_count(self, obj):
        """Get count of confirmed registrations"""
        return obj.registrations.filter(status='confirmed').count()
    
    def get_poster_image_url(self, obj):
        """Get full URL for poster image"""
        if obj.poster_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster_image.url)
            return obj.poster_image.url
        return None
