import io

import pandas as pd
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date, parse_time
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, Department, Event, Venue
from .serializers import EventSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for the Category model - read-only for dropdown options"""
    queryset = Category.objects.all()
    serializer_class = EventSerializer  # Temporary, will create proper serializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        categories = Category.objects.all().values('id', 'category_name')
        return Response(list(categories))


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for the Venue model - read-only for dropdown options"""
    queryset = Venue.objects.all()
    serializer_class = EventSerializer  # Temporary, will create proper serializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        venues = Venue.objects.all().values('id', 'venue_name', 'location')
        return Response(list(venues))


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for the Department model - read-only for dropdown options"""
    queryset = Department.objects.all()
    serializer_class = EventSerializer  # Temporary, will create proper serializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        departments = Department.objects.all().values('id', 'department_name')
        return Response(list(departments))


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'admin':
                return Event.objects.all()
            elif user.role == 'organizer':
                # Organizers can see all events (including drafts)
                return Event.objects.all()
            else:  # participant
                # Participants can see published, ongoing, and completed events
                return Event.objects.filter(status__in=['published', 'ongoing', 'completed'])
        else:
            # Anonymous users can only see published and ongoing events
            return Event.objects.filter(status__in=['published', 'ongoing'])

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'create']:
            return [IsAuthenticated()]
        # Allow anyone to list and retrieve
        return [AllowAny()]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if user.role == 'organizer' and instance.created_by != user:
            return Response({'error': 'You can only edit your own events'}, status=status.HTTP_403_FORBIDDEN)
        if user.role == 'organizer' and instance.status not in ['draft', 'published']:
            return Response({'error': 'You can only edit draft/published events'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if user.role == 'organizer' and instance.created_by != user:
            return Response({'error': 'You can only delete your own events'}, status=status.HTTP_403_FORBIDDEN)
        if user.role == 'organizer' and instance.status not in ['draft', 'published']:
            return Response({'error': 'You can only delete draft/published events'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def publish(self, request, pk=None):
        event = get_object_or_404(Event, pk=pk)
        if request.user.role == 'admin' or (request.user.role == 'organizer' and event.created_by == request.user):
            event.status = 'published'
            event.save()
            return Response({'message': 'Event published'})
        return Response({'error': 'You can only publish your own events'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        event = get_object_or_404(Event, pk=pk)
        if request.user.role == 'admin' or (request.user.role == 'organizer' and event.created_by == request.user):
            event.status = 'cancelled'
            event.save()
            return Response({'message': 'Event cancelled'})
        return Response({'error': 'You can only cancel your own events'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_upload(self, request):
        """Bulk upload events from CSV or Excel file"""
        if request.user.role not in ['admin', 'organizer']:
            return Response({'error': 'Only admins and organizers can bulk upload events'}, status=status.HTTP_403_FORBIDDEN)
        
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        try:
            # Read file based on extension
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file)
            else:
                return Response({'error': 'Unsupported file format. Please upload CSV or Excel file'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate required columns
            required_columns = ['title', 'description', 'event_date', 'start_time', 'end_time', 'venue', 'department', 'max_capacity']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return Response({
                    'error': f'Missing required columns: {", ".join(missing_columns)}',
                    'required_columns': required_columns
                }, status=status.HTTP_400_BAD_REQUEST)
            
            created_events = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Get related objects
                    venue = Venue.objects.filter(id=int(row['venue'])).first()
                    department = Department.objects.filter(id=int(row['department'])).first()
                    category = None
                    if 'category' in row and pd.notna(row['category']) and row['category']:
                        category = Category.objects.filter(id=int(row['category'])).first()
                    
                    if not venue:
                        errors.append(f"Row {index + 1}: Invalid venue ID")
                        continue
                    
                    if not department:
                        errors.append(f"Row {index + 1}: Invalid department ID")
                        continue
                    
                    # Create event
                    event_data = {
                        'title': row['title'],
                        'description': row['description'],
                        'event_date': parse_date(str(row['event_date'])),
                        'start_time': parse_time(str(row['start_time'])),
                        'end_time': parse_time(str(row['end_time'])),
                        'venue': venue,
                        'department': department,
                        'max_capacity': int(row['max_capacity']),
                        'event_type': row.get('event_type', 'workshop'),
                        'registration_fee': float(row.get('registration_fee', 0)),
                        'status': row.get('status', 'draft'),
                        'created_by': request.user,
                    }
                    
                    if category:
                        event_data['category'] = category
                    
                    if 'registration_deadline' in row and pd.notna(row['registration_deadline']) and row['registration_deadline']:
                        event_data['registration_deadline'] = parse_date(str(row['registration_deadline']))
                    
                    event = Event.objects.create(**event_data)
                    created_events.append(event.title)
                    
                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")
            
            return Response({
                'message': f'Successfully created {len(created_events)} events',
                'created_events': created_events,
                'errors': errors,
                'total_rows': len(df)
            })
            
        except Exception as e:
            return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
