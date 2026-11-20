"use client";

import { Pause, Play } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { togglePlay } from "@/redux/features/playerSlice";

export default function LeftButtonMPlayer() {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector((state) => state.player.isPlaying);

  return <button type="button" aria-label={isPlaying ? "مکث" : "پخش"} className="milify-icon"
    onClick={() => dispatch(togglePlay())}>
    {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
  </button>;
}
