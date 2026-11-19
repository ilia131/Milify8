from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Artist, FollowArtist


class ArtistDashboardTests(APITestCase):
    def test_artist_owner_reads_dashboard_and_follower_history(self):
        users = get_user_model().objects
        artist_user = users.create_user("artist@example.com", username="artist", is_active=True)
        artist = Artist.objects.create(user=artist_user, artistname="sample")
        follower = users.create_user("follower@example.com", username="follower", is_active=True)
        FollowArtist.objects.create(user=follower, artist=artist)

        self.assertEqual(self.client.get("/api/dashboard/sample/").status_code, 401)
        self.client.force_authenticate(follower)
        self.assertEqual(self.client.get("/api/dashboard/sample/").status_code, 403)

        self.client.force_authenticate(artist_user, token={"panel": "artist"})
        dashboard = self.client.get("/api/dashboard/sample/")
        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(dashboard.data["followers"], 1)
        chart = self.client.get("/api/dashboard/sample/followers-chart/")
        self.assertEqual(chart.status_code, 200)
        self.assertEqual(chart.data[0]["followers"], 1)
