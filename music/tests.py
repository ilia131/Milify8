from pathlib import Path
from tempfile import TemporaryDirectory
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from artists.models import Artist
from music.models import Songs, TrackArtist
from subscriptions.models import ArtistSubscriptionTrack
from recentlyplayed.models import RecentlyPlayed


@override_settings(STORAGES={"default": {"BACKEND": "django.core.files.storage.FileSystemStorage"}})
class PlaybackAccessTests(APITestCase):
    def test_restricted_song_hides_both_file_fields_and_rejects_listen(self):
        user = get_user_model().objects.create_user("artist@example.com", username="artist")
        artist = Artist.objects.create(user=user, artistname="هنرمند")
        track = Songs.objects.create(title="آهنگ", track="music/song.wav")
        TrackArtist.objects.create(track=track, artist=artist, role="main")
        url = f"/api/player/{track.unique_id}/"

        public = self.client.get(url)
        self.assertEqual(public.status_code, 200)
        self.assertTrue(public.data["track_url"].rstrip("/").endswith("/music/song.wav"))

        ArtistSubscriptionTrack.objects.create(artist=artist, song=track, status="APPROVED")
        locked = self.client.get(url)
        self.assertTrue(locked.data["is_subscription_only"])
        self.assertIsNone(locked.data["track"])
        self.assertIsNone(locked.data["track_url"])
        self.assertEqual(self.client.post(url + "listen/", {
            "seconds": 40, "session_id": "test-session",
        }, format="json").status_code, 403)

    def test_unpublished_song_detail_is_not_public(self):
        track = Songs.objects.create(title="منتشر نشده", is_published=False)
        self.assertEqual(self.client.get(f"/api/player/{track.unique_id}/").status_code, 404)

    def test_audio_range_returns_only_requested_bytes(self):
        with TemporaryDirectory() as folder, override_settings(MEDIA_ROOT=folder):
            Path(folder, "track.wav").write_bytes(bytes(range(32)))
            Songs.objects.create(title="نمونه", track="track.wav")
            response = self.client.get("/api/stream/track.wav/", HTTP_RANGE="bytes=2-5")
            self.assertEqual(response.status_code, 206)
            self.assertEqual(response["Content-Range"], "bytes 2-5/32")
            self.assertEqual(b"".join(response.streaming_content), bytes(range(2, 6)))

    def test_repeated_listen_updates_one_play_and_history(self):
        user = get_user_model().objects.create_user("listener@example.com", username="listener", is_active=True)
        song = Songs.objects.create(title="آهنگ", duration=90)
        self.client.force_authenticate(user)
        url = f"/api/player/{song.unique_id}/listen/"
        session = str(uuid4())
        with self.captureOnCommitCallbacks() as stats_updates:
            for seconds in (30, 30, 40):
                response = self.client.post(url, {"seconds": seconds, "session_id": session}, format="json")
                self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(stats_updates), 1)
        song.refresh_from_db()
        self.assertEqual(song.play_count, 1)
        self.assertEqual(song.total_listen_time, 40)
        self.assertEqual(RecentlyPlayed.objects.filter(song=song, user=user).count(), 1)
