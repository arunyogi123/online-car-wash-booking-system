from django.contrib import admin
from .models import Services

@admin.register(Services)
class ServicesAdmin(admin.ModelAdmin):
    list_display = ['service_name', 'price', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['service_name']


