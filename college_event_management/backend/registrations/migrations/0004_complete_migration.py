# Generated migration to rename student to participant and update constraints

import django.db.models.deletion
from django.db import migrations, models


def migrate_student_to_participant(apps, schema_editor):
    """Migrate data and rename field from student to participant"""
    # Since we're using SQLite, we need to recreate the table
    # Let Django handle the field rename and data migration automatically
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('registrations', '0003_update_role_constraint'),
    ]

    operations = [
        # For SQLite, we need to recreate the table with the new field name
        # Remove old constraints and indexes first
        migrations.AlterUniqueTogether(
            name='registration',
            unique_together=set(),
        ),
        migrations.RemoveIndex(
            model_name='registration',
            name='registratio_student_244817_idx',
        ),
        # Add the new participant field
        migrations.AddField(
            model_name='registration',
            name='participant',
            field=models.ForeignKey(
                limit_choices_to={'role': 'participant'},
                on_delete=django.db.models.deletion.CASCADE,
                related_name='event_registrations_new',
                to='users.user',
                null=True,
                blank=True
            ),
        ),
        # Copy data from student to participant
        migrations.RunSQL(
            "UPDATE registrations_registration SET participant_id = student_id",
            reverse_sql="UPDATE registrations_registration SET student_id = participant_id"
        ),
        # Make participant not nullable
        migrations.AlterField(
            model_name='registration',
            name='participant',
            field=models.ForeignKey(
                limit_choices_to={'role': 'participant'},
                on_delete=django.db.models.deletion.CASCADE,
                related_name='event_registrations',
                to='users.user'
            ),
        ),
        # Remove the old student field
        migrations.RemoveField(
            model_name='registration',
            name='student',
        ),
        # Add new constraints and indexes
        migrations.AlterUniqueTogether(
            name='registration',
            unique_together={('event', 'participant')},
        ),
        migrations.AddIndex(
            model_name='registration',
            index=models.Index(fields=['participant', 'status'], name='registratio_participant_'),
        ),
    ]
