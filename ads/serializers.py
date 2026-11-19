from rest_framework import serializers

from .models import (
    Advertiser,
    Campaign,
    Advertisement,
    AdImpression,
    AdClick,
)


class AdvertiserSerializer(serializers.ModelSerializer):

    class Meta:
        model = Advertiser
        fields = [
            "id",
            "name",
            "website",
            "logo",
            "is_active",
            "created_at",
        ]


class CampaignSerializer(serializers.ModelSerializer):

    remaining_budget = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Campaign
        fields = [
            "id",
            "advertiser",
            "name",
            "budget",
            "spent",
            "remaining_budget",
            "start_at",
            "end_at",
            "status",
            "created_at",
        ]


class AdvertisementSerializer(serializers.ModelSerializer):

    advertiser = serializers.CharField(
        source="campaign.advertiser.name",
        read_only=True
    )

    class Meta:
        model = Advertisement

        fields = [
            "id",
            "campaign",
            "advertiser",
            "title",
            "description",
            "ad_type",
            "image",
            "video",
            "target_url",
            "placement",
            "pricing_model",
            "price",
            "duration",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "created_at",
        ]

    def validate(self, attrs):

        ad_type = attrs.get(
            "ad_type",
            getattr(
                self.instance,
                "ad_type",
                None
            )
        )

        image = attrs.get("image")
        video = attrs.get("video")

        if ad_type == "IMAGE" and not image:
            raise serializers.ValidationError({
                "image": "Image is required for image ads."
            })

        if ad_type == "VIDEO" and not video:
            raise serializers.ValidationError({
                "video": "Video is required for video ads."
            })

        return attrs


class AdImpressionSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdImpression
        fields = [
            "id",
            "ad",
            "session_id",
            "watched_seconds",
            "watched_percentage",
            "completed",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


class AdClickSerializer(serializers.ModelSerializer):

    class Meta:
        model = AdClick

        fields = [
            "id",
            "ad",
            "session_id",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]
        


