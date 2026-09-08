from rest_framework import serializers
from account.models import User, Profile


class UserSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(
        write_only=True,
        required=True
    )

    password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "full_name",
            "email",
            "phone_no",
            "password",
        ]

    def create(self, validated_data):

        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            **validated_data,
            password=password
        )

        Profile.objects.create(
            user=user,
            full_name=full_name,
            address=""
        )

        return user


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = [
            "id",
            "full_name",
            "address",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]