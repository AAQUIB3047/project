from django.contrib import admin

from .models import EventFeedback


@admin.register(EventFeedback)
class EventFeedbackAdmin(admin.ModelAdmin):
    list_display = ('event', 'get_participant_name', 'rating', 'submitted_at')
    list_filter = ('rating', 'event', 'submitted_at')
    search_fields = ('participant__email', 'participant__first_name', 'participant__last_name', 'event__title', 'comments')
    readonly_fields = ('submitted_at', 'updated_at')
    
    fieldsets = (
        ('Feedback Information', {
            'fields': ('event', 'participant')
        }),
        ('Rating & Comments', {
            'fields': ('rating', 'comments')
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_participant_name(self, obj):
        return obj.participant.get_full_name()
    get_participant_name.short_description = 'Participant'
