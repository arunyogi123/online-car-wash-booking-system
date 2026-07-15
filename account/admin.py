from django.contrib import admin
from .models import User,Profile

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display=("email","username")
    search_fields=['email','phone_no']
    list_filter = ("is_staff", "is_superuser", "is_active")

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display=("full_name","user")
    search_fields=['full_name','user__email']
