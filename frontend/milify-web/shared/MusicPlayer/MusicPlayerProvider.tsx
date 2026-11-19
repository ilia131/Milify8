"use client";

import MusicPlayer from "./MusicPlayer";

export default function MusicPlayerProvider({ visible }: { visible: boolean }) {
  return <MusicPlayer visible={visible} />;
}
