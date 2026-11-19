"use client";

import { useState } from "react";

import { useAppSelector } from "@/redux/hook";

import CoverMusicPlayer from "./CoverMusicPlayer/CoverMusicPlayer";
import DesktopPlayer from "./DesktopPlayer";
import MiniPlayer from "./MiniPlayer";
import QueueSheet from "./QueueSheet";

import {
  usePlayerUI,
} from "./context/playerUIContext";

import { useAudioPlayer } from "@/entities/artist/hooks/useAudioPlayer";

import AudioAd from "@/components/player/AudioAd";

const MusicPlayer = ({ visible }: { visible: boolean }) => {
  const {
    isCoverOpen,
    openCover,
    closeCover,
  } = usePlayerUI();

  const [
    isOpenQueue,
    setIsOpenQueue,
  ] = useState(false);

  const {
    seek,
    seekFromEvent,
    formatTime,

    handleNext,
    handlePrevious,

    playbackError,
    showAd,
    currentAd,
    handleAdFinished,
  } = useAudioPlayer();

  const {
    progress,
    currentTime,
    duration,
    buffered,
    queue,
    currentIndex,
  } = useAppSelector(
    (state) => state.player
  );

  const currentSong =
    queue[currentIndex];

  if (!visible || !currentSong) return null;

  return (
    <>
      {/* Mini Player */}

      <div className="lg:hidden"><MiniPlayer
        currentSong={currentSong}
        progress={progress}
        onOpenCover={openCover}
      /></div>
      {!isCoverOpen && !showAd && <DesktopPlayer song={currentSong} seek={seek}
        previous={handlePrevious} next={handleNext} openQueue={() => setIsOpenQueue(true)}
        openDetails={openCover} formatTime={formatTime} />}
      {playbackError && <p role="alert" className="fixed inset-x-4 bottom-38 z-50 mx-auto max-w-sm rounded-xl bg-[#262626] p-3 text-center text-sm lg:bottom-24">
        {playbackError}
      </p>}

      {/* Full Player */}

      {isCoverOpen && (
        <div>
          <CoverMusicPlayer
            buffered={buffered}
            onClose={closeCover}
            currentSong={currentSong}
            progress={progress}
            lowerTime={formatTime(currentTime)}
            higherTime={formatTime(duration)}
            handleSeek={seekFromEvent}
            onNext={handleNext}
            onPrevious={handlePrevious}
            setIsOpenQueue={setIsOpenQueue}
          />
        </div>
      )}

      {/* Queue */}

      {isOpenQueue && (
        <QueueSheet
          onClose={() =>
            setIsOpenQueue(false)
          }
        />
      )}

      {/* Audio Ad */}

      {showAd && currentAd && (
        <AudioAd
          ad={currentAd}
          onFinished={handleAdFinished}
        />
      )}
    </>
  );
};

export default MusicPlayer;