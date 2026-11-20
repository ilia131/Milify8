import { useAppSelector } from "@/redux/hook";
import TimeNumber from "./TimeNumber";

interface Props {
  progress: number;
  lowerTime: string;
  higherTime: string;
  handleSeek: (fraction: number) => void;
  buffered: number;
}

export default function BarTimeMp({ progress, lowerTime, higherTime, handleSeek, buffered }: Props) {
  const duration = useAppSelector((state) => state.player.duration);
  return <div dir="ltr" className="mt-3 w-full">
    <div className="relative flex h-7 items-center">
      <div className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-white/30" aria-hidden>
        <div className="h-full rounded-full bg-white/35" style={{ width: `${Math.min(buffered, 100)}%` }} />
      </div>
      <input type="range" aria-label="موقعیت پخش" aria-valuetext={lowerTime}
        className="relative w-full accent-[var(--milify-green)]" min={0} max={100} step={0.1}
        disabled={!duration} value={Math.min(progress, 100)}
        onChange={(event) => handleSeek(event.target.valueAsNumber / 100)} />
    </div>
    <div className="flex justify-between text-xs">
      <TimeNumber timenumber={lowerTime} />
      <TimeNumber timenumber={higherTime} />
    </div>
  </div>;
}
