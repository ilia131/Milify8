"use client";

import Image from "next/image";
import { ListMusic, Music2, Pause, Play, Repeat1, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { type Song, setVolume, togglePlay, toggleRepeatOne, toggleShuffle } from "@/redux/features/playerSlice";

type Props = {
  song: Song;
  seek: (fraction: number) => void;
  previous: () => void;
  next: () => void;
  openQueue: () => void;
  openDetails: () => void;
  formatTime: (time: number) => string;
};

export default function DesktopPlayer({ song, seek, previous, next, openQueue, openDetails, formatTime }: Props) {
  const dispatch = useAppDispatch();
  const { isPlaying, volume, repeatOne, shuffle, currentTime, duration } = useAppSelector((state) => state.player);

  return (
    <aside aria-label="پخش‌کننده موسیقی" className="fixed inset-x-0 bottom-0 z-50 hidden grid-cols-[1fr_2fr_1fr] items-center gap-5 border-t border-white/10 bg-[#131818] px-6 py-2.5 lg:grid">
      <button type="button" onClick={openDetails} className="flex min-w-0 items-center gap-3 text-start">
        {song.image_url ? <Image src={song.image_url} alt="" width={48} height={48} className="rounded-lg object-cover" /> :
          <Music2 className="size-12 rounded-lg bg-white/10 p-3" />}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold" dir="auto">{song.title}</span>
          <span className="block truncate text-xs text-white/60" dir="auto">{song.artistname}</span>
        </span>
      </button>
      <div>
        <div className="flex items-center justify-center gap-4">
          <button type="button" aria-label="پخش تصادفی" aria-pressed={shuffle} onClick={() => dispatch(toggleShuffle())}><Shuffle size={17} className={shuffle ? "text-emerald-300" : "text-white/60"} /></button>
          <button type="button" aria-label="آهنگ قبلی" onClick={previous}><SkipBack size={20} /></button>
          <button type="button" aria-label={isPlaying ? "مکث" : "پخش"} className="rounded-full bg-emerald-300 p-2 text-black" onClick={() => dispatch(togglePlay())}>{isPlaying ? <Pause size={19} /> : <Play size={19} />}</button>
          <button type="button" aria-label="آهنگ بعدی" onClick={next}><SkipForward size={20} /></button>
          <button type="button" aria-label="تکرار آهنگ" aria-pressed={repeatOne} onClick={() => dispatch(toggleRepeatOne())}><Repeat1 size={17} className={repeatOne ? "text-emerald-300" : "text-white/60"} /></button>
        </div>
        <div dir="ltr" className="mt-1 flex items-center gap-2 text-xs text-white/60">
          <span>{formatTime(currentTime)}</span>
          <input type="range" aria-label="موقعیت پخش" className="min-w-0 flex-1 accent-emerald-300" min={0} max={duration || 1} step={0.1} value={Math.min(currentTime, duration)} disabled={!duration} onChange={(event) => seek(event.target.valueAsNumber / duration)} />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <button type="button" aria-label="صف پخش" onClick={openQueue}><ListMusic size={21} /></button>
        <Volume2 size={19} aria-hidden />
        <input dir="ltr" type="range" aria-label="بلندی صدا" className="w-24 accent-emerald-300" min={0} max={1} step={0.01} value={volume} onChange={(event) => dispatch(setVolume(event.target.valueAsNumber))} />
      </div>
    </aside>
  );
}
