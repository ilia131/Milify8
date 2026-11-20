"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { X } from "lucide-react";

export default function ModalPlayList({ onClose, onCreate, busy }: {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  busy: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (name && !busy) void onCreate(name);
  }

  return <dialog ref={dialog} aria-labelledby="playlist-title" onClose={onClose}
    className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/15 bg-[var(--milify-card)] p-5 text-white backdrop:bg-black/70">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id="playlist-title" className="text-xl font-bold">ساخت پلی‌لیست</h2>
      <button type="button" className="milify-icon" onClick={() => dialog.current?.close()} aria-label="بستن"><X size={20} /></button>
    </div>
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm">نام پلی‌لیست
        <input required autoFocus name="name" type="text" className="input" dir="auto" placeholder="پلی‌لیست من" />
      </label>
      <button type="submit" className="milify-chip !bg-[var(--milify-green)] font-bold text-black disabled:opacity-50" disabled={busy}>
        {busy ? "در حال ساخت…" : "ساخت پلی‌لیست"}
      </button>
    </form>
  </dialog>;
}
