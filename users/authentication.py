from django.conf import settings
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


def check_cookie_origin(request):
    origin = request.headers.get("Origin")
    allowed = {*settings.CORS_ALLOWED_ORIGINS, f"{request.scheme}://{request.get_host()}"}
    if origin and origin not in allowed:
        raise PermissionDenied("مبدأ درخواست مجاز نیست.")
    if request.headers.get("Sec-Fetch-Site") == "cross-site" and not origin:
        raise PermissionDenied("مبدأ درخواست مجاز نیست.")


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        if self.get_header(request) is not None:
            return super().authenticate(request)

        token = request.COOKIES.get(settings.AUTH_COOKIE)
        if not token:
            return None
        if request.method not in SAFE_METHODS:
            check_cookie_origin(request)
        try:
            validated = self.get_validated_token(token)
        except InvalidToken:
            # Public endpoints remain available with an expired browser cookie.
            return None
        return self.get_user(validated), validated
