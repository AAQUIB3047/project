from rest_framework import serializers

from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    participant_name = serializers.CharField(source='participant.get_full_name', read_only=True)
    participant_email = serializers.CharField(source='participant.email', read_only=True)
    participant_roll = serializers.CharField(source='participant.username', read_only=True)
    
    class Meta:
        model = Registration
        fields = [
            'id', 'event', 'event_title', 'participant', 'participant_name', 'participant_email',
            'participant_roll', 'registration_time', 'status', 'payment_status', 
            'transaction_id', 'attended', 'updated_at'
        ]
        read_only_fields = ['id', 'registration_time', 'updated_at']
