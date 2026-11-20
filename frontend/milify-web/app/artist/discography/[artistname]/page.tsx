"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useGetArtistAlbumsInfiniteQuery, useGetArtistSongsInfiniteQuery } from "@/redux/services/artistContentApiSlice";
import AlbumCards from "@/entities/albums/ui/card-section-popular-albums";
import CardSection from "@/shared/CardSection/CardSection";
import SkeletonSection from "@/shared/ui/Skeleton/SkeletonSection";

export default function DiscographyPage() {
  const { artistname } = useParams<{ artistname: string }>();
  const slug = encodeURIComponent(artistname);
  const songs = useGetArtistSongsInfiniteQuery(artistname);
  const albums = useGetArtistAlbumsInfiniteQuery(artistname);
  const songItems = songs.data?.pages[0]?.results ?? [];
  const albumItems = albums.data?.pages[0]?.results ?? [];

  return <main className="milify-page space-y-6">
    <header className="milify-welcome !mx-0">
      <div className="min-w-0">
        <Link href={`/artist/${slug}`} className="mb-3 inline-flex min-h-11 max-w-full items-center gap-2 hover:underline">
          <ArrowRight size={18} className="shrink-0" /><bdi className="truncate">{artistname}</bdi>
        </Link>
        <h1 className="text-3xl font-black sm:text-5xl">دیسکوگرافی</h1>
      </div>
    </header>
    <nav aria-label="آثار هنرمند" className="flex flex-wrap gap-2">
      <Link href={`/artist/discography/${slug}/songs`} className="milify-chip">همهٔ آهنگ‌ها</Link>
      <Link href={`/artist/discography/${slug}/albums`} className="milify-chip">همهٔ آلبوم‌ها</Link>
    </nav>
    {songs.isLoading ? <SkeletonSection title="در حال دریافت آهنگ‌ها" /> :
      songs.isError ? <p role="alert">آهنگ‌ها دریافت نشدند. <button type="button" className="underline" onClick={() => void songs.refetch()}>تلاش دوباره</button></p> :
      songItems.length ? <CardSection title="آهنگ‌ها" items={songItems} variant="track" /> :
      <p className="text-[var(--milify-muted)]">هنوز آهنگی منتشر نشده است.</p>}
    {albums.isLoading ? <SkeletonSection title="در حال دریافت آلبوم‌ها" /> :
      albums.isError ? <p role="alert">آلبوم‌ها دریافت نشدند. <button type="button" className="underline" onClick={() => void albums.refetch()}>تلاش دوباره</button></p> :
      albumItems.length ? <AlbumCards title="آلبوم‌ها" items={albumItems.slice(0, 6)} /> :
      <p className="text-[var(--milify-muted)]">هنوز آلبومی منتشر نشده است.</p>}
  </main>;
}
