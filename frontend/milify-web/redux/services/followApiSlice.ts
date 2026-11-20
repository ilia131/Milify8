import { apiSlice } from "./apiSlice";

interface FollowedArtist {
  id: number;
  artist_uuid: string;
  artist_name: string;
}

export const followApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    followArtist: builder.mutation({
      query: (artist_id) => ({
        url: `/artists/${artist_id}/follow/`,
        method: "POST",
      }),
      invalidatesTags: ["ArtistFollows"],
    }),

    getArtistFollowers: builder.query({
      query: (artist_id) => `/artists/${artist_id}/followers/`,
    }),

    isFollowing: builder.query({
      query: (artist_id) => `/artists/${artist_id}/is-following/`,
    }),

    getUserFollowing: builder.query<FollowedArtist[], void>({
      query: () => `/artists/following/`,
      providesTags: ["ArtistFollows"],
    }),

  }),
});

export const {
  useFollowArtistMutation,
  useGetArtistFollowersQuery,
  useIsFollowingQuery,
  useGetUserFollowingQuery,
} = followApiSlice;
