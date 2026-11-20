"use client";

import { useParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { setQueue } from "@/redux/features/playerSlice";
import { useGetAlbumDetailQuery } from "@/redux/services/artistApislice";
import AlbumHero from "@/entities/albums/ui/album-hero";
import AlbumsRows from "@/entities/albums/ui/album-rows";
import SkeletonSection from "@/shared/ui/Skeleton/SkeletonSection";

export default function AlbumPage() {
  const { artistname, album_name } = useParams<{ artistname: string; album_name: string }>();
  const album = useGetAlbumDetailQuery({ artist: encodeURIComponent(artistname), albums: encodeURIComponent(album_name) });
  const dispatch = useAppDispatch();
  const songs = album.data?.tracks ?? [];

  return <main className="milify-page">
    {album.isLoading ? <SkeletonSection title="در حال دریافت آلبوم" /> : album.isError || !album.data ?
      <p role="alert">آلبوم دریافت نشد. <button type="button" className="underline" onClick={album.refetch}>تلاش دوباره</button></p> :
      <>
        <AlbumHero image={album.data.cover || "/Icons/milify-192.png"} title={album.data.title} artist={artistname} />
        <button type="button" className="milify-chip my-4 !bg-[var(--milify-green)] font-bold text-black disabled:opacity-50"
          disabled={!songs.length} onClick={() => dispatch(setQueue({ songs }))}>پخش آلبوم</button>
        {songs.length ? <AlbumsRows songs={songs} /> : <p className="text-[var(--milify-muted)]">این آلبوم هنوز آهنگی ندارد.</p>}
      </>}
  </main>;
}
