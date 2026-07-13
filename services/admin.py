from django.contrib import admin
from .models import Services,TimeSlot

@admin.register(Services)
class ServicesAdmin(admin.ModelAdmin):
    list_display = ['service_name', 'price', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['service_name']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display=['start_time','end_time']
    list_filter=['status']
