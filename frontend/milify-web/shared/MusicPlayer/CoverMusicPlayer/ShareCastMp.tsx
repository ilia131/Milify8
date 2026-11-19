import {
  ListMusic,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setVolume } from "@/redux/features/playerSlice";

const ShareCastMp = ({
  setIsOpenLyric,
  setIsOpenQueue,
}: {
  setIsOpenLyric: (isOpenLyric: boolean) => void;
  setIsOpenQueue: (isOpenQueue: boolean) => void;
}) => {
  const dispatch = useAppDispatch();
  const volume = useAppSelector((state) => state.player.volume);
  return (
    <div
      className="
        mt-4
        flex
        items-center
        justify-between
        px-1

      "
    >
      {/* Lyrics */}

      <button
        type="button"
        onClick={() => setIsOpenLyric(true)}
        className="
          group
          flex
          items-center
          gap-2
          rounded-full
          px-4
          py-2
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-white/10
          active:scale-95
        "
      >
        <span>
          متن آهنگ
        </span>

        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-[#1ed760]
            opacity-0
            transition
            group-hover:opacity-100
          "
        />
      </button>

      <input dir="ltr" type="range" aria-label="بلندی صدا" className="w-20 accent-emerald-300"
        min={0} max={1} step={0.01} value={volume}
        onChange={(event) => dispatch(setVolume(event.target.valueAsNumber))} />

      {/* Queue */}

      <button
        type="button"
        onClick={() => setIsOpenQueue(true)}
        aria-label="صف پخش"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-white
          transition
          hover:bg-white/10
          active:scale-90
        "
      >
        <ListMusic size={22} />
      </button>
    </div>
  );
};

export default ShareCastMp;