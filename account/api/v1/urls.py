from django.urls import path
from .views import RegisterView,ProfileAPIView,LoginView

urlpatterns=[
    path('register/',RegisterView.as_view(),name="register"),
    path("profile/",ProfileAPIView.as_view(),name="profile"),
    path("login/",LoginView.as_view(),name="login")
]