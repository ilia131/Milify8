"use client";

import CardSlider from "@/shared/CardSlider/CardSlider";
import CardSection from "@/shared/CardSection/CardSection";
import MoreLikeCard from "@/shared/MoreLikeCard/MoreLikeCard";
import ArtistMiniCard from "../ArtistMiniCard/ArtistMiniCard";

import { useAppSelector } from "@/redux/hook";
import { useLanguage } from "@/i18n/LanguageProvider";

import BigCardArtist from "./BigCardArtist/BigCardArtist";

import {
  useArtistsQuery,
  useGetAlbumsListQuery,
  useGetBigCardArtistsQuery,
  useGetFreshTrackQuery,
  useGetPopularAlbumQuery,
  useGetTredingTrackQuery,
  useGetFavArtistsQuery,
} from "@/redux/services/artistApislice";

import CardSectionPA from "@/entities/albums/ui/card-section-popular-albums";
import SkeletonSection from "@/shared/ui/Skeleton/SkeletonSection";

export default function FilterSlider() {
  const { t } = useLanguage();

  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: artists } = useGetFavArtistsQuery(0, { skip: !authenticated });

  const latestArtist =
    artists?.[artists.length - 1];

  const {
    data,
    error,
    isLoading,
    refetch,
  } = useArtistsQuery();

  const {
    data: FreshTrack,
  } = useGetFreshTrackQuery();

  const {
    data: Trending,
  } = useGetTredingTrackQuery();

  const { data: newAlbums } = useGetAlbumsListQuery();

  const {
    data: PopularAlbum,
  } = useGetPopularAlbumQuery();

  const {
    data: bigArtists,
  } = useGetBigCardArtistsQuery();

  const sliderData = data?.slice(0,10);

  if (isLoading) {
    return (
      <div className="px-4 pt-4">
        <SkeletonSection
          title={t("home.freshTracks")}
        />

        <SkeletonSection
          title={t("home.trendingHits")}
        />

        <SkeletonSection
          title={t("home.popularAlbums")}
        />

        <SkeletonSection
          title={t("home.favoriteArtists")}
        />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-0 relative hide-scrollbar pt-4 animate-[fadeIn_.4s_ease]">

      {error && <p role="alert" className="pb-2 text-sm text-[var(--milify-muted)]">{t("home.errorLoadingArtists")}{" "}<button type="button" className="underline" onClick={refetch}>تلاش دوباره</button></p>}
      <ArtistMiniCard />

      {FreshTrack && FreshTrack.length > 0 && (
        <CardSection
          title={t("home.freshTrackFriday")}
          items={FreshTrack}
          variant="track"
          variant2="freshtrack"
          
         />
      )}

      {Trending && Trending.length > 0 && (
        <CardSection
          title={t("home.trendingHits")}
          items={Trending}
          variant="track"
          variant2="trending"
          
        />
      )}

      {!!newAlbums?.length && <CardSectionPA title="آلبوم‌های تازه" items={newAlbums.slice(0, 6)} />}

      {PopularAlbum && PopularAlbum.length > 0 && (
        <CardSectionPA
          title={t("home.popularAlbums")}
          items={PopularAlbum}
        />
      )}

      {latestArtist && (
        <MoreLikeCard
          images={latestArtist.profile_pic}
          subtitle={t("home.moreLike")}
          label={latestArtist.artistname}
        />
      )}

      {sliderData && sliderData.length > 0 && (
        <CardSlider
          cardimages={sliderData}
          title={t("home.yourFavoriteArtists")}
          variant="avatar"

        />
      )}

      <div className="pb-8">
        {bigArtists?.slice(0,5).map((artist) => {
          const firstTrackImage =
            artist.top_tracks?.[0]?.image_url;

          const firstTrack =
            artist.top_tracks?.[0];

          const album_name =
            artist.top_tracks?.[0]?.album_name;

          return (
            <BigCardArtist
              key={artist.id}
              item={{
                name: artist.artistname,
                pic: artist.profile_pic_url,
                bg:
                  firstTrackImage ||
                  artist.background ||
                  "",
                firstTrack,
                album_name,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}