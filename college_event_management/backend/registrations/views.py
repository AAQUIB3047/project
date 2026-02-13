from django.shortcuts import get_object_or_404
from django.utils import timezone
from events.models import Event
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Registration
from .serializers import RegistrationSerializer


class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'participant':
            return Registration.objects.filter(participant=user)
        elif user.role == 'organizer':
            return Registration.objects.all()
        return Registration.objects.none()

    def perform_create(self, serializer):
        serializer.save(participant=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def register_event(self, request):
        """Register a participant for an event"""
        if request.user.role != 'participant':
            return Response({'error': 'Only participants can register for events'}, status=status.HTTP_403_FORBIDDEN)

        event_id = request.data.get('event_id')
        if not event_id:
            return Response({'error': 'Event ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(Event, id=event_id)

        # Check if event is published or ongoing
        if event.status not in ['published', 'ongoing']:
            return Response({'error': 'Event is not available for registration'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if registration deadline has passed
        if event.registration_deadline and event.registration_deadline < timezone.now().date():
            return Response({'error': 'Registration deadline has passed'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already registered
        if Registration.objects.filter(event=event, participant=request.user).exists():
            return Response({'error': 'Already registered for this event'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if event is full
        if event.registered_count >= event.max_capacity:
            return Response({'error': 'Event is full'}, status=status.HTTP_400_BAD_REQUEST)

        # Create registration
        registration = Registration.objects.create(
            event=event,
            participant=request.user,
            status='confirmed' if event.registration_fee == 0 else 'pending'
        )

        return Response({
            'message': 'Successfully registered for the event',
            'registration': RegistrationSerializer(registration).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def unregister_event(self, request):
        """Unregister a participant from an event"""
        if request.user.role != 'participant':
            return Response({'error': 'Only participants can unregister from events'}, status=status.HTTP_403_FORBIDDEN)

        event_id = request.data.get('event_id')
        if not event_id:
            return Response({'error': 'Event ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(Event, id=event_id)
        
        try:
            registration = Registration.objects.get(event=event, participant=request.user)
            registration.status = 'cancelled'
            registration.save()
            
            return Response({
                'message': 'Successfully unregistered from the event',
                'registration': RegistrationSerializer(registration).data
            })
        except Registration.DoesNotExist:
            return Response({'error': 'Not registered for this event'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_registrations(self, request):
        """Get current user's registrations"""
        registrations = self.get_queryset()
        serializer = self.get_serializer(registrations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def check_registration(self, request):
        """Check if user is registered for a specific event"""
        event_id = request.query_params.get('event_id')
        if not event_id:
            return Response({'error': 'Event ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(Event, id=event_id)
        registration = Registration.objects.filter(event=event, participant=request.user).first()

        if registration:
            return Response({
                'is_registered': True,
                'registration': RegistrationSerializer(registration).data
            })
        else:
            return Response({
                'is_registered': False,
                'registration': None
            })
