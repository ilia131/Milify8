from django.db import transaction
from django.db.models import Q, Sum
from django.urls import path
from rest_framework import generics, serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from accounts.models import SupportRequest
from music.models import Album, ShortVideo, Songs, TrackArtist
from music.artist_uploads import check_upload_capacity, upload_capacity
from subscriptions.models import ArtistSubscriptionPlan, ArtistSubscriptionTrack, Payment, SubscriptionPlan
from users.panels import IsAdminPanel, IsArtistPanel


class PanelPagination(PageNumberPagination):
    page_size = 25


class AlbumFields(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ("id", "title", "artist", "description", "cover", "release_date", "is_published")


class ArtistAlbumFields(AlbumFields):
    class Meta(AlbumFields.Meta):
        read_only_fields = ("artist",)


class ArtistSongFields(serializers.ModelSerializer):
    class Meta:
        model = Songs
        fields = ("id", "unique_id", "title", "description", "track", "image", "duration", "album", "is_published", "verified", "play_count")
        read_only_fields = ("unique_id", "track", "duration", "verified", "play_count")

    def validate_album(self, album):
        if album and album.artist_id != self.context["request"].user.artist_profile.pk:
            raise serializers.ValidationError("آلبوم متعلق به حساب شما نیست.")
        return album


class ArtistShortFields(serializers.ModelSerializer):
    class Meta:
        model = ShortVideo
        fields = ("id", "uuid", "caption", "video", "thumbnail", "allow_comments", "views", "is_official")
        read_only_fields = ("uuid", "video", "views", "is_official")


class ArtistSongUploadFields(ArtistSongFields):
    class Meta(ArtistSongFields.Meta):
        read_only_fields = ("id", "unique_id", "verified", "play_count")
        extra_kwargs = {"track": {"required": True, "allow_null": False}}


class ArtistShortUploadFields(ArtistShortFields):
    class Meta(ArtistShortFields.Meta):
        read_only_fields = ("id", "uuid", "views", "is_official")


class AdminShortFields(ArtistShortFields):
    class Meta(ArtistShortFields.Meta):
        read_only_fields = ("uuid", "video", "views")


class SupportFields(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = ("id", "email", "subject", "message", "status", "created_at")
        read_only_fields = ("email", "subject", "message", "created_at")


class PlanFields(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=12, decimal_places=0, min_value=0)
    duration_days = serializers.IntegerField(min_value=1, max_value=36500)

    class Meta:
        model = SubscriptionPlan
        fields = ("id", "name", "description", "price", "duration_days", "is_active")


class ArtistPlanFields(PlanFields):
    class Meta(PlanFields.Meta):
        model = ArtistSubscriptionPlan


class ArtistRequestFields(serializers.ModelSerializer):
    artist_name = serializers.CharField(source="artist.artistname", read_only=True)
    song_title = serializers.CharField(source="song.title", read_only=True)

    class Meta:
        model = ArtistSubscriptionTrack
        fields = ("id", "artist_name", "song_title", "status", "created_at")


class AdminArtistRequests(generics.ListAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = ArtistRequestFields
    pagination_class = PanelPagination
    queryset = ArtistSubscriptionTrack.objects.select_related("artist", "song").order_by("-created_at")


class AdminAlbumsList(generics.ListCreateAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = AlbumFields
    pagination_class = PanelPagination
    queryset = Album.objects.order_by("-pk")


class AdminAlbum(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = AlbumFields
    queryset = Album.objects.all()


class AdminShorts(generics.ListAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = AdminShortFields
    pagination_class = PanelPagination
    queryset = ShortVideo.objects.order_by("-pk")


class AdminShort(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = AdminShortFields
    queryset = ShortVideo.objects.all()


class SupportList(generics.ListAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = SupportFields
    pagination_class = PanelPagination

    def get_queryset(self):
        items = SupportRequest.objects.all()
        search = self.request.query_params.get("search")
        return items.filter(Q(subject__icontains=search) | Q(email__icontains=search)) if search else items


class SupportDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = SupportFields
    queryset = SupportRequest.objects.all()


class PlanList(generics.ListCreateAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = PlanFields
    pagination_class = PanelPagination
    queryset = SubscriptionPlan.objects.order_by("-created_at")


class PlanDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminPanel]
    serializer_class = PlanFields
    queryset = SubscriptionPlan.objects.all()


class ArtistAlbum(generics.RetrieveUpdateAPIView):
    permission_classes = [IsArtistPanel]
    serializer_class = ArtistAlbumFields

    def get_queryset(self):
        return Album.objects.filter(artist__user=self.request.user).order_by("-pk")


class ArtistSong(generics.RetrieveUpdateAPIView):
    permission_classes = [IsArtistPanel]
    serializer_class = ArtistSongFields

    def get_queryset(self):
        return Songs.objects.filter(trackartist__artist__user=self.request.user, trackartist__role="main").distinct().order_by("-pk")


class ArtistShort(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsArtistPanel]
    serializer_class = ArtistShortFields

    def get_queryset(self):
        return ShortVideo.objects.filter(user=self.request.user, main_artist__user=self.request.user).order_by("-pk")


class ArtistAlbumList(generics.ListCreateAPIView):
    permission_classes = [IsArtistPanel]
    serializer_class = ArtistAlbumFields
    pagination_class = PanelPagination
    get_queryset = ArtistAlbum.get_queryset

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user.artist_profile)


class ArtistSongList(generics.ListCreateAPIView):
    permission_classes = [IsArtistPanel]
    pagination_class = PanelPagination
    get_queryset = ArtistSong.get_queryset

    def get_serializer_class(self):
        return ArtistSongUploadFields if self.request.method == "POST" else ArtistSongFields

    @transaction.atomic
    def perform_create(self, serializer):
        check_upload_capacity(self.request.user, "songs")
        song = serializer.save()
        TrackArtist.objects.create(track=song, artist=self.request.user.artist_profile, role="main")


class ArtistShortList(generics.ListCreateAPIView):
    permission_classes = [IsArtistPanel]
    pagination_class = PanelPagination
    get_queryset = ArtistShort.get_queryset

    def get_serializer_class(self):
        return ArtistShortUploadFields if self.request.method == "POST" else ArtistShortFields

    @transaction.atomic
    def perform_create(self, serializer):
        check_upload_capacity(self.request.user, "videos")
        serializer.save(user=self.request.user, main_artist=self.request.user.artist_profile)


class ArtistCommercialSummary(generics.GenericAPIView):
    permission_classes = [IsArtistPanel]

    def get(self, request):
        payments = Payment.objects.filter(
            artist_subscription__artist=request.user.artist_profile, status="SUCCESS",
        )
        return Response({
            "gross_subscription_sales": payments.aggregate(total=Sum("amount"))["total"] or 0,
            "successful_payments": payments.count(),
            "upload_capacity": upload_capacity(request.user),
        })


class OwnArtistPlan(generics.GenericAPIView):
    permission_classes = [IsArtistPanel]
    serializer_class = ArtistPlanFields

    def get(self, request):
        plan = ArtistSubscriptionPlan.objects.filter(artist=request.user.artist_profile).first()
        return Response({"plan": self.get_serializer(plan).data if plan else None})

    def put(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan, _ = ArtistSubscriptionPlan.objects.update_or_create(
            artist=request.user.artist_profile, defaults=serializer.validated_data,
        )
        return Response(self.get_serializer(plan).data)


urlpatterns = [
    path("admin/artist-requests/", AdminArtistRequests.as_view()),
    path("admin/albums/", AdminAlbumsList.as_view()),
    path("admin/albums/<int:pk>/", AdminAlbum.as_view()),
    path("admin/shorts/", AdminShorts.as_view()),
    path("admin/shorts/<int:pk>/", AdminShort.as_view()),
    path("admin/support/", SupportList.as_view()),
    path("admin/support/<uuid:pk>/", SupportDetail.as_view()),
    path("admin/plans/", PlanList.as_view()),
    path("admin/plans/<uuid:pk>/", PlanDetail.as_view()),
    path("artist/albums/", ArtistAlbumList.as_view()),
    path("artist/songs/", ArtistSongList.as_view()),
    path("artist/shorts/", ArtistShortList.as_view()),
    path("artist/commercial/", ArtistCommercialSummary.as_view()),
    path("artist/albums/<int:pk>/", ArtistAlbum.as_view()),
    path("artist/songs/<int:pk>/", ArtistSong.as_view()),
    path("artist/shorts/<int:pk>/", ArtistShort.as_view()),
    path("artist/plan/", OwnArtistPlan.as_view()),
]
