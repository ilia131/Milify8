import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { logout } from "@/redux/features/authSlice";
import { Mutex } from "async-mutex";

const mutex = new Mutex();
const backend = fetchBaseQuery({ baseUrl: "/backend-api/", credentials: "same-origin" });
const session = fetchBaseQuery({ baseUrl: "/api/auth/", credentials: "same-origin" });

export const sessionRequest = (url: string, body: object = {}) => ({
  url: `session/${url}`,
  method: "POST",
  body,
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    if (typeof args !== "string" && args.url.startsWith("session/")) {
      return mutex.runExclusive(async () =>
        session({ ...args, url: args.url.slice("session/".length) }, api, extraOptions),
      );
    }

    await mutex.waitForUnlock();
    const result = await backend(args, api, extraOptions);
    if (result.error?.status !== 401 || api.signal.aborted) return result;

    if (mutex.isLocked()) {
      await mutex.waitForUnlock();
      return backend(args, api, extraOptions);
    }

    const release = await mutex.acquire();
    try {
      const refresh = await session(
        { url: "refresh", method: "POST", body: {} },
        { ...api, signal: AbortSignal.timeout(20_000) },
        extraOptions,
      );
      if (refresh.error) {
        if (refresh.error.status === 401) api.dispatch(logout());
        return result;
      }
      return backend(args, api, extraOptions);
    } finally {
      release();
    }
  };

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [
    "RecentlyPlayed",
    "LikedSongs",
    "Playlists",
    "Playlist",
    "FavoriteArtists",
    "ArtistFollows",
    "PlayerAds",
    "SubscriptionPlans",
    "MySubscription",
    "ArtistSubscription",
    "SongSubscriptionAccess",
    "UserProfile",
    "Beats",
    "Beat",
    "Producers",
    "Producer",
    "ProducerBeats",
    "MyBeatPurchases",
    "Notifications",
    "ShortVideo",
    "ShortVideoComments",
    "ShortVideoComment",
  ],
});