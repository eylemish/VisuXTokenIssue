from django.db import models

# Create your models here.
class UploadedFile(models.Model):
    # 保存文件信息
    name = models.CharField(max_length=255)  # Name of data set
    features = models.JSONField(default=list)  # Store column names, e.g. [‘age’, ‘salary’, ‘city’].
    records = models.JSONField(default=list)  # Store data, e.g. [{‘age’: 25, ‘salary’: 50000}]

    @property
    def df(self):
        # 将 records 转换为 pandas DataFrame
        return pd.DataFrame(self.records)

    def __str__(self):
        return self.name

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

    tool_type = models.CharField(max_length=50, choices=TOOL_TYPES, default="")
    timestamp = models.DateTimeField(auto_now_add=True)
    params = models.JSONField(default=dict)
    is_reverted = models.BooleanField(default=False)
    uploaded_file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='audit_logs')


    def revert(self):
        self.is_reverted = True
        self.save()

from django.db import models
import pandas as pd

class Dataset(models.Model):
    name = models.CharField(max_length=255)  # Name of data set
    features = models.JSONField(default=list)  # Store column names, e.g. ['age', 'salary', 'city']
    records = models.JSONField(default=list)  # Store data, e.g. [{'age': 25, 'salary': 50000}]

    last_dataset = models.OneToOneField(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="next"
    )
    next_dataset = models.OneToOneField(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="prev"
    )

    def __str__(self):
        return self.name

    def get_dataframe(self):
        """
        Convert records to a Pandas DataFrame safely
        """
        if not isinstance(self.records, list) or not all(isinstance(row, dict) for row in self.records):
            print("❌ Error: Invalid records format!")
            return pd.DataFrame()  # Return empty DataFrame to avoid errors

        df = pd.DataFrame(self.records)

        # ✅ Ensure features exist in DataFrame
        if self.features and all(col in df.columns for col in self.features):
            return df[self.features]
        return df


"""
class CSVFile(models.Model):
    name = models.CharField(max_length=255, default="") 
    uploaded_at = models.DateTimeField(auto_now_add=True)

class CSVRow(models.Model):
    file = models.ForeignKey(CSVFile, on_delete=models.CASCADE)
    data = models.JSONField()
"""
