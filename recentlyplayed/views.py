from rest_framework import generics, permissions
from .models import RecentlyPlayed
from .serializers import RecentlyPlayedSerializer


class RecentlyPlayedList(generics.ListAPIView):
    serializer_class = RecentlyPlayedSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            RecentlyPlayed.objects
            .filter(user=self.request.user, song__is_published=True)
            .select_related("song__album", "song__genre")
            .prefetch_related(
                "song__artist", "song__trackartist_set__artist",
                "song__artist_subscription_access", "song__lyrics_lines", "song__short_videos",
            )
        )

        artist_id = self.request.query_params.get("artist")

        if artist_id:
            queryset = queryset.filter(song__artist__id=artist_id)

        return queryset.order_by("-played_at")[:20]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

