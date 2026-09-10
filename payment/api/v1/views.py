from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import render

from payment.utils import KhaltiPay
from booking.models import Booking


@extend_schema(tags=["Payment"])
@api_view(["GET"])
def get_payment_url_by_id(request, id):

    booking = Booking.objects.get(
        id=id,
        customer=request.user
    )

    if booking.payment_status == "SUCCESS":
        return Response(
            {"message": "Booking already paid."},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = KhaltiPay.get_initial_id(
        order_id=booking.id,
        order_name=f"BOOKING-{booking.id}",
        amount=int(booking.service.price * 100),
        name=booking.customer.username,
        phone=booking.customer.phone_no,
        service=booking.service,
    )

    return Response({
        "message": "Payment initiated successfully.",
        "payment_url": data.get("payment_url"),
        "pidx": data.get("pidx"),
    })


@extend_schema(tags=["Payment"])
@api_view(["GET"])
def payment_callback(request):

    pidx = request.GET.get("pidx")
    booking_id = request.GET.get("purchase_order_id")
    payment_status = request.GET.get("status")

    booking = Booking.objects.get(id=booking_id)

    # User cancelled payment
    if payment_status == "User canceled":

        booking.payment_status = "CANCELLED"
        booking.save()

        return render(
            request,
            "payment/index.html",
            {
                "status": "cancelled",
                "booking": booking,
                "amount": booking.service.price,
                "transaction_id": pidx,
            }
        )

    # Payment ID missing
    if not pidx:

        booking.payment_status = "FAILURE"
        booking.save()

        return render(
            request,
            "payment/index.html",
            {
                "status": "failed",
                "booking": booking,
                "message": "Payment ID not found.",
            }
        )

    # Verify payment
    data = KhaltiPay.verify_payment(pidx)

    # Payment successful
    if data.get("status") == "Completed":

        booking.payment_status = "SUCCESS"
        booking.save()

        return render(
            request,
            "payment/index.html",
            {
                "status": "success",
                "booking": booking,
                "amount": booking.service.price,
                "transaction_id": pidx,
            }
        )

    # Payment failed
    booking.payment_status = "FAILURE"
    booking.save()

    return render(
        request,
        "payment/index.html",
        {
            "status": "failed",
            "booking": booking,
            "amount": booking.service.price,
            "transaction_id": pidx,
            "message": "Payment failed.",
        }
    )