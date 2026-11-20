"use client";

import MusicRowCard from "@/components/Artist/ArtistTabs/MusicRowCard";
import SkeletonSection from "@/shared/ui/Skeleton/SkeletonSection";
import { useGetRecentlyPlayedQuery } from "@/redux/services/songApiSlice";

export default function RecentPage() {
  const history = useGetRecentlyPlayedQuery();
  const songs = history.data?.map(({ song }) => song) ?? [];

  return <main className="milify-page">
    <h1 className="text-3xl font-black">آخرین پخش‌ها</h1>
    {history.isLoading ? <SkeletonSection title="در حال دریافت تاریخچه" /> :
      history.isError ? <p role="alert" className="mt-4">
        تاریخچه دریافت نشد. <button type="button" className="underline" onClick={history.refetch}>تلاش دوباره</button>
      </p> : songs.length ? <div className="mt-5 grid gap-3">
        {history.data?.map(({ id, song }, index) => <MusicRowCard key={id} item={song} songs={songs} index={index} />)}
      </div> :
        <p className="mt-4 text-[var(--milify-muted)]">آهنگ‌هایی که پخش می‌کنید اینجا نمایش داده می‌شوند.</p>}
  </main>;
}
