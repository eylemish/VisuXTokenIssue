from django.urls import path
from .views import DataVisualizationView, UploadView

urlpatterns = [
    path('visualize/', DataVisualizationView.as_view(), name='visualize'),
    path("upload/", UploadView.as_view(), name="upload_csv"),
    path("add_data/", AddDataView.as_view(), name = "add_data")
]
