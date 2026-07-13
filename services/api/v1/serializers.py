from rest_framework import serializers
from services.models import Services,TimeSlot

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model=Services
        fields= "__all__"

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model=TimeSlot
        fields="__all__"

