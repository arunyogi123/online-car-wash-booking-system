from django.db import models

# Create your models here.
class ServiceType(models.TextChoices):
    BASIC="BASIC"
    PREMIUM="PREMIUM"
    STANDARD="STANDARD"

class StatusChoices(models.TextChoices):
    ACTIVE="ACTIVE"
    INACTIVE="INACTIVE"

class Services(models.Model):
    service_name=models.CharField(max_length=30,choices=ServiceType.choices,default=ServiceType.BASIC)
    description=models.TextField()
    price=models.DecimalField(max_digits=8,decimal_places=2)
    status=models.CharField(max_length=20,choices=StatusChoices.choices,default=StatusChoices.ACTIVE)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.service_name
    

class TimeSlot(models.Model):
    start_time=models.TimeField()
    end_time=models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE)

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"

