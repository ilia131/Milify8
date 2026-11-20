"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setQueue, Song } from "@/redux/features/playerSlice";

interface CardProps {
  item: Song;
  title: string;
  songs?: Song[];
  index?: number;
  isArtist?: boolean;
  variant?: "track" | "artist";
  variant2?: "trending" | "freshtrack";
}

const FreshTrackCard = ({
  item,
  title,
  songs,
  index,
  isArtist,
  variant,
  variant2,
}: CardProps) => {
  const [loaded, setLoaded] = useState(false);

  const dispatch = useDispatch();

  const handlePlay = () => {
    dispatch(
      setQueue({
        songs: songs?.length ? songs : [item],
        startIndex: index ?? 0,
      })
    );
  };

  const getTrackRoute = () => {
    if (variant2 === "trending") {
      return "/trending";
    }

    if (variant2 === "freshtrack") {
      return "/freshtrack";
    }

    return `/track/${item.unique_id}`;
  };

  const artistName =
    item.artistname ||
    item.artists?.[0] ||
    "";

  const songUniqueId =
    item.unique_id 

  const shouldPlayOnClick =
    variant === "track" &&
    variant2 !== "freshtrack" &&
    variant2 !== "trending";

  return (
    <div className="milify-track-card group min-w-0">
      <div className="relative">
      {shouldPlayOnClick || isArtist ? (
        <button
          type="button"
          aria-label={`پخش ${item.title ?? "آهنگ"}`}
          onClick={handlePlay}
          className="relative block aspect-square w-full overflow-hidden rounded-lg cursor-pointer"
        >
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-zinc-800 rounded-lg" />
          )}

          <Image
            src={item.image_url || "/Icons/milify-192.png"}
            width={158}
            height={151}
            alt={item.title || "کاور آهنگ"}
            unoptimized
            onLoad={() => setLoaded(true)}
            className="w-full h-full object-cover rounded-lg"
          />
        </button>
      ) : (
        <Link
          href={getTrackRoute()}
          className="relative block aspect-square w-full overflow-hidden rounded-lg"
        >
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-zinc-800 rounded-lg" />
          )}

          <Image
            src={item.image_url || "/Icons/milify-192.png"}
            width={158}
            height={151}
            alt={item.title || "کاور آهنگ"}
            unoptimized
            onLoad={() => setLoaded(true)}
            className="w-full h-full object-cover rounded-lg"
          />
        </Link>
      )}

      {shouldPlayOnClick && !isArtist ? <span aria-hidden className="milify-play milify-card-action pointer-events-none"><Play size={16} fill="currentColor" /></span>
        : !isArtist && <button type="button" className="milify-play milify-card-action" aria-label={`پخش ${item.title}`} onClick={handlePlay}><Play size={16} fill="currentColor" /></button>}
      </div>
      <div className="flex min-w-0 flex-col-reverse">
        {artistName && (
          <Link
            href={`/artist/${encodeURIComponent(artistName)}`}
            className="text-[var(--milify-muted)] text-xs truncate"
          >
            {item.artists?.length
              ? item.artists.join("، ")
              : artistName}
          </Link>
        )}

        {songUniqueId ? (
          <Link
            href={`/track/${songUniqueId}`}
            className="text-white font-semibold text-sm truncate"
          >
            {item.title}
          </Link>
        ) : (
          <span className="text-[rgba(255_255_255/0.55)] text-[13px] line-clamp-2">
            {item.title}
          </span>
        )}
      </div>
    </div>
  );
};

export default FreshTrackCard;