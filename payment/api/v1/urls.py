from django.urls import path
from .views import get_payment_url_by_id, payment_callback

urlpatterns = [
    path("<int:id>/", get_payment_url_by_id, name="payment"),
    path("callback/", payment_callback, name="payment_callback"),
]