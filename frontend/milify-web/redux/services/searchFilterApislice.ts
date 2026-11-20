import type { Song } from "@/redux/features/playerSlice";
import type { Album, Artist } from "./artistApislice";
import { apiSlice } from "./apiSlice";

type SearchResults = {
  top_result: (Song & { type: "song" }) | (Artist & { type: "artist" }) | null;
  songs: { results: Song[] };
  artists: { results: Artist[] };
};

export const SearchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSearch: builder.query<SearchResults, string>({
      query: (q) => ({ url: "search/", params: { q } }),
    }),
    searchAlbums: builder.query<Album[], string>({
      query: (title) => ({ url: "albums/popular/detail/", params: { title } }),
    }),
  }),
});

export const { useGetSearchQuery, useSearchAlbumsQuery } = SearchApiSlice;
