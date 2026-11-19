from users.panels import IsAdminPanel
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Advertiser,
    Campaign,
    Advertisement,
    AdImpression,
    AdClick,
)

from .serializers import (
    AdvertiserSerializer,
    CampaignSerializer,
    AdvertisementSerializer,
)


class AdvertiserListCreateView(APIView):
    permission_classes = [IsAdminPanel]

    def get(self, request):

        advertisers = Advertiser.objects.filter(
            is_active=True
        ).order_by("-created_at")

        serializer = AdvertiserSerializer(
            advertisers,
            many=True,
            context={"request": request}
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = AdvertiserSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        advertiser = serializer.save()

        return Response(
            AdvertiserSerializer(
                advertiser,
                context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED
        )


class CampaignListCreateView(APIView):
    permission_classes = [IsAdminPanel]

    def get(self, request):

        campaigns = Campaign.objects.select_related(
            "advertiser"
        ).order_by("-created_at")

        serializer = CampaignSerializer(
            campaigns,
            many=True
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = CampaignSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        campaign = serializer.save()

        return Response(
            CampaignSerializer(campaign).data,
            status=status.HTTP_201_CREATED
        )





class AdvertisementListCreateView(APIView):

    def get(self, request):

        is_authenticated = request.user.is_authenticated

         

        if is_authenticated:
          

            if request.user.has_active_subscription:
                return Response([])

        # -----------------------------------------
        # Base Query
        # -----------------------------------------

        ads = Advertisement.objects.select_related(
            "campaign",
            "campaign__advertiser",
        ).filter(
            is_active=True,
        )

 
        # -----------------------------------------
        # DEBUG: نمایش تبلیغات موجود
        # -----------------------------------------


        # -----------------------------------------
        # Placement
        # -----------------------------------------

        placement = request.query_params.get("placement")

        

        if placement:
            placement = placement.strip()

            ads = ads.filter(
                placement__iexact=placement
            )

        
        # -----------------------------------------
        # Campaign
        # -----------------------------------------

        now = timezone.now()
 

        ads = ads.filter(
            campaign__status="ACTIVE",
            campaign__start_at__lte=now,
            campaign__end_at__gte=now,
        )

       

        # -----------------------------------------
        # DEBUG: تبلیغات نهایی
        # -----------------------------------------

        # for ad in ads:
        #     print(
        #         "FINAL AD:",
        #         ad.id,
        #         "| placement:",
        #         repr(ad.placement),
        #         "| campaign:",
        #         ad.campaign_id,
        #     )

        # -----------------------------------------
        # Response
        # -----------------------------------------

        serializer = AdvertisementSerializer(
            ads,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(serializer.data)




class AdvertisementDetailView(APIView):

    def get(self, request, pk):

        ad = get_object_or_404(
            Advertisement,
            pk=pk
        )

        serializer = AdvertisementSerializer(
            ad,
            context={"request": request}
        )

        return Response(
            serializer.data
        )
        

class AdImpressionView(APIView):

    def post(self, request, ad_id):

        ad = get_object_or_404(
            Advertisement,
            id=ad_id,
            is_active=True
        )

        session_id = request.data.get(
            "session_id"
        )

        watched_seconds = int(
            request.data.get(
                "watched_seconds",
                0
            )
        )

        watched_percentage = int(
            request.data.get(
                "watched_percentage",
                0
            )
        )

        completed = bool(
            request.data.get(
                "completed",
                False
            )
        )

        impression = AdImpression.objects.create(
            ad=ad,
            user=(
                request.user
                if request.user.is_authenticated
                else None
            ),
            session_id=session_id,
            watched_seconds=watched_seconds,
            watched_percentage=watched_percentage,
            completed=completed,
        )

        return Response(
            {
                "status": "ok",
                "impression_id": str(
                    impression.id
                ),
            },
            status=status.HTTP_201_CREATED
        )


class AdClickView(APIView):

    def post(self, request, ad_id):

        ad = get_object_or_404(
            Advertisement,
            id=ad_id,
            is_active=True
        )

        session_id = request.data.get(
            "session_id"
        )

        click = AdClick.objects.create(
            ad=ad,
            user=(
                request.user
                if request.user.is_authenticated
                else None
            ),
            session_id=session_id,
        )

        return Response(
            {
                "status": "ok",
                "target_url": ad.target_url,
                "click_id": str(click.id),
            },
            status=status.HTTP_201_CREATED
        )