from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import ShortVideo, Songs


def limits_for(user):
    defaults = settings.ARTIST_UPLOAD_LIMITS
    overrides = settings.ARTIST_UPLOAD_LIMITS_BY_PLAN
    if not overrides:
        return defaults
    plan_id = user.subscriptions.filter(
        status="ACTIVE", expires_at__gt=timezone.now(),
    ).order_by("-expires_at").values_list("plan_id", flat=True).first()
    return {**defaults, **overrides.get(str(plan_id), {})}


def upload_capacity(user, limits=None):
    if limits is None:
        limits = limits_for(user)
    counts = {
        "songs": Songs.objects.filter(
            trackartist__artist__user=user, trackartist__role="main",
        ).distinct().count(),
        "videos": ShortVideo.objects.filter(user=user, main_artist__user=user).count(),
    }
    return {
        kind: {
            "used": counts[kind],
            "limit": limit,
            "remaining": max(0, limit - counts[kind]) if limit is not None else None,
        }
        for kind, limit in limits.items()
    }


def check_upload_capacity(user, kind):
    limits = limits_for(user)
    if limits[kind] is None:
        return
    # The upload view holds this lock until the new row has been saved.
    type(user).objects.select_for_update().get(pk=user.pk)
    if upload_capacity(user, limits)[kind]["remaining"] == 0:
        raise ValidationError({"detail": "ظرفیت آپلود این حساب تکمیل شده است."})
