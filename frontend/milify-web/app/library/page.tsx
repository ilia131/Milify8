"use client";

import { Suspense, useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FilterItem } from "@/components/FilterSlider/types";
import ArtistLibrary from "@/components/Library/ArtistLibrary";
import HeaderSection from "@/components/Library/HeaderSection";
import ModalPlayList from "@/components/Library/ModalPlayList";

import {
  useCreatePlaylistMutation,
  useGetUserPlaylistsQuery,
} from "@/redux/services/playlistApiSlice";

import { useGetFavArtistsQuery } from "@/redux/services/artistApislice";

import type { Artist } from "@/redux/services/artistApislice";
import type { Playlist } from "@/redux/services/playlistApiSlice";

import { useToast } from "@/components/ToastProvider/ToastProvider";

const filters = [
  {
    name: "پلی‌لیست‌ها",
    href: "/browse",
    height: "h-[35px]",
    padding: "px-4",
    width: "w-[85px]",
  },
  {
    name: "هنرمندان",
    href: "/browse/music",
    height: "h-[34px]",
    padding: "px-4",
    width: "w-[73px]",
  },
];

const Library = ({ view }: { view: string | null }) => {
  const artistQuery = useGetFavArtistsQuery(0);
  const { data: artists } = artistQuery;

  const playlistQuery = useGetUserPlaylistsQuery(0);
  const { data: playList } = playlistQuery;

  const [activeFilter, setActiveFilter] =
    useState<FilterItem | null>(() => view === "playlists" ? filters[0] : view === "artists" ? filters[1] : null);

  const [isSearching, setIsSearching] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [isOpen, setIsOpen] =
    useState(false);

  const [createPlaylist, { isLoading: creatingPlaylist }] =
    useCreatePlaylistMutation();

  const { success, error } =
    useToast();

  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const showArtists =
    !activeFilter ||
    activeFilter.name === "هنرمندان";

  const showPlaylists =
    !activeFilter ||
    activeFilter.name === "پلی‌لیست‌ها";

  // =========================================================
  // Artists
  // =========================================================

  const filteredArtists = useMemo(() => {
    if (!showArtists) return [];

    const artistList =
      (artists ?? []) as Artist[];

    if (!normalizedSearch) {
      return artistList;
    }

    return artistList.filter((artist) =>
      artist.artistname
        ?.toLowerCase()
        .includes(normalizedSearch)
    );
  }, [
    artists,
    normalizedSearch,
    showArtists,
  ]);

  // =========================================================
  // Playlists
  // =========================================================

  const filteredPlaylists = useMemo(() => {
    if (!showPlaylists) return [];

    const playlistList =
      (playList ?? []) as Playlist[];

    if (!normalizedSearch) {
      return playlistList;
    }

    return playlistList.filter(
      (playlist) =>
        playlist.name
          ?.toLowerCase()
          .includes(normalizedSearch)
    );
  }, [
    playList,
    normalizedSearch,
    showPlaylists,
  ]);

  // =========================================================
  // Filter
  // =========================================================

  const handleClick = (
    item: FilterItem
  ) => {
    setActiveFilter(item);
  };

  const handleClose = () => {
    setActiveFilter(null);
  };

  // =========================================================
  // Create Playlist
  // =========================================================

  const handleCreatePlaylist = async (
    name: string
  ) => {
    try {
      await createPlaylist({
        name,
      }).unwrap();

      setIsOpen(false);

      success(
        "پلی‌لیست ساخته شد."
      );
    } catch {
      error("ساخت پلی‌لیست انجام نشد. دوباره تلاش کنید.");
    }
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <main className="milify-page">
      <HeaderSection
        filters={filters}
        activeFilter={activeFilter}
        handleClick={handleClick}
        handleClose={handleClose}
        handleOpen={setIsOpen}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="my-4 flex flex-wrap gap-2">
        <Link href="/library/recent" className="milify-chip">آخرین پخش‌ها</Link>
        <Link href="/library/following" className="milify-chip">هنرمندان دنبال‌شده</Link>
        <Link href="/browse/albums" className="milify-chip">آلبوم‌ها</Link>
      </div>
      {(artistQuery.isLoading || playlistQuery.isLoading) && <p role="status">در حال دریافت کتابخانه…</p>}
      {artistQuery.isError && <button type="button" className="underline" onClick={artistQuery.refetch}>دریافت دوبارهٔ هنرمندان</button>}
      {playlistQuery.isError && <button type="button" className="underline" onClick={playlistQuery.refetch}>دریافت دوبارهٔ پلی‌لیست‌ها</button>}
      {!artistQuery.isFetching && !playlistQuery.isFetching && !artistQuery.isError && !playlistQuery.isError &&
        !filteredArtists.length && !filteredPlaylists.length && <p className="mb-3 text-[var(--milify-muted)]">موردی برای نمایش در این فیلتر وجود ندارد.</p>}
      <ArtistLibrary
        artist={filteredArtists}
        playlist={filteredPlaylists}
      />

      {isOpen && (
        <ModalPlayList
          busy={creatingPlaylist}
          onClose={() =>
            setIsOpen(false)
          }
          onCreate={
            handleCreatePlaylist
          }
        />
      )}
    </main>
  );
};

function LibraryView() {
  const view = useSearchParams().get("view");
  return <Library key={view} view={view} />;
}

export default function LibraryPage() {
  return <Suspense fallback={<p role="status" className="milify-page">در حال دریافت کتابخانه…</p>}><LibraryView /></Suspense>;
}