
from rest_framework import serializers
from booking.models import Booking
from datetime import time, datetime, timedelta


class BookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking

        fields = [
            "id",
            "customer",
            "service",
            "car_model",
            "car_number_plate",
            "booking_date",
            "booking_time",
            "payment_status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "payment_status",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        booking_date = attrs.get(
            "booking_date",
            self.instance.booking_date if self.instance else None
        )

        booking_time = attrs.get(
            "booking_time",
            self.instance.booking_time if self.instance else None
        )

        # Allow bookings only between 6 AM and 6 PM
        if booking_time < time(6, 0) or booking_time > time(18, 0):
            raise serializers.ValidationError({
                "booking_time": "Booking is available only between 6 AM and 6 PM."
            })

        # Get bookings for the same date
        bookings = Booking.objects.filter(
                booking_date=booking_date,
                service=attrs.get("service", self.instance.service if self.instance else None)
            )

        # Ignore the current booking when updating
        if self.instance:
            bookings = bookings.exclude(id=self.instance.id)

        # Check the 30-minute gap
        new_time = datetime.combine(booking_date, booking_time)

        for booking in bookings:
            old_time = datetime.combine(
                booking.booking_date, booking.booking_time
            )

            if abs(new_time - old_time) < timedelta(minutes=30):
                raise serializers.ValidationError({
                    "booking_time": "Please keep at least 30 minutes between bookings."
                })

        return attrs


class BookedSlotSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(
        source="service.service_name",
        read_only=True
    )

    class Meta:
        model = Booking
        fields = ["booking_date", "booking_time", "service_name"]
