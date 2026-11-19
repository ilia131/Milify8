import { type RefObject, useEffect, useState } from "react";
import { pausePlayback, type Song } from "@/redux/features/playerSlice";
import { useAppDispatch } from "@/redux/hook";
import { useGetSongPlayerQuery, useGetSongSubscriptionAccessQuery } from "@/redux/services/artistApislice";

export function useAudioCore(
  audioRef: RefObject<HTMLAudioElement | null>,
  song: Song | undefined,
  isPlaying: boolean,
  volume: number,
) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const { currentData: access, isFetching } = useGetSongSubscriptionAccessQuery(
    song?.unique_id ?? "",
    { skip: !song?.unique_id || !song.is_subscription_only },
  );
  const canPlay = !song?.is_subscription_only || access?.can_play === true;
  const locked = song?.is_subscription_only === true;
  const { currentData: playback, isFetching: isLoadingSource } = useGetSongPlayerQuery(
    song?.unique_id ?? "",
    { skip: !locked || !canPlay || !song?.unique_id, refetchOnMountOrArgChange: true },
  );
  const source = canPlay ? (locked ? playback?.track_url : song?.track_url) : undefined;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const reportError = () => {
      if (!song?.unique_id) return;
      setError({ id: song.unique_id, message: "پخش آهنگ انجام نشد. دوباره تلاش کنید." });
      dispatch(pausePlayback());
    };

    if (!source) {
      audio.pause();
      if (audio.hasAttribute("src")) {
        audio.removeAttribute("src");
        audio.load();
      }
      return;
    }

    audio.addEventListener("error", reportError);
    if (audio.getAttribute("src") !== source) {
      audio.src = source;
      audio.load();
    }

    let cancelled = false;
    if (isPlaying) {
      audio.play().then(() => {
        if (!cancelled) setError(null);
      }).catch((failure: unknown) => {
        if (!cancelled && !(failure instanceof DOMException && failure.name === "AbortError")) {
          reportError();
        }
      });
    } else {
      audio.pause();
    }

    return () => {
      cancelled = true;
      audio.removeEventListener("error", reportError);
    };
  }, [audioRef, dispatch, isPlaying, song?.unique_id, source]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.min(1, Math.max(0, volume));
  }, [audioRef, volume]);

  const seek = (fraction: number) => {
    const audio = audioRef.current;
    if (audio && source && Number.isFinite(audio.duration)) {
      audio.currentTime = Math.min(1, Math.max(0, fraction)) * audio.duration;
    }
  };

  const seekFromEvent = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    if (width) seek((event.clientX - left) / width);
  };

  const playbackError = song && !isFetching && !canPlay ? "برای پخش این آهنگ به اشتراک نیاز دارید." :
    song && canPlay && !source && !isLoadingSource ? "فایل این آهنگ در دسترس نیست." :
    error?.id === song?.unique_id ? error?.message : undefined;

  return { seek, seekFromEvent, playbackError };
}
