import Image from "next/image"
import images from "@/public/images"
import { Song } from '@/redux/features/playerSlice';

type RightButtonMpPlayerProps = {
  currentSong:Song
};

const RightButtonMPlayer = ({currentSong}:RightButtonMpPlayerProps) => {
  return (
    <div className="min-w-0 h-10.25 flex items-center gap-2">
             <Image width={41} height={41} alt={currentSong.title} className="size-10 shrink-0 rounded-md object-cover"
             src={currentSong.image_url || images.vini}
             unoptimized />
             <div className="grid min-w-0 items-center ">
              <p dir="auto" className="truncate text-[13px] text-[rgba(255,255,255,0.7)]">{currentSong.artistname || currentSong.artists?.join("، ")}</p>
              <p dir="auto" className="text-[12px] text-[rgba(255,255,255,0.48)] truncate">{currentSong.title}</p>
             </div>
           </div>
  )
}

export default RightButtonMPlayer
