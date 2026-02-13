# Generated migration to update reports from student to participant

import django.db.models.deletion
from django.db import migrations, models


def migrate_student_to_participant(apps, schema_editor):
    """Migrate data and rename field from student to participant"""
    EventFeedback = apps.get_model('reports', 'EventFeedback')
    
    # Copy data from student to participant
    for feedback in EventFeedback.objects.all():
        if feedback.student_id:
            feedback.participant_id = feedback.student_id
            feedback.save()


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0002_initial'),
    ]

    operations = [
        # For SQLite, we need to recreate the table with the new field name
        # Remove old constraints and indexes first
        migrations.AlterUniqueTogether(
            name='eventfeedback',
            unique_together=set(),
        ),
        migrations.RemoveIndex(
            model_name='eventfeedback',
            name='reports_eve_student_e1c7df_idx',
        ),
        # Add the new participant field
        migrations.AddField(
            model_name='eventfeedback',
            name='participant',
            field=models.ForeignKey(
                limit_choices_to={'role': 'participant'},
                on_delete=django.db.models.deletion.CASCADE,
                related_name='event_feedback_new',
                to='users.user',
                null=True,
                blank=True
            ),
        ),
        # Copy data from student to participant
        migrations.RunSQL(
            "UPDATE reports_eventfeedback SET participant_id = student_id",
            reverse_sql="UPDATE reports_eventfeedback SET student_id = participant_id"
        ),
        # Make participant not nullable
        migrations.AlterField(
            model_name='eventfeedback',
            name='participant',
            field=models.ForeignKey(
                limit_choices_to={'role': 'participant'},
                on_delete=django.db.models.deletion.CASCADE,
                related_name='event_feedback',
                to='users.user'
            ),
        ),
        # Remove the old student field
        migrations.RemoveField(
            model_name='eventfeedback',
            name='student',
        ),
        # Add new constraints and indexes
        migrations.AlterUniqueTogether(
            name='eventfeedback',
            unique_together={('event', 'participant')},
        ),
        migrations.AddIndex(
            model_name='eventfeedback',
            index=models.Index(fields=['participant', 'submitted_at'], name='reports_eve_participant_'),
        ),
    ]
