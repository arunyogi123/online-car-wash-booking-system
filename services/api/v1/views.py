from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from services.models import Services
from services.api.v1.serializers import ServiceSerializer


class ServiceView(GenericAPIView):
    queryset = Services.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        # Anyone can view services
        if self.request.method == "GET":
            return [AllowAny()]

        # Only admin can create services
        if self.request.method == "POST":
            return [IsAdminUser()]

        return [AllowAny()]

    @extend_schema(
        responses=ServiceSerializer,
        summary="All services view",
        tags=["Services"],
    )
    def get(self, request):
        data = Services.objects.all()
        serializer = ServiceSerializer(data, many=True)

        return Response(serializer.data)

    @extend_schema(
        request=ServiceSerializer,
        responses=ServiceSerializer,
        summary="Create services",
        tags=["Services"],
    )
    def post(self, request):
        serializer = ServiceSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Successfully Added",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class ServiceManage(GenericAPIView):
    queryset = Services.objects.all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        # Only admin can update or delete services
        return [IsAdminUser()]

    @extend_schema(
        request=ServiceSerializer,
        responses=ServiceSerializer,
        summary="Service update",
        tags=["Services"],
    )
    def put(self, request, id):
        qs = Services.objects.get(id=id)

        serializer = ServiceSerializer(
            qs,
            data=request.data,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Successfully updated",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    @extend_schema(
        responses=None,
        summary="Delete service",
        tags=["Services"],
    )
    def delete(self, request, id):
        data = Services.objects.get(id=id)
        data.delete()

        return Response(
            {
                "message": "Deleted Successfully",
            },
            status=status.HTTP_200_OK,
        )