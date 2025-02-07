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
    TOOL_TYPES = [
        ('ADD_FEATURE', 'Add Feature'),
        ('DELETE_FEATURE', 'Delete Feature'),
        ('PCA', 'PCA'),
        ('TSNE', 't-sne'),
        ('UMAP', 'UMAP'),
        ('LINEAR_CURVEFITTING', 'Linear Curve Fitting'),
        ('POLYNOMIAL_CURVEFITTING', 'Polynomial Curve Fitting'),
        ('EXPONENTIAL_CURVEFITTING', 'Exponential Curve Fitting'),
        ('LINEAR_INTERPOLATION', 'Linear Interpolation'),
        ('POLYNOMIAL_INTERPOLATION', 'Polynomial Interpolation'),
        ('SPLINE_INTERPOLATION', 'Spline Interpolation'),
        ('LINEAR_EXTRAPOLATION', 'Linear Extrapolation'),
        ('POLYNOMIAL_EXTRAPOLATION', 'Polynomial Extrapolation'),
        ('EXPONENTIAL_EXTRAPOLATION', 'Exponential Extrapolation'),
        ('PEARSON_CORRELATION', 'Pearson correlation'),
        ('SPEARMAN_CORRELATION', 'Spearman correlation'),
        ('KENDALL_CORRELATION', 'Kendall correlation'),
        ('DATA_OVERSAMPLE', 'Data Oversample')
    ]

    tool_type = models.CharField(max_length=50, choices=TOOL_TYPES)
    timestamp = models.DateTimeField(default=now)
    params = models.CharField(max_length=50)
    is_reverted = models.BooleanField(default=False)

    def revert(self):
        self.is_reverted = True
        self.save()

class CSVFile(models.Model):
    name = models.CharField(max_length=255) 
    uploaded_at = models.DateTimeField(auto_now_add=True)

class CSVRow(models.Model):
    file = models.ForeignKey(CSVFile, on_delete=models.CASCADE)
    data = models.JSONField()
