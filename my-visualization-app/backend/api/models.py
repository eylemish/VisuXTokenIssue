from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

# Create your models here.
class UploadedFile(models.Model):
    # Save file information
    name = models.CharField(max_length=255)  # file name
    upload_time = models.DateTimeField(auto_now_add=True)  # upload time
    file_path = models.FileField(upload_to='uploads/')  # file path

class AnalysisResult(models.Model):
    # Save analysis consequense
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE)  # related file
    columns = models.TextField()  # column name, stored in JSON
    shape = models.CharField(max_length=50)  # shape of char
    missing_values = models.TextField()  # Missing value statistics, stored in JSON
    mean_values = models.TextField()  # mean value statisics, stored in JSON
    created_at = models.DateTimeField(auto_now_add=True)  # analysis time

class AuditLog(models.Model):
    # Model for logs, should be corrected after all actions are implemented.
    ACTION_TYPES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('VIEW', 'View'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=10, choices=ACTION_TYPES)
    description = models.TextField()
    timestamp = models.DateTimeField(default=now)
    is_reverted = models.BooleanField(default=False)

    def revert(self):
        self.is_reverted = True
        self.save()