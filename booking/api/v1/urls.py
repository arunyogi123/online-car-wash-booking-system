from django.urls import path
from .views import BookingView

urlpatterns=[
    path("view/",BookingView.as_view(),name="get-post")
   
]