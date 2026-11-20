"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useGetUserFollowingQuery } from "@/redux/services/followApiSlice";

export default function FollowingPage() {
  const artists = useGetUserFollowingQuery();
  return <main className="milify-page">
    <h1 className="mb-4 text-3xl font-black">هنرمندان دنبال‌شده</h1>
    {artists.isLoading ? <p role="status">در حال دریافت فهرست هنرمندان…</p> :
      artists.isError ? <p role="alert">فهرست دریافت نشد.{" "}
        <button type="button" className="underline" onClick={artists.refetch}>تلاش دوباره</button>
      </p> : artists.data?.length ? <ul className="grid gap-2 sm:grid-cols-2">
        {artists.data.map((artist) => <li key={artist.id} className="min-w-0">
          <Link href={`/artist/${encodeURIComponent(artist.artist_name)}`} className="catalog-result bg-[var(--milify-card)]">
            <UserRound className="catalog-thumb p-3" aria-hidden />
            <span dir="auto" className="truncate">{artist.artist_name}</span>
          </Link>
        </li>)}
      </ul> : <p className="text-[var(--milify-muted)]">هنوز هنرمندی را دنبال نکرده‌اید.</p>}
  </main>;
}
