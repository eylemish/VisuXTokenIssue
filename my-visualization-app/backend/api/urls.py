from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import DataVisualizationView, UploadView, AddDataView

urlpatterns = [
    path('visualize/', DataVisualizationView.as_view(), name='visualize'),
    path("upload/", csrf_exempt(UploadView.as_view()), name="upload_csv"),
    path("add_data/", AddDataView.as_view(), name = "add_data")

]
