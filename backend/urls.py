"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path , include
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomTokenVerifyView
from django.urls import path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/', include('users.urls')),
    path('api/panel-data/', include('backend.panel_resources')),
    path('api/', include('artists.urls')),
    path('api/', include('djoser.urls')),
    path('api/' , include('music.urls')),
    path("api/", include('recentlyplayed.urls')),
    path('api/' ,include('songsview.urls')),
    path("api/recommendations/", include("recommendations.urls")),
    path("users/", include("djoser.urls")),
    path("users/jwt/create/", CustomTokenObtainPairView.as_view()),
    path("users/jwt/refresh/", CustomTokenRefreshView.as_view()),
    path("users/jwt/verify/", CustomTokenVerifyView.as_view()),
    path(
        "api/subscriptions/",
        include(
            "subscriptions.urls"
        )
    ),
    path("api/seo/", include("seo.urls"), ),
    path(
        "api/ads/",
        include("ads.urls")
    ),
      path(
        "api/",
        include("music_producer.urls")
    ),
     path(
        "api/permissions/",
        include("accounts.urls")
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


