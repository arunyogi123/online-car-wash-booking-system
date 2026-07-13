from django.urls import path
from .views import ServiceView

urlpatterns=[
    path("service/",ServiceView.as_view(),name="get-post-service")
]