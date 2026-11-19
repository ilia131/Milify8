from .panels import ArtistGoogleLoginView, PanelLoginView, PanelMeView, PanelRefreshView
from django.urls import path  , re_path
from .views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    CustomTokenVerifyView,
    GoogleTokenLoginView,
    LogoutView
)


urlpatterns = [
    path("panels/artist/google/", ArtistGoogleLoginView.as_view()),
    path("panels/<str:panel>/login/", PanelLoginView.as_view()),
    path("panels/<str:panel>/refresh/", PanelRefreshView.as_view()),
    path("panels/<str:panel>/me/", PanelMeView.as_view()),
    path(
        "google/login/",
        GoogleTokenLoginView.as_view(),
        name="google-token-login",
    ),
    path('jwt/create/', CustomTokenObtainPairView.as_view()),
    path('jwt/refresh/', CustomTokenRefreshView.as_view()),
    path('jwt/verify/', CustomTokenVerifyView.as_view()),
    path('logout/', LogoutView.as_view()),
]
