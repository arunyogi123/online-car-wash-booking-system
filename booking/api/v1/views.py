from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from booking.models import Booking
from booking.api.v1.serializers import BookingSerializer


class BookingView(GenericAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        data = Booking.objects.filter(customer=request.user)
        serializer = BookingSerializer(data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookingSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(customer=request.user)  # Add customer automatically

            return Response(
                {
                    "message": "Booked Successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class BookingManage(GenericAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=BookingSerializer,
        responses=BookingSerializer,
        summary="Update booking",
        tags=["booking"],
    )
    def put(self, request, id):
        qs = Booking.objects.get(id=id, customer=request.user)
        serializer = BookingSerializer(data=request.data, instance=qs)
        if serializer.is_valid():
            serializer.save()

            return Response(
                {"message": "Booking Updated Successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @extend_schema(
        request=BookingSerializer,
        responses=BookingSerializer,
        tags=["booking"]

    )
    def delete(self,request,id):
        data=Booking.objects.get(id=id,customer=request.user)
        data.delete()
        return Response({"message":"Booking deleted successfully"},status=status.HTTP_200_OK)



    

