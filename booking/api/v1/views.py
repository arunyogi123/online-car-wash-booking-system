from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from booking.models import Booking
from booking.api.v1.serializers import BookingSerializer


class BookingView(GenericAPIView):
    queryset=Booking.objects.all()
    serializer_class=BookingSerializer
    @extend_schema(
        responses=BookingSerializer,
        summary="Booking details view",
        tags=['booking']
    )
    def get(self,request):
        data=Booking.objects.all()
        serializer=BookingSerializer(data,many=True)
        return Response(serializer.data)
    
    @extend_schema(
        request=BookingSerializer,
        responses=BookingSerializer,
        summary="create booking",
        tags=['booking']
    )
    def post(self,request):
        data=request.data
        serializer=BookingSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Booked Successfully","data":serializer.data})
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    

class BookingManage(GenericAPIView):
    queryset=Booking.objects.all()
    serializer_class=BookingSerializer
    @extend_schema(
        request=BookingSerializer,
        responses=BookingSerializer,
        summary="Update booking",
        tags=['booking']
    )
    def put(self,request,id):
        qs=Booking.objects.get(id=id)
        data=request.data
        serializer=BookingSerializer(data=data,instance=qs)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Booking Updated Successfully","data":serializer.data},
                            status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)




    
    


    