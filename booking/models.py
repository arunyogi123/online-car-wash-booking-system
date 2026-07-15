from django.db import models
from account.models import User
from services.models import Services
# Create your models here.
class PaymentStatus(models.TextChoices):
    PENDING="PENDING"
    SUCCESS="SUCCESS"
    FAILURE="FAILURE"

class Booking(models.Model):
    customer=models.ForeignKey(User,on_delete=models.CASCADE)
    service=models.ForeignKey(Services,on_delete=models.CASCADE)
    car_model=models.CharField(max_length=25)
    car_number_plate=models.CharField(max_length=20)
    booking_date=models.DateField()
    booking_time=models.TimeField()
    payment_status=models.CharField(max_length=20,choices=PaymentStatus.choices,default=PaymentStatus.PENDING)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer}-{self.car_model}"


