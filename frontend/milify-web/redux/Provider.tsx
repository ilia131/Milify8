"use client";

import { type ReactNode, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";

export default function CustomProvider({ children }: { children: ReactNode }) {
  const [{ store, serverState }] = useState(() => {
    const store = makeStore();
    return { store, serverState: store.getState() };
  });

  return <Provider store={store} serverState={serverState}>{children}</Provider>;
}
