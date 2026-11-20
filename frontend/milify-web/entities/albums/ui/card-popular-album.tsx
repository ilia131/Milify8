"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useAppDispatch } from "@/redux/hook";
import { setQueue } from "@/redux/features/playerSlice";
import type { Album } from "@/redux/services/artistApislice";

export default function AlbumCard({ item }: { item: Album }) {
  const dispatch = useAppDispatch();
  const artist = item.artist?.[0]?.name;
  const href = artist ? `/album/${encodeURIComponent(artist)}/${encodeURIComponent(item.title)}` : undefined;
  const cover = <Image src={item.cover || "/Icons/milify-192.png"} width={180} height={180} alt=""
    className="aspect-square w-full rounded-lg object-cover" />;

  return <article className="milify-track-card">
    <div className="relative">
      {href ? <Link href={href} aria-label={item.title}>{cover}</Link> : cover}
      {!!item.tracks?.length && <button type="button" aria-label={`پخش آلبوم ${item.title}`}
        className="milify-play milify-card-action" onClick={() => dispatch(setQueue({ songs: item.tracks }))}>
        <Play size={16} fill="currentColor" />
      </button>}
    </div>
    {href ? <Link href={href} className="truncate text-sm font-semibold" dir="auto">{item.title}</Link> :
      <p className="truncate text-sm font-semibold" dir="auto">{item.title}</p>}
    {artist && <p className="truncate text-xs text-[var(--milify-muted)]" dir="auto">{artist}</p>}
  </article>;
}
