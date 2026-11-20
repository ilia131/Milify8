import MusicRowCard from "@/components/Artist/ArtistTabs/MusicRowCard"
import TitleMusic from "@/components/Artist/ArtistTabs/TitleMusic"
import { Song } from "@/redux/features/playerSlice";




interface FreshTrackRowsProps {
  songs: Song[] 
}



const  AlbumsRows = ({songs}:FreshTrackRowsProps) => {
  return (
    <div className="grid gap-3">
      <TitleMusic title="آهنگ‌های آلبوم" />
      {songs?.map((item , i)=>(
         <MusicRowCard key={i} item={item} songs={songs} index={i} />
      ))} 
   </div>
  )
}

export default  AlbumsRows