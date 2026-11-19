
import TopCoverMp from "@/shared/MusicPlayer/CoverMusicPlayer/TopCoverMp"
import CoverMpImage from "@/shared/MusicPlayer/CoverMusicPlayer/CoverMpImage"
import MpButtons from "@/shared/MusicPlayer/CoverMusicPlayer/MpButtons"
import { Song } from "@/redux/features/playerSlice"
import { useDominantColorFromImage } from "@/shared/hooks/useDominantColorFromImage"
import { useAppSelector } from "@/redux/hook"
import Lyrics from "../Lyrics/lyric"
import { usePlayerUI } from "../context/playerUIContext"
interface Props {
  onClose: () => void;
  progress: number;
  currentSong:Song;
  lowerTime:string, 
  higherTime:string;
  handleSeek:(e: React.MouseEvent<HTMLDivElement>) => void
  buffered:number
  onNext: ()=>void
  onPrevious: ()=>void
  setIsOpenQueue:(isOpenQueue:boolean)=>void
}


const CoverMpLayout = ({onClose , progress ,
  
  setIsOpenQueue
  ,currentSong, lowerTime, higherTime, handleSeek , buffered , onNext , onPrevious}:Props) => {

  
  useDominantColorFromImage(currentSong?.image_url)
  const { color, darkColor  } = useAppSelector(state => state.player)
  const { isLyricsOpen , closeLyrics , openLyrics } = usePlayerUI()
  return (
    <>
     {isLyricsOpen ?  (
      <Lyrics  
      buffered={buffered}
      progress={progress}
      currentSong={currentSong}
      lowerTime={lowerTime}
      higherTime={higherTime}
      handleSeek={handleSeek}
      setIsOpenLyric={closeLyrics}
      />
        ) : (
    <div
        className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex min-h-dvh w-full max-w-[468px] items-center justify-center px-3 animate-slideUp"
        style={{
          background: `linear-gradient(to top, ${darkColor}, ${color})`,
          transition: "background 600ms ease"
        }}
  >
      <div
        className="w-full h-dvh pb-4 flex flex-col px-[10.5px] justify-between
       "
      >
        <TopCoverMp onClose={onClose} currentSong={currentSong} />
       
          <CoverMpImage currentSong={currentSong} />

         
        <MpButtons
          buffered={buffered}
          progress={progress}
          currentSong={currentSong}
          lowerTime={lowerTime}
          higherTime={higherTime}
          handleSeek={handleSeek}
          onPrevious={onPrevious}
          setIsOpenQueue={setIsOpenQueue}

          setIsOpenLyric={openLyrics}
          onNext={onNext}
        />

      </div>
      
    </div>
     )}
    </>
  )
}

export default CoverMpLayout