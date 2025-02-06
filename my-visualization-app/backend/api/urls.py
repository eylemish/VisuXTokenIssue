from django.urls import path
from .views import DataVisualizationView, UploadView, AddDataView

urlpatterns = [
    path('visualize/', DataVisualizationView.as_view(), name='visualize'),
    path('upload/', UploadView.as_view(), name='upload'),
    path("add_data/", AddDataView.as_view(), name = "add_data")

]
