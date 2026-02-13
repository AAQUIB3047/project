from django.contrib.auth.models import AbstractUser
from django.db import models


class Department(models.Model):
    """Department model for organizing students and faculty"""
    department_name = models.CharField(max_length=200, unique=True)
    department_code = models.CharField(max_length=50, unique=True)
    head_of_department = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
        ordering = ['department_name']

    def __str__(self):
        return f"{self.department_name} ({self.department_code})"


class User(AbstractUser):
    ROLE_CHOICES = [
        ('participant', 'Participant'),
        ('organizer', 'Event Organizer'),
    ]
    
    BRANCH_CHOICES = [
        ('cse', 'Computer Science & Engineering'),
        ('ece', 'Electronics & Communication'),
        ('eee', 'Electrical & Electronics'),
        ('me', 'Mechanical Engineering'),
        ('ce', 'Civil Engineering'),
        ('it', 'Information Technology'),
        ('other', 'Other'),
    ]
    
    role = models.CharField(max_length=12, choices=ROLE_CHOICES, default='participant')
    phone_number = models.CharField(max_length=15, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    branch = models.CharField(max_length=20, choices=BRANCH_CHOICES, default='other', blank=True)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_google_user = models.BooleanField(default=False)
    profile_picture = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class Student(models.Model):
    """Student model for detailed student information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=50, unique=True)
    year = models.IntegerField(choices=[(1, 'First Year'), (2, 'Second Year'), (3, 'Third Year'), (4, 'Fourth Year')], default=1)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='students')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        ordering = ['roll_number']

    def __str__(self):
        return f"{self.roll_number} - {self.user.get_full_name()}"


class Faculty(models.Model):
    """Faculty model for faculty information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    designation = models.CharField(max_length=200)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='faculty')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Faculty'
        verbose_name_plural = 'Faculty'
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()} ({self.designation})"


class AuditLog(models.Model):
    """Audit log for tracking organizer actions"""
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]
    
    organizer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'organizer'}, related_name='audit_logs_created')
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=100)  # e.g., 'Event', 'Participant', 'Registration'
    entity_id = models.IntegerField()
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-timestamp']
        indexes = [models.Index(fields=['entity_type', 'entity_id'])]

    def __str__(self):
        return f"{self.organizer} - {self.action_type} on {self.entity_type} ({self.entity_id})"


class GoogleAuth(models.Model):
    """Google OAuth authentication model for storing Google auth credentials"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_auth')
    google_id = models.CharField(max_length=255, unique=True)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    id_token = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Google Auth'
        verbose_name_plural = 'Google Auths'
        ordering = ['-created_at']

    def __str__(self):
        return f"Google Auth for {self.user.email}"


class Session(models.Model):
    """Session model for tracking user sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_token = models.CharField(max_length=500, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Session'
        verbose_name_plural = 'Sessions'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['session_token']), models.Index(fields=['user', 'is_active'])]

    def __str__(self):
        return f"Session for {self.user.email} ({self.session_token[:20]}...)"
