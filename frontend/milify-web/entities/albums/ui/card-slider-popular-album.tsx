import { Album } from "@/redux/services/artistApislice";
import CardsPa from "./card-popular-album"



export interface CardSliderProps {
      cardimages:  Album[] | undefined
}


const CardSliderPA = ({cardimages} : CardSliderProps) => {
  return (
    <div className="milify-track-grid">
        {cardimages?.map((item) => (
            <CardsPa item={item} key={item.id} />
        ))}
    </div>
  )
}

export default CardSliderPA