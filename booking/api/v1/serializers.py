from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from booking.models import Booking
from datetime import time


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"
        validators = [
            UniqueTogetherValidator(
                queryset=Booking.objects.all(),
                fields=["booking_date", "booking_time"],
                message="This time slot is already booked."
            )
        ]
    def validate(self, attrs):
            booking_time = attrs["booking_time"]

            opening_time = time(6, 0)    
            closing_time = time(18, 0)  

            if booking_time < opening_time or booking_time > closing_time:
                raise serializers.ValidationError(
                    {
                        "booking_time": "Booking is available only between 6 AM and 6 PM."
                    }
                )

            return attrs