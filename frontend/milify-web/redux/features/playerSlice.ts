import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Shorts } from "../services/artistApislice";

export type Lyrics = {
  time:number,
  line:string
}


export type Song = {
  album_name: string;
  song: never;
  id: number;
  title: string;
  artist: number;
  audioUrl: string;
  track_url: string;
  image_url: string;
  unique_id: string;
  play_count: string;
  is_subscription_only: boolean
  artistname?: string;
  shorts:Shorts[]
  lyrics?: Lyrics[]
  artists:string[]
  description: string;
  type?:string
};

type PlayerState = {
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  repeatOne: boolean;
  shuffle: boolean;
  mediaType: "music" | "video" | null;
  
  progress: number;
  currentTime: number;
  duration: number;
  buffered: number;
  currentSong: Song | null
  color: string
  darkColor: string
};

const initialState: PlayerState = {
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  volume: 0.8,
  repeatOne: false,
  shuffle: false,
  currentSong: null,
  color: "rgb(60,60,60)",
  darkColor: "rgb(30,30,30)",
  mediaType: null,

  progress: 0,
  currentTime: 0,
  duration: 0,
  buffered: 0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,

  reducers: {
    setQueue: (
      state,
      action: PayloadAction<{ songs: Song[]; startIndex?: number }>
    ) => {
      const { songs, startIndex = 0 } = action.payload;
    
      state.queue = songs;
      state.currentIndex = Math.max(0, Math.min(startIndex, songs.length - 1));
      state.isPlaying = songs.length > 0;
      state.mediaType = "music";
    },
    removeFromQueue: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index < 0 || index >= state.queue.length) return;
      state.queue.splice(index, 1);
      if (!state.queue.length) {
        state.currentIndex = 0;
        state.currentSong = null;
        state.isPlaying = false;
      } else if (index < state.currentIndex) {
        state.currentIndex -= 1;
      } else {
        state.currentIndex = Math.min(state.currentIndex, state.queue.length - 1);
      }
    },
    setVideoPlaying: (state) => {
      state.mediaType = "video";
      state.isPlaying = false;
    },

    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setPlayerColor: (state, action) => {
      state.color = action.payload.color
      state.darkColor = action.payload.darkColor
    },
    playNext: (state) => {
      if (!state.queue.length) return;

      state.currentIndex = (state.currentIndex + 1) % state.queue.length;
      state.isPlaying = true;
    },

    playPrev: (state) => {
      if (!state.queue.length) return;

      state.currentIndex =
        state.currentIndex === 0
          ? state.queue.length - 1
          : state.currentIndex - 1;

      state.isPlaying = true;
    },

    toggleRepeatOne: (state) => {
      state.repeatOne = !state.repeatOne;
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    pausePlayback: (state) => {
      state.isPlaying = false;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },

    setTimeData: (
      state,
      action: PayloadAction<{
        currentTime: number;
        duration: number;
        buffered: number;
      }>
    ) => {
      const { currentTime, duration, buffered } = action.payload;

      state.currentTime = currentTime;
      state.duration = duration;
      state.buffered = buffered * 100;
      state.progress = duration ? (currentTime / duration) * 100 : 0;
    },
    playSingleSong: (
      state,
      action: PayloadAction<Song>
    ) => {
      state.queue = [action.payload];
      state.currentSong = action.payload;
      state.currentIndex = 0;
      state.isPlaying = true;
      state.mediaType = "music";
    }
  },
});

export const {
  setQueue,
  removeFromQueue,
  toggleRepeatOne,
  toggleShuffle,
  pausePlayback,
  togglePlay,
  playNext,
  playPrev,
  setVolume,
  setTimeData,
  setPlayerColor,
  setVideoPlaying,
  playSingleSong,


} = playerSlice.actions;

export default playerSlice.reducer;
