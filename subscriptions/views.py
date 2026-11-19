from django.db import transaction
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from decimal import Decimal, InvalidOperation

from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    SubscriptionPlan,
    Subscription,
    Payment,
    Wallet,
    WalletTransaction,
)

from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
)
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    ArtistSubscriptionPlan,
    ArtistSubscription,
    ArtistSubscriptionTrack,
)
from artists.models import Artist
from uuid import UUID

from music.models import Songs


# =========================================================
# Artist Subscription Plan
# =========================================================

# =========================================================
# Artist Subscription Plan
# =========================================================

class ArtistSubscriptionPlanView(APIView):
    """
    GET:
        دریافت پلن اشتراک آرتیست

    POST:
        ساخت یا بروزرسانی پلن اشتراک آرتیست
    """

    permission_classes = [IsAuthenticated]

    def get_artist(self, artistname):
        return get_object_or_404(
            Artist,
            artistname=artistname,
        )

    def get(self, request, artistname):
        artist = self.get_artist(artistname)

        plan = (
            ArtistSubscriptionPlan.objects
            .filter(
                artist=artist,
                is_active=True,
            )
            .first()
        )

        if not plan:
            return Response(
                {
                    "detail": "این آرتیست پلن اشتراک فعال ندارد."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "id": str(plan.id),
            "artist": artist.artistname,
            "name": plan.name,
            "description": plan.description,
            "price": plan.price,
            "duration_days": plan.duration_days,
            "is_active": plan.is_active,
        })

    def post(self, request, artistname):
        artist = self.get_artist(artistname)

        # فقط صاحب Artist
        if artist.user_id != request.user.id:
            return Response(
                {
                    "detail": "شما صاحب این آرتیست نیستید."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        name = request.data.get(
            "name",
            "اشتراک ماهانه",
        )

        description = request.data.get(
            "description",
            "",
        )

        price = request.data.get("price")

        duration_days = request.data.get(
            "duration_days",
            30,
        )

        # -------------------------
        # Validate price
        # -------------------------

        if price is None:
            return Response(
                {
                    "detail": "قیمت اشتراک الزامی است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            price = Decimal(str(price))
        except (InvalidOperation, ValueError, TypeError):
            return Response(
                {
                    "detail": "قیمت اشتراک نامعتبر است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if price < 0:
            return Response(
                {
                    "detail": "قیمت نمی‌تواند منفی باشد."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # Validate duration
        # -------------------------

        try:
            duration_days = int(duration_days)
        except (ValueError, TypeError):
            return Response(
                {
                    "detail": "مدت اشتراک نامعتبر است."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if duration_days <= 0:
            return Response(
                {
                    "detail": "مدت اشتراک باید بیشتر از صفر باشد."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # Create / Update
        # -------------------------

        plan, created = (
            ArtistSubscriptionPlan.objects.update_or_create(
                artist=artist,
                defaults={
                    "name": name,
                    "description": description,
                    "price": price,
                    "duration_days": duration_days,
                    "is_active": True,
                },
            )
        )

        return Response(
            {
                "message": (
                    "پلن اشتراک ساخته شد."
                    if created
                    else "پلن اشتراک بروزرسانی شد."
                ),
                "plan": {
                    "id": str(plan.id),
                    "artist": artist.artistname,
                    "name": plan.name,
                    "description": plan.description,
                    "price": plan.price,
                    "duration_days": plan.duration_days,
                    "is_active": plan.is_active,
                },
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


# =========================================================
# Subscription Track Request
# =========================================================

class ArtistSubscriptionTrackCreateView(APIView):
    """
    آرتیست مشخص می‌کند یک آهنگ subscription-only باشد.

    برای آهنگ collaboration:
    برای تمام آرتیست‌های آهنگ رکورد ساخته می‌شود.

    سپس هر آرتیست باید درخواست خودش را APPROVED کند.

    آهنگ فقط زمانی subscription-only می‌شود که
    تمام آرتیست‌های آهنگ APPROVED باشند.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, song_id):

        # song_id در این endpoint همان unique_id آهنگ است
        song = get_object_or_404(
            Songs,
            unique_id=song_id,
        )

        # پیدا کردن Artist متعلق به کاربر
        artist = get_object_or_404(
            Artist,
            user=request.user,
        )

        # -------------------------
        # Check artist on song
        # -------------------------

        if not song.artist.filter(
            id=artist.id
        ).exists():

            return Response(
                {
                    "detail": "شما در این آهنگ حضور ندارید."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -------------------------
        # Check active plan
        # -------------------------

        plan = (
            ArtistSubscriptionPlan.objects
            .filter(
                artist=artist,
                is_active=True,
            )
            .first()
        )

        if not plan:
            return Response(
                {
                    "detail": "ابتدا پلن اشتراک خود را فعال کنید."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # All artists on song
        # -------------------------

        artists = list(
            song.artist.all()
        )

        created_tracks = []

        # -------------------------
        # Create requests
        # -------------------------

        with transaction.atomic():

            for song_artist in artists:

                track, created = (
                    ArtistSubscriptionTrack.objects
                    .get_or_create(
                        artist=song_artist,
                        song=song,
                        defaults={
                            "status": "PENDING",
                        },
                    )
                )

                # اگر قبلاً REJECTED شده بود،
                # درخواست جدید دوباره Pending شود.
                if (
                    not created
                    and track.status == "REJECTED"
                ):
                    track.status = "PENDING"
                    track.approved_at = None

                    track.save(
                        update_fields=[
                            "status",
                            "approved_at",
                            "updated_at",
                        ]
                    )

                created_tracks.append(track)

        # -------------------------
        # Current status
        # -------------------------

        all_approved = (
            len(created_tracks) > 0
            and all(
                track.status == "APPROVED"
                for track in created_tracks
            )
        )

        return Response(
            {
                "message": (
                    "همه آرتیست‌های آهنگ قبلاً تأیید کرده‌اند."
                    if all_approved
                    else
                    "درخواست subscription-only برای "
                    "تمام آرتیست‌های آهنگ ثبت شد."
                ),
                "song": {
                    "id": str(song.unique_id),
                    "title": song.title,
                },
                "is_subscription_only": all_approved,
                "artists": [
                    {
                        "artist": track.artist.artistname,
                        "status": track.status,
                        "approved_at": track.approved_at,
                    }
                    for track in created_tracks
                ],
            },
            status=(
                status.HTTP_200_OK
                if all_approved
                else status.HTTP_201_CREATED
            ),
        )


# =========================================================
# Approve / Reject Subscription Track
# =========================================================

class ArtistSubscriptionTrackApprovalView(APIView):
    """
    هر آرتیست فقط می‌تواند درخواست subscription
    مربوط به آهنگ خودش را تأیید یا رد کند.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, song_id):

        song = get_object_or_404(
            Songs,
            unique_id=song_id,
        )

        artist = get_object_or_404(
            Artist,
            user=request.user,
        )

        # بررسی اینکه آرتیست روی این آهنگ هست
        if not song.artist.filter(
            id=artist.id
        ).exists():
            return Response(
                {
                    "detail": "شما در این آهنگ حضور ندارید."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # پیدا کردن درخواست همین آرتیست برای همین آهنگ
        track = get_object_or_404(
            ArtistSubscriptionTrack,
            artist=artist,
            song=song,
        )

        action = request.data.get("action")

        if action not in [
            "APPROVED",
            "REJECTED",
        ]:
            return Response(
                {
                    "detail": (
                        "action باید APPROVED "
                        "یا REJECTED باشد."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # تغییر وضعیت
        track.status = action

        if action == "APPROVED":
            track.approved_at = timezone.now()
        else:
            track.approved_at = None

        track.save(
            update_fields=[
                "status",
                "approved_at",
                "updated_at",
            ]
        )

        # -------------------------
        # Check all artists
        # -------------------------

        total_artists = song.artist.count()

        approved_artists = (
            ArtistSubscriptionTrack.objects
            .filter(
                song=song,
                status="APPROVED",
            )
            .count()
        )

        is_subscription_only = (
            total_artists > 0
            and approved_artists == total_artists
        )

        return Response(
            {
                "message": (
                    "درخواست تأیید شد."
                    if action == "APPROVED"
                    else "درخواست رد شد."
                ),
                "song": {
                    "id": str(song.unique_id),
                    "title": song.title,
                },
                "artist": artist.artistname,
                "status": track.status,
                "is_subscription_only": is_subscription_only,
                "approval": {
                    "approved": approved_artists,
                    "total": total_artists,
                },
            }
        )


# =========================================================
# Subscription Track Status
# =========================================================

class ArtistSubscriptionTrackStatusView(APIView):
    """
    وضعیت subscription-only بودن آهنگ.

    اگر تمام آرتیست‌های آهنگ APPROVED باشند:

        is_subscription_only = True

    در غیر این صورت:

        is_subscription_only = False
    """

    permission_classes = [AllowAny]

    def get(self, request, song_id):

        song = get_object_or_404(
            Songs,
            unique_id=song_id,
        )

        # -------------------------
        # Artists on song
        # -------------------------

        artists = list(
            song.artist.all()
        )

        if not artists:

            return Response(
                {
                    "song": {
                        "id": str(song.unique_id),
                        "title": song.title,
                    },
                    "is_subscription_only": False,
                    "artists": [],
                }
            )

        # -------------------------
        # Subscription requests
        # -------------------------

        tracks = list(
            ArtistSubscriptionTrack.objects
            .filter(
                song=song,
            )
            .select_related(
                "artist",
            )
        )

        track_by_artist = {
            track.artist_id: track
            for track in tracks
        }

        # -------------------------
        # Check all approved
        # -------------------------

        all_approved = (
            len(tracks) == len(artists)
            and all(
                track_by_artist.get(
                    artist.id
                )
                and track_by_artist[
                    artist.id
                ].status == "APPROVED"
                for artist in artists
            )
        )

        return Response(
            {
                "song": {
                    "id": str(song.unique_id),
                    "title": song.title,
                },
                "is_subscription_only": all_approved,
                "approval": {
                    "approved": sum(
                        1
                        for track in tracks
                        if track.status == "APPROVED"
                    ),
                    "total": len(artists),
                },
                "artists": [
                    {
                        "artist": artist.artistname,
                        "status": (
                            track_by_artist[
                                artist.id
                            ].status
                            if artist.id in track_by_artist
                            else "PENDING"
                        ),
                        "approved_at": (
                            track_by_artist[
                                artist.id
                            ].approved_at
                            if artist.id in track_by_artist
                            else None
                        ),
                    }
                    for artist in artists
                ],
            }
        )


# =========================================================
# Purchase Artist Subscription
# =========================================================

class ArtistSubscriptionPurchaseView(APIView):
    """
    خرید اشتراک آرتیست با موجودی Wallet.

    فعلاً پرداخت از Wallet انجام می‌شود.
    بعداً می‌توان زرین‌پال را قبل از فعال‌سازی Subscription اضافه کرد.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, artistname):

        # =====================================================
        # Artist
        # =====================================================

        artist = get_object_or_404(
            Artist,
            artistname=artistname,
        )

        # =====================================================
        # Artist cannot subscribe to himself
        # =====================================================

        if artist.user_id == request.user.id:
            return Response(
                {
                    "detail": (
                        "نمی‌توانید اشتراک آرتیست خودتان "
                        "را خریداری کنید."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # Active Artist Subscription Plan
        # =====================================================

        plan = get_object_or_404(
            ArtistSubscriptionPlan,
            artist=artist,
            is_active=True,
        )

        now = timezone.now()

        # =====================================================
        # Get / Create Wallet
        # =====================================================

        wallet, _ = (
            Wallet.objects
            .select_for_update()
            .get_or_create(
                user=request.user,
                defaults={
                    "balance": 0,
                },
            )
        )

        # =====================================================
        # Check existing active subscription
        # =====================================================

        active_subscription = (
            ArtistSubscription.objects
            .filter(
                user=request.user,
                artist=artist,
                status="ACTIVE",
                expires_at__gt=now,
            )
            .select_for_update()
            .first()
        )

        if active_subscription:

            return Response(
                {
                    "status": "error",
                    "message": (
                        "شما در حال حاضر "
                        "اشتراک فعال این آرتیست را دارید."
                    ),
                    "subscription_id": str(
                        active_subscription.id
                    ),
                    "artist": artist.artistname,
                    "status": active_subscription.status,
                    "started_at": (
                        active_subscription.started_at
                    ),
                    "expires_at": (
                        active_subscription.expires_at
                    ),
                    "balance": str(
                        wallet.balance
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # Check Wallet Balance
        # =====================================================

        if wallet.balance < plan.price:

            return Response(
                {
                    "status": "error",
                    "message": "موجودی کیف پول کافی نیست.",
                    "balance": str(
                        wallet.balance
                    ),
                    "required": str(
                        plan.price
                    ),
                    "shortage": str(
                        plan.price - wallet.balance
                    ),
                    "artist": artist.artistname,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # Existing PENDING Subscription
        # =====================================================

        pending_subscription = (
            ArtistSubscription.objects
            .filter(
                user=request.user,
                artist=artist,
                status="PENDING",
            )
            .select_for_update()
            .first()
        )

        # =====================================================
        # Create / Activate Subscription
        # =====================================================

        expires_at = (
            now
            + timezone.timedelta(
                days=plan.duration_days
            )
        )

        if pending_subscription:

            pending_subscription.plan = plan
            pending_subscription.status = "ACTIVE"
            pending_subscription.started_at = now
            pending_subscription.expires_at = expires_at

            pending_subscription.save(
                update_fields=[
                    "plan",
                    "status",
                    "started_at",
                    "expires_at",
                    "updated_at",
                ]
            )

            subscription = pending_subscription

        else:

            subscription = (
                ArtistSubscription.objects.create(
                    user=request.user,
                    artist=artist,
                    plan=plan,
                    status="ACTIVE",
                    started_at=now,
                    expires_at=expires_at,
                )
            )

        # =====================================================
        # Deduct Wallet
        # =====================================================

        wallet.balance -= plan.price

        wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        # =====================================================
        # Wallet Transaction
        # =====================================================

        wallet_transaction = (
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=-plan.price,
                transaction_type="SUBSCRIPTION_PURCHASE",
                description=(
                    f"خرید اشتراک آرتیست "
                    f"{artist.artistname}"
                ),
            )
        )

        # =====================================================
        # Payment
        # =====================================================

        payment = Payment.objects.create(
            user=request.user,
            artist_subscription=subscription,
            amount=plan.price,
            status="SUCCESS",
            paid_at=now,
        )

        # =====================================================
        # Response
        # =====================================================

        return Response(
            {
                "status": "success",

                "message": (
                    "اشتراک آرتیست با موفقیت خریداری شد."
                ),

                "subscription": {
                    "id": str(
                        subscription.id
                    ),
                    "artist": (
                        artist.artistname
                    ),
                    "plan": plan.name,
                    "price": plan.price,
                    "duration_days": (
                        plan.duration_days
                    ),
                    "status": (
                        subscription.status
                    ),
                    "started_at": (
                        subscription.started_at
                    ),
                    "expires_at": (
                        subscription.expires_at
                    ),
                },

                "wallet": {
                    "id": str(
                        wallet.id
                    ),
                    "balance": str(
                        wallet.balance
                    ),
                },

                "wallet_transaction": {
                    "id": str(
                        wallet_transaction.id
                    ),
                    "amount": str(
                        wallet_transaction.amount
                    ),
                    "type": (
                        wallet_transaction.transaction_type
                    ),
                },

                "payment": {
                    "id": str(
                        payment.id
                    ),
                    "amount": str(
                        payment.amount
                    ),
                    "status": payment.status,
                    "paid_at": payment.paid_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )

# =========================================================
# User Artist Subscriptions
# =========================================================

class MyArtistSubscriptionsView(generics.ListAPIView):

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            ArtistSubscription.objects
            .filter(user=self.request.user)
            .select_related(
                "artist",
                "plan",
            )
            .order_by("-created_at")
        )

    def list(self, request, *args, **kwargs):

        subscriptions = self.get_queryset()

        return Response(
            [
                {
                    "id": str(subscription.id),
                    "artist": subscription.artist.artistname,
                    "plan": subscription.plan.name,
                    "price": subscription.plan.price,
                    "status": subscription.status,
                    "started_at": subscription.started_at,
                    "expires_at": subscription.expires_at,
                    "is_active": subscription.is_active_subscription,
                }
                for subscription in subscriptions
            ]
        )


# =========================================================
# Check Song Access
# =========================================================

class SongSubscriptionAccessView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, song_id):
        from music.playback_access import can_play, locked_artist_ids

        song = get_object_or_404(
            Songs.objects.prefetch_related("artist", "artist_subscription_access__artist"),
            unique_id=song_id,
            is_published=True,
        )
        locked = locked_artist_ids(song)
        permitted = can_play(song, request.user, locked)
        data = {"can_play": permitted, "requires_subscription": bool(locked)}
        if not locked:
            approvals = list(song.artist_subscription_access.all())
            if approvals:
                data["approval_status"] = [
                    {"artist": approval.artist.artistname, "status": approval.status}
                    for approval in approvals
                ]
        elif not permitted:
            data["reason"] = "SUBSCRIPTION_REQUIRED" if request.user.is_authenticated else "LOGIN_REQUIRED"
            if request.user.is_authenticated:
                data["artists"] = [
                    artist.artistname for artist in song.artist.all() if artist.pk in locked
                ]
        return Response(data)


# ============================================
# Subscription Plans
# ============================================

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = (
        SubscriptionPlan.objects
        .filter(is_active=True)
        .order_by("price")
    )

    serializer_class = SubscriptionPlanSerializer

    permission_classes = [
        AllowAny
    ]


# ============================================
# My Subscription
# ============================================

class MySubscriptionView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        subscription = (
            Subscription.objects
            .filter(
                user=request.user,
                status="ACTIVE",
                expires_at__gt=timezone.now(),
            )
            .select_related("plan")
            .order_by("-expires_at")
            .first()
        )

        if not subscription:

            return Response({
                "has_subscription": False,
                "subscription": None,
            })

        return Response({
            "has_subscription": True,
            "subscription": (
                SubscriptionSerializer(
                    subscription
                ).data
            ),
        })


# ============================================
# Purchase Subscription
# ============================================

class PurchaseSubscriptionView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request):

        try:
            plan_id = UUID(str(request.data.get("plan_id")))
        except (TypeError, ValueError):
            return Response(
                {"status": "error", "message": "شناسهٔ طرح معتبر نیست."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------
        # Get active plan
        # ----------------------------------------

        try:

            plan = (
                SubscriptionPlan.objects
                .get(
                    id=plan_id,
                    is_active=True,
                )
            )

        except SubscriptionPlan.DoesNotExist:

            return Response(
                {
                    "status": "error",
                    "message": (
                        "Subscription plan "
                        "not found."
                    ),
                },
                status=(
                    status.HTTP_404_NOT_FOUND
                ),
            )

        # ----------------------------------------
        # Get or create wallet
        # ----------------------------------------

        wallet, created = (
            Wallet.objects
            .select_for_update()
            .get_or_create(
                user=request.user,
                defaults={
                    "balance": 0
                },
            )
        )

        # ----------------------------------------
        # Check balance
        # ----------------------------------------

        if wallet.balance < plan.price:

            return Response(
                {
                    "status": "error",
                    "message": (
                        "Insufficient balance."
                    ),
                    "balance": str(
                        wallet.balance
                    ),
                    "required": str(
                        plan.price
                    ),
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        # ----------------------------------------
        # Current time
        # ----------------------------------------

        now = timezone.now()

        # ----------------------------------------
        # Check existing active subscription
        # ----------------------------------------

        existing_subscription = (
            Subscription.objects
            .filter(
                user=request.user,
                status="ACTIVE",
                expires_at__gt=now,
            )
            .select_for_update()
            .order_by("-expires_at")
            .first()
        )

        if existing_subscription:

            return Response(
                {
                    "status": "error",
                    "message": (
                        "You already have "
                        "an active subscription."
                    ),
                    "subscription": (
                        SubscriptionSerializer(
                            existing_subscription
                        ).data
                    ),
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        # ----------------------------------------
        # Calculate expiration
        # ----------------------------------------

        expires_at = (
            now
            + timezone.timedelta(
                days=plan.duration_days
            )
        )

        # ----------------------------------------
        # Create subscription
        # ----------------------------------------

        subscription = (
            Subscription.objects.create(
                user=request.user,
                plan=plan,
                status="ACTIVE",
                started_at=now,
                expires_at=expires_at,
            )
        )

        # ----------------------------------------
        # Deduct wallet balance
        # ----------------------------------------

        wallet.balance -= plan.price

        wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        # ----------------------------------------
        # Create wallet transaction
        # ----------------------------------------

        WalletTransaction.objects.create(
            wallet=wallet,
            amount=-plan.price,
            transaction_type=(
                "SUBSCRIPTION_PURCHASE"
            ),
            description=(
                f"Subscription purchase: "
                f"{plan.name}"
            ),
        )

        # ----------------------------------------
        # Create payment
        # ----------------------------------------

        payment = Payment.objects.create(
            user=request.user,
            subscription=subscription,
            amount=plan.price,
            status="SUCCESS",
            paid_at=now,
        )

        # ----------------------------------------
        # Response
        # ----------------------------------------

        return Response(
            {
                "status": "success",
                "message": (
                    "Subscription purchased "
                    "successfully."
                ),
                "balance": str(
                    wallet.balance
                ),
                "payment_id": str(
                    payment.id
                ),
                "subscription": (
                    SubscriptionSerializer(
                        subscription
                    ).data
                ),
            },
            status=(
                status.HTTP_201_CREATED
            ),
        )