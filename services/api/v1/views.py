from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response

from services.models import Services,TimeSlot
from services.api.v1.serializers import ServiceSerializer,TimeSlotSerializer

class ServiceView(GenericAPIView):
    queryset=Services.objects.all()
    serializer_class=ServiceSerializer
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [IsAuthenticated()]
    @extend_schema(
        
        responses=ServiceSerializer,
        summary="all services view",
        tags=['Services']
    )
    def get(self,request):
        data=Services.objects.all()
        serializer=ServiceSerializer(data,many=True)
        return Response(serializer.data)
    
    @extend_schema(
        request=ServiceSerializer,
        responses=ServiceSerializer,
        summary=" create services",
        tags=['Services']

    )
    def post(self,request):
        data=request.data
        serializer=ServiceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Sucssfully Added","data":serializer.data})
        return Response(serializer.errors,status.HTTP_400_BAD_REQUEST)
        
