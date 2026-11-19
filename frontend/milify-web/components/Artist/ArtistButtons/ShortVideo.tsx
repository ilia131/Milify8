import Image from "next/image";
import { Play } from "lucide-react";
import type { Shorts } from "@/redux/services/artistApislice";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { generateVideoThumbnail } from "@/features/explore/utils/generateVideoThumbnail";

interface ShortVideoProps {
  item: Shorts;
  i: number;
  onOpen: (i: number) => void;
}

export default function ShortVideo({ item, onOpen, i }: ShortVideoProps) {
  const [generated, setGenerated] = useState("");
  const { ref, inView } = useInView({ triggerOnce: true });
  const thumbnail = item.thumbnail || generated;

  useEffect(() => {
    if (!inView || item.thumbnail) return;
    let cancelled = false;
    generateVideoThumbnail(item.video).then((url) => {
      if (!cancelled) setGenerated(url);
    });
    return () => { cancelled = true; };
  }, [inView, item.thumbnail, item.video]);

  return (
    <button ref={ref} type="button" onClick={() => onOpen(i)}
      aria-label={item.caption || "پخش ویدیوی کوتاه"}
      className="relative grid h-[183px] w-[107px] place-content-center overflow-hidden rounded-xl bg-white/10">
      {thumbnail && <Image src={thumbnail} fill sizes="107px" alt="" className="object-cover" unoptimized />}
      <Play className="relative rounded-full bg-black/70 p-2 size-9" />
      {item.caption && <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 p-2 text-xs">{item.caption}</span>}
    </button>
  );
}
