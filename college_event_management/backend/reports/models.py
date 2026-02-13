from django.contrib.auth import get_user_model
from django.db import models
from events.models import Event

User = get_user_model()


class EventFeedback(models.Model):
    """Feedback from participants about events"""
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Fair'),
        (3, 'Good'),
        (4, 'Very Good'),
        (5, 'Excellent'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedback_records')
    participant = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'participant'}, related_name='event_feedback')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comments = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Event Feedback'
        verbose_name_plural = 'Event Feedback'
        unique_together = ('event', 'participant')
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['event', 'rating']),
            models.Index(fields=['participant', 'submitted_at']),
        ]

    def __str__(self):
        return f"{self.participant.get_full_name()} - {self.event.title} ({self.rating} stars)"
