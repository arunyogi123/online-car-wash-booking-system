from django.urls import path
from .views import BookingView,BookingManage,BookedSlotsView

urlpatterns=[
    path("view/",BookingView.as_view(),name="get-post"),
    path("manage/<int:id>/",BookingManage.as_view(),name="update-delete"),
    path("booked-slots/",BookedSlotsView.as_view(),name="booked-slots"),

]