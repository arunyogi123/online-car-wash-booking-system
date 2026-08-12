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

    booking = Booking.objects.get(id=id)

    if booking.payment_status == "SUCCESS":
        return Response({
            "message": "Booking already paid! Thank you."
        })

    data = KhaltiPay.get_initial_id(
        order_id=booking.id,
        order_name=f"BOOKING{booking.id}",
        amount=int(booking.service.price * 100),
        name=booking.customer.username,
        phone=booking.customer.phone_no,
        service=booking.service,
    )

    return Response({
        "payment_id": data
    })

@extend_schema(tags=["Payment"])
@api_view(["GET"])
def payment_callback(request):

    pidx = request.GET.get("pidx")
    booking_id = request.GET.get("purchase_order_id")
    status_param = request.GET.get("status")

    booking = Booking.objects.get(id=booking_id)

  
    if status_param and status_param.lower() == "user canceled":

        booking.payment_status = "FAILURE"
        booking.save()

        return render(
            request,
            "payment/index.html",
            {
                "status": "cancelled",
                "amount": booking.service.price,
                "booking": booking,
                "transaction_id": pidx,
            }
        )

    
    data = KhaltiPay.verify_payment(pidx)

    if data.get("status") == "Completed":

        booking.payment_status = "SUCCESS"
        booking.save()

        return render(
            request,
            "payment/index.html",
            {
                "status": "success",
                "amount": booking.service.price,
                "booking": booking,
                "transaction_id": pidx,
            }
        )

   
    booking.payment_status = "FAILURE"
    booking.save()

    return render(
        request,
        "payment/index.html",
        {
            "status": "failed",
            "amount": booking.service.price,
            "booking": booking,
            "transaction_id": pidx,
            "message": "Payment could not be completed.",
        }
    )
