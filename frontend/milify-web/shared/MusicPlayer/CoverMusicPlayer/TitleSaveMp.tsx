import TrackLikeButton from "../TrackLikeButton"
import { Song } from "@/redux/features/playerSlice"

interface Props {
  currentSong:Song
}
const TitleSaveMp = ({currentSong}:Props) => {
  return (
    <div className="flex justify-between w-full h-14.75 [@media(max-height:800px)]:-mt-2">
    <div className="flex min-w-0 flex-col">
      <p className="text-[#FFFFFF] text-[22px] truncate font-medium">{currentSong.artistname}</p>
      <p className="text-[rgba(255,255,255,0.49)] text-[17px] font-medium truncate">{currentSong.title}</p>
    </div>
     <div className="mt-7.25 mr-[16.75px] ">
          <TrackLikeButton id={currentSong.unique_id} />
    </div>
    </div>
  )
}

export default TitleSaveMp