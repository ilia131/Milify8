from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import AuthenticationFailed, NotFound, PermissionDenied
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .authentication import check_cookie_origin
from .views import GoogleCredentialError, verify_google_credential


def authorized_for_panel(user, panel):
    if not user.is_authenticated or not user.is_active:
        return False
    if panel == "admin":
        return user.is_staff
    return panel == "artist" and hasattr(user, "artist_profile")


class PanelPermission(BasePermission):
    panel = ""

    def has_permission(self, request, view):
        return (
            authorized_for_panel(request.user, self.panel)
            and request.auth is not None
            and request.auth.get("panel") == self.panel
        )


class IsAdminPanel(PanelPermission):
    panel = "admin"


class IsArtistPanel(PanelPermission):
    panel = "artist"


def validate_panel(panel):
    if panel not in {"admin", "artist"}:
        raise NotFound()


class PanelLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, panel="admin"):
        validate_panel(panel)
        check_cookie_origin(request)
        email, password = request.data.get("email"), request.data.get("password")
        if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
            return Response({"detail": "ایمیل و رمز عبور را وارد کنید."}, status=400)

        user = authenticate(request=request, username=email.strip().lower(), password=password)
        if user is None:
            raise AuthenticationFailed("ایمیل یا رمز عبور درست نیست.")
        if not authorized_for_panel(user, panel):
            raise PermissionDenied("حساب شما به این پنل دسترسی ندارد.")

        return panel_tokens(user, panel)


def panel_tokens(user, panel):
    refresh = RefreshToken.for_user(user)
    refresh["panel"] = panel
    return Response(
        {"access": str(refresh.access_token), "refresh": str(refresh)},
        headers={"Cache-Control": "no-store"},
    )


class ArtistGoogleLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        check_cookie_origin(request)
        try:
            _, _, subject = verify_google_credential(request.data.get("id_token"), settings.ARTIST_GOOGLE_CLIENT_ID)
        except GoogleCredentialError as error:
            return Response({"detail": str(error)}, status=error.status_code)

        user = get_user_model().objects.filter(google_subject=subject).first()
        if user is None or not authorized_for_panel(user, "artist"):
            raise PermissionDenied("ابتدا حساب گوگل را در میلیفای به حساب هنرمند متصل کنید.")
        return panel_tokens(user, "artist")


class PanelRefreshView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, panel):
        validate_panel(panel)
        check_cookie_origin(request)
        raw = request.data.get("refresh")
        try:
            if not isinstance(raw, str):
                raise TokenError("Missing refresh")
            token = RefreshToken(raw)
            if token.get("panel") != panel:
                raise TokenError("Wrong panel")
            user = JWTAuthentication().get_user(token)
            if not authorized_for_panel(user, panel):
                raise TokenError("Panel access revoked")
            serializer = TokenRefreshSerializer(data={"refresh": raw})
            serializer.is_valid(raise_exception=True)
        except (TokenError, AuthenticationFailed):
            return Response({"detail": "نشست پنل معتبر نیست."}, status=401)
        return Response(serializer.validated_data, headers={"Cache-Control": "no-store"})


class PanelMeView(APIView):
    def get(self, request, panel):
        validate_panel(panel)
        permission = IsAdminPanel() if panel == "admin" else IsArtistPanel()
        if not permission.has_permission(request, self):
            self.permission_denied(request, message="دسترسی به پنل مجاز نیست.")
        user = request.user
        artist = getattr(user, "artist_profile", None) if panel == "artist" else None
        return Response({
            "id": user.pk,
            "username": user.username,
            "email": user.email,
            "artist_id": artist.pk if artist else None,
            "artist_name": artist.artistname if artist else None,
        }, headers={"Cache-Control": "no-store"})
