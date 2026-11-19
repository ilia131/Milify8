import Shuffle from "@/public/Icons/Shuffle";
import BackButtonIcon from "@/public/Icons/BackButtonIcon";
import PauseCircle from "@/public/Icons/PauseCircle";
import NextButtonIcon from "@/public/Icons/NextButtonIcon";
import { Repeat1 } from "lucide-react";
import PlayCircle from "@/public/Icons/PlayCircle";

import {
  useAppDispatch,
  useAppSelector,
} from "@/redux/hook";

import {
  togglePlay,
  toggleShuffle,
  toggleRepeatOne,
} from "@/redux/features/playerSlice";

const MpPlayerButtons = ({
  onNext,
  onPrevious
}: {
  onNext: () => void;
  onPrevious :  ()=>void

}) => {
  const dispatch = useAppDispatch();

  const {
    isPlaying,
    queue,
    shuffle,
    repeatOne,
  } = useAppSelector(
    (state) => state.player
  );

  const disabled =
    queue.length === 0;

  return (
    <div className="flex justify-between mt-2 mx-1 items-center">

      {/* Shuffle */}
      <button
        className={shuffle ? "text-emerald-300" : "text-white"}
        aria-label="پخش تصادفی"
        aria-pressed={shuffle}
        onClick={() => dispatch(toggleShuffle())}
        type="button"
        disabled={disabled}
      >
        <Shuffle />
      </button>

      {/* Previous */}
      <button
        type="button"
        disabled={disabled}
        aria-label="آهنگ قبلی"
        onClick={onPrevious}
      >
        <BackButtonIcon />
      </button>

      {/* Play / Pause */}
      <button
        type="button"
        disabled={disabled}
        aria-label={isPlaying ? "مکث" : "پخش"}
        onClick={() => dispatch(togglePlay())}
      >
        {isPlaying ? (
          <PauseCircle />
        ) : (
          <PlayCircle />
        )}
      </button>

      {/* Next */}
      <button
        type="button"
        disabled={disabled}
        aria-label="آهنگ بعدی"
        onClick={onNext}
      >
        <NextButtonIcon />
      </button>

      {/* Timer */}
      <button
        type="button"
        aria-label="تکرار آهنگ"
        aria-pressed={repeatOne}
        onClick={() => dispatch(toggleRepeatOne())}
      >
        <Repeat1 size={23} className={repeatOne ? "text-emerald-300" : "text-white"} />
      </button>

    </div>
  );
};

export default MpPlayerButtons;