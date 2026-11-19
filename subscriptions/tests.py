from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class SubscriptionPurchaseTests(APITestCase):
    def test_malformed_plan_id_returns_validation_error(self):
        user = get_user_model().objects.create_user("listener@example.com", username="listener", is_active=True)
        self.client.force_authenticate(user)
        response = self.client.post(
            "/api/subscriptions/purchase/", {"plan_id": "invalid"}, format="json",
        )
        self.assertEqual(response.status_code, 400)
