from django.urls import path
from .views import ServiceView,ServiceManage

urlpatterns=[
    path("service/",ServiceView.as_view(),name="get-post-service"),
    path("manage/<int:id>/",ServiceManage.as_view(),name="update-manage"),
]