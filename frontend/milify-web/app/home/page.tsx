"use client";

import { useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Headphones, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider/ToastProvider";
import { useCreateSupportRequestMutation } from "@/redux/services/supportApi";

export default function HomePage() {
  const dialog = useRef<HTMLDialogElement>(null);
  const { success, error } = useToast();
  const [sendSupport, { isLoading }] = useCreateSupportRequestMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const field = new FormData(form);
    const email = String(field.get("email") ?? "").trim();
    const subject = String(field.get("subject") ?? "").trim();
    const message = String(field.get("message") ?? "").trim();

    if (subject.length < 3 || message.length < 10) {
      error("موضوع باید دست‌کم سه نویسه و پیام دست‌کم ده نویسه داشته باشد.");
      return;
    }
    try {
      await sendSupport({ email: email || undefined, subject, message }).unwrap();
      form.reset();
      dialog.current?.close();
      success("درخواست پشتیبانی ارسال شد.");
    } catch {
      error("ارسال درخواست انجام نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-5 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 text-xl font-black">
          <Image src="/Icons/milify-192.png" alt="" width={40} height={40} className="rounded-lg" />میلیفای
        </Link>
        <Link className="milify-chip" href="/auth/login">ورود به حساب</Link>
      </header>
      <section className="my-auto py-12">
        <div className="milify-welcome !mx-0 !p-[clamp(1.25rem,6vw,5rem)]">
          <div className="min-w-0">
            <h1 className="text-4xl leading-tight font-black sm:text-6xl">موسیقی ایرانی در میلیفای</h1>
            <p className="mt-4 max-w-lg leading-7 text-[var(--milify-muted)]">آهنگ‌ها و آلبوم‌های تازه را کشف کنید، هنرمندان محبوبتان را دنبال کنید و پلی‌لیست خودتان را بسازید.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="milify-chip inline-flex items-center gap-2 !bg-[var(--milify-green)] font-bold text-black" href="/browse">شروع شنیدن <ArrowUpLeft size={17} /></Link>
              <button type="button" className="milify-chip" onClick={() => dialog.current?.showModal()}>پشتیبانی</button>
            </div>
          </div>
          <Headphones aria-hidden className="hidden size-32 shrink-0 text-[var(--milify-green)] lg:block" strokeWidth={1} />
        </div>
      </section>
      <dialog ref={dialog} aria-labelledby="support-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-white/15 bg-[var(--milify-card)] p-5 text-white backdrop:bg-black/70">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="support-title" className="text-xl font-bold">تماس با پشتیبانی</h2>
          <button type="button" className="milify-icon" aria-label="بستن" onClick={() => dialog.current?.close()}><X size={20} /></button>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-1 text-sm">رایانامه (اختیاری)<input className="input" name="email" type="email" dir="ltr" /></label>
          <label className="grid gap-1 text-sm">موضوع<input className="input" name="subject" required minLength={3} /></label>
          <label className="grid gap-1 text-sm">پیام<textarea className="min-h-28 rounded-xl border border-white/15 bg-black/20 p-3" name="message" required minLength={10} /></label>
          <button type="submit" className="milify-chip !bg-[var(--milify-green)] font-bold text-black disabled:opacity-50" disabled={isLoading}>
            {isLoading ? "در حال ارسال…" : "ارسال درخواست"}
          </button>
        </form>
      </dialog>
    </main>
  );
}
