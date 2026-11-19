"use client";

import AlbumCards from "@/entities/albums/ui/card-section-popular-albums";
import { useGetPopularAlbumQuery } from "@/redux/services/artistApislice";

export default function AlbumsPage() {
  const albums = useGetPopularAlbumQuery();

  return (
    <main className="min-h-dvh px-4 pb-32 pt-24 lg:px-0 lg:pt-5">
      {albums.isLoading ? <p role="status">در حال بارگذاری آلبوم‌ها…</p> :
        albums.isError ? <button type="button" className="text-emerald-300" onClick={() => albums.refetch()}>بارگذاری انجام نشد. تلاش دوباره</button> :
        albums.data?.length ? <AlbumCards title="آلبوم‌های محبوب" items={albums.data} /> :
        <p>آلبومی برای نمایش وجود ندارد.</p>}
    </main>
  );
}
