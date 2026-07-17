from django.urls import path
from .views import BookingView,BookingManage

urlpatterns=[
    path("view/",BookingView.as_view(),name="get-post"),
    path("manage/<int:id>/",BookingManage.as_view(),name="update-delete"),
   
]