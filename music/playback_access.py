from django.conf import settings
from django.urls import reverse
from django.utils import timezone


def locked_artist_ids(song):
    """All credited artists must approve before a song becomes restricted."""
    credited = {artist.pk for artist in song.artist.all()}
    approved = {
        entry.artist_id
        for entry in song.artist_subscription_access.all()
        if entry.status == "APPROVED"
    }
    return credited if credited and credited <= approved else set()


def can_play(song, user, locked=None):
    from subscriptions.models import ArtistSubscription

    locked = locked_artist_ids(song) if locked is None else locked
    if not locked:
        return True
    if not user or not user.is_authenticated:
        return False
    return ArtistSubscription.objects.filter(
        user=user, artist_id__in=locked, status="ACTIVE",
        expires_at__gt=timezone.now(),
    ).exists()


def playback_url(song, request, locked=None):
    if not song.track or not can_play(song, getattr(request, "user", None), locked):
        return None
    url = (
        reverse("song-stream", kwargs={"file_path": song.track.name})
        if settings.MILIFY_LOCAL_MEDIA else song.track.url
    )
    return request.build_absolute_uri(url) if request else url
