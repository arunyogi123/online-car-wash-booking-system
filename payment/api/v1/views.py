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

    try:
        booking = Booking.objects.get(
            id=id,
            customer=request.user
        )
    except Booking.DoesNotExist:
        return Response(
            {
                "message": "Booking not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if booking.payment_status == "SUCCESS":
        return Response(
            {
                "message": "Booking already paid! Thank you."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = KhaltiPay.get_initial_id(
        order_id=booking.id,
        order_name=f"BOOKING-{booking.id}",
        amount=int(booking.service.price * 100),
        name=booking.customer.username,
        phone=booking.customer.phone_no,
        service=booking.service,
    )

    if not data.get("payment_url"):
        return Response(
            {
                "message": "Unable to initiate payment.",
                "error": data,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": "Payment initiated successfully.",
            "payment_url": data.get("payment_url"),
            "pidx": data.get("pidx"),
        },
        status=status.HTTP_200_OK,
    )


@extend_schema(tags=["Payment"])
@api_view(["GET"])
def payment_callback(request):

    # Get Khalti callback data
    pidx = request.GET.get("pidx")
    booking_id = request.GET.get("purchase_order_id")
    status_param = request.GET.get("status")

    # -----------------------------------
    # Booking ID check
    # -----------------------------------

    if not booking_id:
        return Response(
            {
                "message": "Booking ID not found."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------
    # Find booking
    # -----------------------------------

    try:
        booking = Booking.objects.get(
            id=booking_id
        )
    except Booking.DoesNotExist:
        return Response(
            {
                "message": "Booking not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # -----------------------------------
    # User cancelled payment
    # -----------------------------------

    if status_param and status_param.lower() == "user canceled":

        booking.payment_status = "FAILURE"
        booking.save(update_fields=["payment_status"])

        return render(
            request,
            "payment/index.html",
            {
                "status": "cancelled",
                "amount": booking.service.price,
                "booking": booking,
                "transaction_id": pidx,
            },
        )

    # -----------------------------------
    # pidx missing
    # -----------------------------------

    if not pidx:

        booking.payment_status = "FAILURE"
        booking.save(update_fields=["payment_status"])

        return render(
            request,
            "payment/index.html",
            {
                "status": "failed",
                "amount": booking.service.price,
                "booking": booking,
                "message": "Payment ID not found.",
            },
        )

    # -----------------------------------
    # Verify payment with Khalti
    # -----------------------------------

    data = KhaltiPay.verify_payment(pidx)

    # -----------------------------------
    # Payment successful
    # -----------------------------------

    if data.get("status") == "Completed":

        booking.payment_status = "SUCCESS"
        booking.save(update_fields=["payment_status"])

        return render(
            request,
            "payment/index.html",
            {
                "status": "success",
                "amount": booking.service.price,
                "booking": booking,
                "transaction_id": pidx,
            },
        )

    # -----------------------------------
    # Payment failed
    # -----------------------------------

    booking.payment_status = "FAILURE"
    booking.save(update_fields=["payment_status"])

    return render(
        request,
        "payment/index.html",
        {
            "status": "failed",
            "amount": booking.service.price,
            "booking": booking,
            "transaction_id": pidx,
            "message": "Payment could not be completed.",
        },
    )