from django.db import models
import pandas as pd


### **📌 存储上传文件信息（只记录文件路径，不存数据）**
class UploadedFile(models.Model):
    name = models.CharField(max_length=255)  # 文件名称
    file_path = models.CharField(max_length=500)  # 文件路径
    file_type = models.CharField(max_length=10, choices=[("csv", "CSV"), ("xlsx", "Excel")])  # 文件类型
    uploaded_at = models.DateTimeField(auto_now_add=True)  # 上传时间

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

### **📌 解析后的数据集（存储表头 & 数据）**
class Dataset(models.Model):
    name = models.CharField(max_length=255)  # 数据集名称
    uploaded_file = models.OneToOneField(UploadedFile, on_delete=models.CASCADE, null=True, blank=True, related_name="dataset")  # 关联上传文件
    features = models.JSONField(default=list)  # 列名，如 ['age', 'salary', 'city']
    records = models.JSONField(default=list)  # 数据，如 [{'age': 25, 'salary': 50000}]

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
        安全地将 records 转换为 Pandas DataFrame
        """
        if not isinstance(self.records, list) or not all(isinstance(row, dict) for row in self.records):
            print("❌ Error: Invalid records format!")
            return pd.DataFrame()  # 避免报错，返回空 DataFrame

        df = pd.DataFrame(self.records)

        # ✅ 确保 DataFrame 里包含 features 里的字段
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


### **📌 记录数据分析结果**
class AnalysisResult(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, null=True, blank=True)  # 允许为空，避免迁移错误
    columns = models.JSONField()  # 列名信息
    shape = models.CharField(max_length=50)  # 形状信息
    missing_values = models.JSONField()  # 缺失值统计
    mean_values = models.JSONField()  # 平均值统计
    created_at = models.DateTimeField(auto_now_add=True)  # 记录分析时间

###log也需要加上id
###log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
###last next 移到这里

### **📌 操作日志**
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
    params = models.JSONField(null=True, blank=True, default=dict)  # ✅ 允许 `NULL`，避免迁移失败
    is_reverted = models.BooleanField(default=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs', default=None)

    def revert(self):
        self.is_reverted = True
        self.save()

