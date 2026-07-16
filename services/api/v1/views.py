from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from services.models import Services
from services.api.v1.serializers import ServiceSerializer


class ServiceView(GenericAPIView):
    queryset = Services.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @extend_schema(
        responses=ServiceSerializer, summary="all services view", tags=["Services"]
    )
    def get(self, request):
        data = Services.objects.all()
        serializer = ServiceSerializer(data, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        request=ServiceSerializer,
        responses=ServiceSerializer,
        summary=" create services",
        tags=["Services"],
    )
    def post(self, request):
        data = request.data
        serializer = ServiceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Sucssfully Added", "data": serializer.data})
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)


class ServiceManage(GenericAPIView):
    queryset = Services.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "DELETE"]:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @extend_schema(
        request=ServiceSerializer,
        responses=ServiceSerializer,
        summary="service update",
        tags=["Services"],
    )
    def put(self, request, id):
        qs = Services.objects.get(id=id)
        data = request.data
        serializer = ServiceSerializer(data=data, instance=qs)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "successfully updated", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(
            serializer.errors, 
            status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        request=ServiceSerializer, responses=ServiceSerializer, tags=["Services"]
    )
    def delete(self, request, id):
        data = Services.objects.get(id=id)
        data.delete()
        return Response(
            {"message": "Deleted Successfully"}, 
            status=status.HTTP_200_OK
        )



