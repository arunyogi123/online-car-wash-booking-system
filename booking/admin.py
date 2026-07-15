from django.contrib import admin
from .models import Booking
# Register your models here.

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display=['customer','service','booking_date','car_number_plate']
    search_fields=['car_number_plate']
