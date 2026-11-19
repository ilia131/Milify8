from django.db import IntegrityError, transaction
from djoser.serializers import UserCreateSerializer
from rest_framework import serializers
from accounts.models import UserListener
from artists.models import Artist


class CustomUserCreateSerializer(UserCreateSerializer):

    re_password = serializers.CharField(write_only=True)

    favorite_artists = serializers.SlugRelatedField(
        many=True,
        slug_field="artistname",
        queryset=Artist.objects.all(),
        required=False
    )

    class Meta(UserCreateSerializer.Meta):
        model = UserListener
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "re_password",
            "favorite_artists",
        )

    def validate(self, attrs):
        
        if attrs["password"] != attrs["re_password"]:
            raise serializers.ValidationError(
                {"password": "رمز عبور و تکرار آن یکسان نیستند."}
            )
        if UserListener.objects.filter(email__iexact=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "این ایمیل قبلاً ثبت شده است."})
        account_data = {key: value for key, value in attrs.items()
                        if key not in {"re_password", "favorite_artists"}}
        super().validate(account_data)
        return attrs

    def create(self, validated_data):
        validated_data.pop("re_password")
        favorite_artists = validated_data.pop("favorite_artists", [])
        try:
            with transaction.atomic():
                user = UserListener.objects.create_user(**validated_data, is_active=True)
                if favorite_artists:
                    user.favorite_artists.set(favorite_artists)
        except IntegrityError:
            raise serializers.ValidationError(
                {"detail": "این ایمیل یا نام کاربری قبلاً ثبت شده است."}
            )
        return user
