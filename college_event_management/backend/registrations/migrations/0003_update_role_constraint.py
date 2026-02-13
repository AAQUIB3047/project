# Generated manually to update role constraints from student to participant

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registrations', '0002_initial'),
    ]

    operations = [
        # Update the student field limit_choices_to from 'student' to 'participant'
        migrations.AlterField(
            model_name='registration',
            name='student',
            field=models.ForeignKey(
                limit_choices_to={'role': 'participant'},
                on_delete=django.db.models.deletion.CASCADE,
                related_name='event_registrations',
                to='users.user'
            ),
        ),
    ]
