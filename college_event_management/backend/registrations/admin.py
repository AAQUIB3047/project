from django.contrib import admin

from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('event', 'get_participant_name', 'status', 'payment_status', 'attended', 'registration_time')
    list_filter = ('status', 'payment_status', 'attended', 'registration_time', 'event')
    search_fields = ('participant__email', 'participant__first_name', 'participant__last_name', 'event__title')
    readonly_fields = ('registration_time', 'updated_at')
    
    fieldsets = (
        ('Registration Information', {
            'fields': ('event', 'participant')
        }),
        ('Status', {
            'fields': ('status', 'attended')
        }),
        ('Payment', {
            'fields': ('payment_status', 'transaction_id')
        }),
        ('Timestamps', {
            'fields': ('registration_time', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_participant_name(self, obj):
        return obj.participant.get_full_name()
    get_participant_name.short_description = 'Participant'
