from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase

from artists.models import Artist


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    GOOGLE_CLIENT_ID="milify-test-client",
)
class AuthenticationTests(APITestCase):
    password = "Waveguide_574!Glass"

    def create_user(self, **overrides):
        fields = {
            "email": "listener@example.com",
            "username": "listener",
            "password": self.password,
            "is_active": True,
        }
        fields.update(overrides)
        return get_user_model().objects.create_user(**fields)

    def test_register_with_favorite_artist_and_sign_in_without_email(self):
        artist_user = self.create_user(email="artist@example.com", username="artist")
        artist = Artist.objects.create(user=artist_user, artistname="هنرمند")
        registration = self.client.post("/api/users/", {
            "email": "Listener@example.com",
            "username": "listener",
            "first_name": "شنونده",
            "last_name": "آزمایشی",
            "password": self.password,
            "re_password": self.password,
            "favorite_artists": [artist.artistname],
        }, format="json")
        self.assertEqual(registration.status_code, 201, registration.data)
        self.assertEqual(len(mail.outbox), 0)

        login = self.client.post("/api/jwt/create/", {
            "email": "listener@example.com", "password": self.password,
        }, format="json")
        self.assertEqual(login.status_code, 200, login.data)
        self.assertTrue(login.cookies["access"]["httponly"])
        self.assertEqual(self.client.get("/api/users/me/").status_code, 200)
        self.assertTrue(get_user_model().objects.get(email="listener@example.com").favorite_artists.filter(pk=artist.pk).exists())

    def test_refresh_rotates_cookie_and_logout_revokes_refresh(self):
        self.create_user()
        login = self.client.post("/api/jwt/create/", {
            "email": "listener@example.com", "password": self.password,
        }, format="json")
        initial = login.cookies["refresh"].value
        rotation = self.client.post("/api/jwt/refresh/", {}, format="json")
        self.assertEqual(rotation.status_code, 200)
        rotated = rotation.cookies["refresh"].value
        self.assertNotEqual(initial, rotated)
        self.assertEqual(self.client.post("/api/jwt/refresh/", {"refresh": initial}, format="json").status_code, 401)
        self.assertEqual(self.client.post("/api/logout/", {}, format="json").status_code, 204)
        self.assertEqual(self.client.post("/api/jwt/refresh/", {"refresh": rotated}, format="json").status_code, 401)

    @patch("users.views.id_token.verify_oauth2_token")
    def test_google_first_and_returning_login(self, verify):
        verify.return_value = {"email": "new@example.com", "email_verified": True, "sub": "12345"}
        first = self.client.post("/api/google/login/", {"id_token": "credential"}, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.data["created"])
        self.assertEqual(verify.call_args.args[2], "milify-test-client")
        first_id = first.data["user"]["id"]
        self.client.cookies.clear()

        verify.return_value["email"] = "renamed@example.com"
        second = self.client.post("/api/google/login/", {"id_token": "credential"}, format="json")
        self.assertEqual(second.status_code, 200)
        self.assertFalse(second.data["created"])
        self.assertEqual(second.data["user"]["id"], first_id)

    @patch("users.views.id_token.verify_oauth2_token")
    def test_google_requires_existing_session_to_link_password_account(self, verify):
        user = self.create_user()
        verify.return_value = {"email": user.email, "email_verified": True, "sub": "67890"}
        request = lambda: self.client.post("/api/google/login/", {"id_token": "credential"}, format="json")
        self.assertEqual(request().status_code, 403)
        self.assertEqual(self.client.post("/api/jwt/create/", {
            "email": user.email, "password": self.password,
        }, format="json").status_code, 200)
        self.assertEqual(request().status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.google_subject, "67890")

    @patch("users.views.id_token.verify_oauth2_token")
    def test_google_rejects_unverified_email_bad_token_and_inactive_account(self, verify):
        user = self.create_user(is_active=False, google_subject="disabled")
        verify.return_value = {"email": user.email, "email_verified": False, "sub": "disabled"}
        self.assertEqual(self.client.post("/api/google/login/", {"id_token": "credential"}, format="json").status_code, 400)
        verify.return_value["email_verified"] = True
        self.assertEqual(self.client.post("/api/google/login/", {"id_token": "credential"}, format="json").status_code, 403)
        verify.side_effect = ValueError("invalid")
        self.assertEqual(self.client.post("/api/google/login/", {"id_token": "credential"}, format="json").status_code, 401)

    def test_cross_origin_cookie_logout_is_rejected(self):
        response = self.client.post("/api/logout/", {}, format="json", HTTP_ORIGIN="https://untrusted.example")
        self.assertEqual(response.status_code, 403)


class PanelIsolationTests(APITestCase):
    password = "Panel-Test-84_Argon"

    def setUp(self):
        users = get_user_model().objects
        self.listener = users.create_user("listener@panels.example", username="panel-listener", password=self.password, is_active=True)
        self.admin = users.create_user("admin@panels.example", username="panel-admin", password=self.password, is_active=True, is_staff=True)
        self.artist = users.create_user("artist@panels.example", username="panel-artist", password=self.password, is_active=True)
        self.profile = Artist.objects.create(user=self.artist, artistname="Panel Artist")

    def sign_in(self, user, path):
        return self.client.post(path, {"email": user.email, "password": self.password}, format="json")

    def token_client(self, response):
        from rest_framework.test import APIClient

        self.assertEqual(response.status_code, 200, response.data)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return client

    def test_listeners_cannot_sign_in_to_either_panel(self):
        for panel in ("admin", "artist"):
            response = self.sign_in(self.listener, f"/api/panels/{panel}/login/")
            self.assertEqual(response.status_code, 403)
            self.assertNotIn("access", response.data)

    def test_admin_token_is_independent_from_main_and_artist(self):
        main = self.token_client(self.sign_in(self.admin, "/api/jwt/create/"))
        self.assertEqual(main.get("/api/permissions/admin/users/").status_code, 403)
        admin = self.token_client(self.sign_in(self.admin, "/api/panels/admin/login/"))
        self.assertEqual(admin.get("/api/permissions/admin/users/").status_code, 200)
        self.assertEqual(admin.get("/api/panels/artist/me/").status_code, 403)
        self.assertEqual(admin.get("/api/panel-data/artist/songs/").status_code, 403)

    def test_artist_refresh_rotates_and_revalidates_role(self):
        response = self.sign_in(self.artist, "/api/panels/artist/login/")
        artist = self.token_client(response)
        self.assertEqual(artist.get("/api/panels/artist/me/").data["artist_id"], self.profile.pk)
        self.assertEqual(artist.get("/api/permissions/admin/users/").status_code, 403)
        self.assertEqual(artist.get("/api/panel-data/artist/plan/").data, {"plan": None})
        payload = {"refresh": response.data["refresh"]}
        for path in ("/api/panels/admin/refresh/", "/api/jwt/refresh/", "/users/jwt/refresh/"):
            self.assertEqual(self.client.post(path, payload, format="json").status_code, 401)
        rotation = self.client.post("/api/panels/artist/refresh/", payload, format="json")
        self.assertEqual(rotation.status_code, 200)
        self.assertNotEqual(rotation.data["refresh"], payload["refresh"])
        self.assertEqual(self.client.post("/api/panels/artist/refresh/", payload, format="json").status_code, 401)
        self.profile.delete()
        self.assertEqual(self.client.post("/api/panels/artist/refresh/", {
            "refresh": rotation.data["refresh"],
        }, format="json").status_code, 401)
        self.assertEqual(artist.get("/api/panel-data/artist/songs/").status_code, 403)

    @override_settings(ARTIST_UPLOAD_LIMITS={"songs": 0, "videos": None})
    def test_artist_quota_checked_on_upload_and_owner_isolation(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from music.models import Album

        artist = self.token_client(self.sign_in(self.artist, "/api/panels/artist/login/"))
        other = Artist.objects.create(user=self.listener, artistname="Other")
        album = Album.objects.create(artist=other, title="Other album")
        self.assertEqual(artist.patch(f"/api/panel-data/artist/albums/{album.pk}/", {
            "title": "Updated",
        }, format="json").status_code, 404)
        response = artist.post("/api/panel-data/artist/songs/", {
            "title": "Sample", "track": SimpleUploadedFile("sample.wav", b"sample", content_type="audio/wav"),
        }, format="multipart")
        self.assertEqual(response.status_code, 400, response.data)
        self.assertEqual(artist.get("/api/panel-data/artist/commercial/").data["upload_capacity"]["songs"]["remaining"], 0)

    def test_staff_cannot_set_superuser_roles(self):
        staff = self.token_client(self.sign_in(self.admin, "/api/panels/admin/login/"))
        response = staff.post("/api/permissions/admin/users/create/", {
            "email": "new@panels.example", "username": "new-admin", "password": self.password,
            "is_staff": True, "is_superuser": True,
        }, format="json")
        self.assertEqual(response.status_code, 403, response.data)

    @override_settings(ARTIST_GOOGLE_CLIENT_ID="artist-web-client")
    @patch("users.views.id_token.verify_oauth2_token")
    def test_google_login_requires_an_existing_linked_artist(self, verify):
        verify.return_value = {
            "email": self.artist.email, "email_verified": True, "sub": "linked-artist-subject",
        }
        path = "/api/panels/artist/google/"
        self.assertEqual(self.client.post(path, {"id_token": "credential"}, format="json").status_code, 403)
        self.artist.google_subject = "linked-artist-subject"
        self.artist.save(update_fields=["google_subject"])
        artist = self.token_client(self.client.post(path, {"id_token": "credential"}, format="json"))
        self.assertEqual(verify.call_args.args[2], "artist-web-client")
        self.assertEqual(artist.get("/api/panels/artist/me/").status_code, 200)
        self.assertEqual(artist.get("/api/panels/admin/me/").status_code, 403)

    def test_artist_capacity_uses_the_current_plan_override(self):
        from django.utils import timezone
        from subscriptions.models import Subscription, SubscriptionPlan

        plan = SubscriptionPlan.objects.create(name="Studio", price=100)
        Subscription.objects.create(
            user=self.artist, plan=plan, status="ACTIVE",
            started_at=timezone.now(), expires_at=timezone.now() + timezone.timedelta(days=30),
        )
        artist = self.token_client(self.sign_in(self.artist, "/api/panels/artist/login/"))
        with override_settings(ARTIST_UPLOAD_LIMITS={"songs": 1, "videos": None},
                               ARTIST_UPLOAD_LIMITS_BY_PLAN={str(plan.pk): {"songs": 10}}):
            result = artist.get("/api/panel-data/artist/commercial/")
            self.assertEqual(result.data["upload_capacity"]["songs"]["remaining"], 10)

    def test_artist_can_create_an_album_with_default_release_date(self):
        from django.utils import timezone

        artist = self.token_client(self.sign_in(self.artist, "/api/panels/artist/login/"))
        response = artist.post("/api/panel-data/artist/albums/", {
            "title": "Album", "is_published": False,
        }, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["release_date"], timezone.localdate().isoformat())
        self.assertEqual(response.data["artist"], self.profile.pk)
