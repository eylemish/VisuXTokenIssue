from django.urls import path
from .views import DataVisualizationView

urlpatterns = [
    path('visualize/', DataVisualizationView.as_view(), name='visualize'),
]
