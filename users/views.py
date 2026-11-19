import uuid

from django.conf import settings
from django.db import IntegrityError, transaction
from google.auth.exceptions import TransportError
from google.auth.transport.requests import Request
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from accounts.models import UserListener
from .authentication import check_cookie_origin


def set_session_cookies(response):
    if response.status_code == 200:
        for name, max_age in (
            ("access", settings.AUTH_COOKIE_ACCESS_MAX_AGE),
            ("refresh", settings.AUTH_COOKIE_REFRESH_MAX_AGE),
        ):
            if name in response.data:
                response.set_cookie(
                    name, response.data[name], max_age=max_age,
                    path=settings.AUTH_COOKIE_PATH, secure=settings.AUTH_COOKIE_SECURE,
                    httponly=True, samesite=settings.AUTH_COOKIE_SAMESITE,
                )
    response["Cache-Control"] = "no-store"
    return response


class GoogleCredentialError(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.status_code = status_code


def verify_google_credential(credential, client_id):
    if not isinstance(credential, str) or not credential:
        raise GoogleCredentialError("توکن گوگل ارسال نشده است.", 400)
    if not client_id:
        raise GoogleCredentialError("ورود گوگل هنوز تنظیم نشده است.", 503)
    try:
        claims = id_token.verify_oauth2_token(credential, Request(), client_id)
    except ValueError as error:
        raise GoogleCredentialError("توکن گوگل معتبر نیست.", 401) from error
    except TransportError as error:
        raise GoogleCredentialError("سرویس گوگل در دسترس نیست.", 503) from error
    email = claims.get("email", "").strip().lower()
    subject = claims.get("sub")
    if not email or claims.get("email_verified") is not True or not subject:
        raise GoogleCredentialError("ایمیل حساب گوگل تأیید نشده است.", 400)
    return claims, email, subject


class GoogleTokenLoginView(APIView):
    permission_classes = []

    def post(self, request):
        check_cookie_origin(request)
        try:
            claims, email, subject = verify_google_credential(request.data.get("id_token"), settings.GOOGLE_CLIENT_ID)
        except GoogleCredentialError as error:
            return Response({"detail": str(error)}, status=error.status_code)

        try:
            with transaction.atomic():
                user, created = self.resolve_user(request.user, claims, email, subject)
        except IntegrityError:
            return Response({"detail": "اتصال حساب انجام نشد. دوباره تلاش کنید."}, status=409)

        refresh = RefreshToken.for_user(user)
        return set_session_cookies(Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "created": created,
            "user": {
                "id": user.pk,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
        }))

    @staticmethod
    def resolve_user(current_user, claims, email, subject):
        users = UserListener.objects.select_for_update()
        user = users.filter(google_subject=subject).first()
        if user:
            if not user.is_active or (current_user.is_authenticated and current_user.pk != user.pk):
                raise PermissionDenied("این حساب گوگل قابل استفاده نیست.")
            return user, False

        matches = list(users.filter(email__iexact=email)[:2])
        if matches:
            user = matches[0]
            legacy_google = (
                not user.is_staff and not user.is_superuser and not user.has_usable_password()
                and (email.endswith("@gmail.com") or bool(claims.get("hd")))
            )
            if (
                len(matches) != 1 or not user.is_active or user.google_subject
                or (current_user.pk != user.pk and not legacy_google)
                or (current_user.is_authenticated and current_user.pk != user.pk)
            ):
                raise PermissionDenied("برای اتصال گوگل، ابتدا وارد حساب موجود با همین ایمیل شوید.")
            user.google_subject = subject
            user.save(update_fields=["google_subject"])
            return user, False

        if current_user.is_authenticated:
            raise PermissionDenied("ایمیل حساب گوگل باید با ایمیل حساب میلیفای یکسان باشد.")
        user = UserListener.objects.create_user(
            email=email,
            username=f"google_{uuid.uuid4().hex}",
            first_name=claims.get("given_name", "")[:120],
            last_name=claims.get("family_name", "")[:120],
            is_active=True,
            google_subject=subject,
        )
        return user, True


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        check_cookie_origin(request)
        return set_session_cookies(super().post(request, *args, **kwargs))


class CookieTokenView:
    cookie_name = ""
    token_field = ""

    def post(self, request, *args, **kwargs):
        check_cookie_origin(request)
        token = request.data.get(self.token_field) or request.COOKIES.get(self.cookie_name)
        serializer = self.get_serializer(data={self.token_field: token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response({"detail": "نشست معتبر نیست."}, status=401)
        return set_session_cookies(Response(serializer.validated_data))


class CustomTokenRefreshView(CookieTokenView, TokenRefreshView):
    cookie_name = "refresh"
    token_field = "refresh"

    def post(self, request, *args, **kwargs):
        raw = request.data.get("refresh") or request.COOKIES.get("refresh")
        try:
            if isinstance(raw, str) and RefreshToken(raw).get("panel"):
                return Response({"detail": "برای تمدید نشست به پنل مربوطه مراجعه کنید."}, status=401)
        except TokenError:
            return Response({"detail": "نشست معتبر نیست."}, status=401)
        return super().post(request, *args, **kwargs)


class CustomTokenVerifyView(CookieTokenView, TokenVerifyView):
    cookie_name = "access"
    token_field = "token"


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        check_cookie_origin(request)
        refresh = request.data.get("refresh") or request.COOKIES.get("refresh")
        if isinstance(refresh, str):
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                pass

        response = Response(status=status.HTTP_204_NO_CONTENT)
        for name in ("access", "refresh"):
            response.delete_cookie(
                name, path=settings.AUTH_COOKIE_PATH, samesite=settings.AUTH_COOKIE_SAMESITE
            )
        response["Cache-Control"] = "no-store"
        return response
