"use client";

import { useDominantColorFromImage } from "@/shared/hooks/useDominantColorFromImage"
import RightButtonMPlayer from "./RightButtonMPlayer";
import LeftButtonMPlayer from "./LeftButtonMPlayer";
import MusicBarMp from "./MusicBarMp";
import { Song } from "@/redux/features/playerSlice";
import { useAppSelector } from "@/redux/hook";
interface MiniPlayerProps {
  currentSong: Song
  progress: number;
  onOpenCover: () => void;
}

const MiniPlayer = ({
  currentSong,
  progress,
  onOpenCover,
}: MiniPlayerProps) => {

  useDominantColorFromImage(currentSong?.image_url)
  const { color } = useAppSelector(state => state.player)

  return (
    <aside
      aria-label="پخش‌کنندهٔ کوچک"
      className="fixed inset-x-2 bottom-[calc(var(--milify-nav-height)+.5rem)] z-40 flex items-center gap-2 overflow-hidden rounded-xl px-2 py-1"
      style={{
        background: `
          linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
          ${color}
        `,
        transition: "background 600ms ease"
      }}
    >
      <button type="button" aria-label={`باز کردن پخش‌کنندهٔ ${currentSong.title}`} onClick={onOpenCover}
        className="min-w-0 flex-1 text-start">
        <RightButtonMPlayer currentSong={currentSong} />
      </button>
      <LeftButtonMPlayer />
      <MusicBarMp progress={progress} />
    </aside>
  );
};

export default MiniPlayer;
