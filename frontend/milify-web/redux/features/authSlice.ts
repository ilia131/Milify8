import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    initialLoadFinished: false,
  },
  reducers: {
    setAuth: (state) => {
      state.isAuthenticated = true;
      state.initialLoadFinished = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
    finishInitialLoad: (state) => {
      state.initialLoadFinished = true;
    },
  },
});

export const { setAuth, logout, finishInitialLoad } = authSlice.actions;
export default authSlice.reducer;
