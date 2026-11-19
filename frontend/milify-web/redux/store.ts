import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './services/apiSlice';
import authReducer from './features/authSlice';
import playerReducer from './features/playerSlice'; 
import uiReducer from "./features/uiSlice";
import tabsReducer from './features/tabSlice'
import bottomReducer from './features/bottomSheet'
import playlistModalReducer from "./features/playlistModalSlice";
export const makeStore = () => configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    player: playerReducer, 
    ui: uiReducer,
    tabs:  tabsReducer,
    bottomSheet: bottomReducer,
    playlistModal: playlistModalReducer,


  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
