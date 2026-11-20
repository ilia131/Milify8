interface Props{
    progress:number
}


const MusicBarMp = ({progress}:Props) => {
  return (
    <div  className="absolute inset-x-0 bottom-0 h-0.5 bg-white/25">
    <div
      className="w-full  bg-[rgba(255,255,255,1)] h-0.5 absolute left-0    rounded-[1px]"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
   </div>
  )
}

export default MusicBarMp