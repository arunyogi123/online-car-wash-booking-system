from rest_framework import serializers
from services.models import Services

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model=Services
        fields= "__all__"



