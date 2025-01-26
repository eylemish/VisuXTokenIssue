from django.db import models

# Create your models here.
class UploadedFile(models.Model):
    # Save file information
    name = models.CharField(max_length=255)  # file name
    upload_time = models.DateTimeField(auto_now_add=True)  # upload time
    file_path = models.FileField(upload_to='uploads/')  # file path
