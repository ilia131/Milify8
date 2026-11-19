import Image from "next/image"
import { Song} from "@/redux/features/playerSlice";
import images from '@/public/images'

import { useParams } from "next/navigation";
import Link from "next/link";

interface PopularMusicPropsCard {
    item: Pick<Song, "id" | "title" | "image_url">
}


const PopularReleaseCard = ({item}:PopularMusicPropsCard) => {
  const params = useParams()
  const artistname = params.artistname as string
  return (
    <Link          href={`/album/${encodeURIComponent(artistname)}/${encodeURIComponent(item.title)}`}
    className="w-full h-21.5 flex mt-1.5 items-center gap-4" >
             <Image src={item.image_url || images.Kagan} width={83} height={86} 
             className="w-20.75 h-21.5 overflow-hidden" alt="musiccover"
             priority
             
             />
             <div className="w-60 h-12.25">
             <p className="text-[rgba(255,255,255,1)] text-[19px] font-semibold">{item.title}</p>
             <p className="text-[rgba(255,255,255,0.71)] text-[12px] font-medium">تازه‌ترین انتشار</p>
             </div>
         </Link>
  )
}

export default PopularReleaseCard