import { apiSlice } from "./apiSlice";
import type { Song } from "@/redux/features/playerSlice";
import type { Album } from "./artistApislice";

type DiscographyPage<T> = {
  next: string | null;
  results: T[];
};

const cursorOptions = {
  initialPageParam: null,
  getNextPageParam: (page: { next: string | null }) =>
    page.next ? new URL(page.next).searchParams.get("cursor") ?? undefined : undefined,
};

export const artistContentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getArtistSongs: builder.infiniteQuery<DiscographyPage<Song>, string, string | null>({
      infiniteQueryOptions: cursorOptions,
      query: ({ queryArg, pageParam }) => ({
        url: `artists/${encodeURIComponent(queryArg)}/songs/`,
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
    }),
    getArtistAlbums: builder.infiniteQuery<DiscographyPage<Album>, string, string | null>({
      infiniteQueryOptions: cursorOptions,
      query: ({ queryArg, pageParam }) => ({
        url: `artists/${encodeURIComponent(queryArg)}/albums/`,
        params: pageParam ? { cursor: pageParam } : undefined,
      }),
    }),
  }),
});

export const { useGetArtistSongsInfiniteQuery, useGetArtistAlbumsInfiniteQuery } = artistContentApiSlice;
