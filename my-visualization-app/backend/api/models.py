from django.db import models
import pandas as pd


### **Stores uploaded file information (only the file path is recorded, no data is stored)**
class UploadedFile(models.Model):
    name = models.CharField(max_length=255)  # Name of the document
    file_path = models.CharField(max_length=500)  # file path
    file_type = models.CharField(max_length=10, choices=[("csv", "CSV"), ("xlsx", "Excel")])  # Document type
    uploaded_at = models.DateTimeField(auto_now_add=True)  # Upload time

    def __str__(self):
        return self.name

###
###需要加上id之后才能找得到 dataset_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
###然后last_dataset移到log部分
###这里需要有的是表明父子关系的parent
###parent= models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="child")
###is_deleted = models.BooleanField(default=False) 删掉之后改成true
###def get_all_replicas(self):
        ###"""✅ 获取所有子副本"""
        ###return self.child_replicas.filter(is_deleted=False)
    ###def get_all_descendant_replicas(self):
        ###"""✅ 递归获取所有子孙副本"""
        ###descendants = list(self.child_replicas.filter(is_deleted=False))
        ###for child in self.child_replicas.filter(is_deleted=False):
            ###descendants.extend(child.get_all_descendant_replicas())
        ###return descendants

### **Parsed dataset (store table headers & data)**
class Dataset(models.Model):
    name = models.CharField(max_length=255)  # dataset name
    uploaded_file = models.OneToOneField(UploadedFile, on_delete=models.CASCADE, null=True, blank=True, related_name="dataset")  # Associated Upload Files
    features = models.JSONField(default=list)  # Column names, e.g. [‘age’, ‘salary’, ‘city’]
    records = models.JSONField(default=list)  # Data, e.g. [{‘age’: 25, ‘salary’: 50000}]

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
        Securely convert records to Pandas DataFrame
        """
        if not isinstance(self.records, list) or not all(isinstance(row, dict) for row in self.records):
            print("Error: Invalid records format!")
            return pd.DataFrame()  # Avoid reporting errors by returning an empty DataFrame

        df = pd.DataFrame(self.records)

        # Ensure that the DataFrame contains the fields from features.
        if self.features and all(col in df.columns for col in self.features):
            return df[self.features]
        return df

    def copy_dataset(self, new_name=None):
        """
        Create a copy of the current Dataset and establish the relationship 
        between last_dataset and next_dataset.
        """
        if not new_name:
            new_name = f"{self.name}_copy"

        # Create a new dataset instance
        new_dataset = Dataset.objects.create(
            name=new_name,
            uploaded_file=self.uploaded_file,  # Copy the reference to the uploaded file
            features=self.features,  # Copy the feature list
            records=self.records,  # Copy the data records
            last_dataset=self  # Set the new dataset's last_dataset to the current dataset
        )

        # Update the current dataset's next_dataset to point to the new dataset
        self.next_dataset = new_dataset
        self.save(update_fields=["next_dataset"])

        return new_dataset


### **Recording the results of data analysis**
class AnalysisResult(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, null=True, blank=True)  # Allowed to be empty to avoid migration errors
    columns = models.JSONField()  # Listing information
    shape = models.CharField(max_length=50)  # Shape information
    missing_values = models.JSONField()  # Missing value statistics
    mean_values = models.JSONField()  # Mean value statistics
    created_at = models.DateTimeField(auto_now_add=True)  # Record analysis time

###log也需要加上id
###log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
###last next 移到这里

### **operating log**
class AuditLog(models.Model):
    tool_type = models.CharField(max_length=50, choices=[
        ('ADD_FEATURE', 'Add Feature'),
        ('DELETE_FEATURE', 'Delete Feature'),
        ('PCA', 'PCA'),
        ('TSNE', 't-SNE'),
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
    ], default="")

    timestamp = models.DateTimeField(auto_now_add=True)
    params = models.JSONField(null=True, blank=True, default=dict)  # Allow `NULL` to avoid migration failures
    is_reverted = models.BooleanField(default=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs', default=None)

    def revert(self):
        self.is_reverted = True
        self.save()

