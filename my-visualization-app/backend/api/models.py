from django.db import models

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
