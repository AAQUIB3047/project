# Generated manually for field rename and data migration

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_googleauth_session'),
    ]

    operations = [
        # Rename admin field to organizer in AuditLog
        migrations.RenameField(
            model_name='auditlog',
            old_name='admin',
            new_name='organizer',
        ),
        # Update the limit_choices_to for the organizer field
        migrations.AlterField(
            model_name='auditlog',
            name='organizer',
            field=models.ForeignKey(
                limit_choices_to={'role': 'organizer'},
                on_delete=django.db.models.deletion.SET_NULL,
                null=True,
                related_name='audit_logs_created',
                to='users.user'
            ),
        ),
    ]
