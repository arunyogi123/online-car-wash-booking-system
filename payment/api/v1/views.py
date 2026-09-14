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
    #if booking is already paid raise error
    if booking.payment_status == "SUCCESS":
        return Response(
            {"message": "Booking already paid."},
            status=status.HTTP_400_BAD_REQUEST
        )
    #call khalti to start a payment 
    data = KhaltiPay.get_initial_id(
        order_id=booking.id,
        #readable name (eg:Boking 42)
        order_name=f"BOOKING-{booking.id}",
        #amount must be in paisa
        amount=int(booking.service.price * 100),
        #customer name 
        name=booking.customer.username,
        #cuatomer phone no
        phone=booking.customer.phone_no,
        #which service being booked
        service=booking.service,
    )

    return Response({
        "message": "Payment initiated successfully.",
        "payment_url": data.get("payment_url"),
        "pidx": data.get("pidx"),
    })


@extend_schema(tags=["Payment"])
@api_view(["GET"])

#khalti redirects
def payment_callback(request):
    #khalti payment id (like. a bill)
    pidx = request.GET.get("pidx")
    #booking id we sent to khalti
    booking_id = request.GET.get("purchase_order_id")
    #Khalti's raw status string (e.g., "User canceled", "Completed").
    payment_status = request.GET.get("status")
    #fetch the booking status from db so we can update 
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