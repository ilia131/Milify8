"use client";

import { useState } from "react";
import Link from "next/link";
import { useResetPasswordMutation } from "@/redux/services/authApiSlice";

export default function ResetPasswordPage() {
  const [requestReset, { isLoading }] = useResetPasswordMutation();
  const [message, setMessage] = useState("");

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-5 text-2xl font-bold">بازیابی رمز عبور</h1>
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        const email = new FormData(event.currentTarget).get("email");
        if (typeof email !== "string") return;
        setMessage("");
        try {
          await requestReset(email.trim().toLowerCase()).unwrap();
          setMessage("اگر حسابی با این ایمیل وجود داشته باشد، پیوند بازیابی را دریافت می‌کنید.");
        } catch {
          setMessage("درخواست بازیابی انجام نشد. دوباره تلاش کنید.");
        }
      }}>
        <label className="block">نشانی ایمیل
          <input name="email" dir="ltr" type="email" autoComplete="email" required className="input mt-2" />
        </label>
        <button className="rounded-lg bg-emerald-300 px-4 py-2 text-black" disabled={isLoading}>
          {isLoading ? "در حال ارسال…" : "ارسال پیوند بازیابی"}
        </button>
        <p role="status">{message}</p>
      </form>
      <Link className="text-emerald-300" href="/auth/login">بازگشت به ورود</Link>
    </main>
  );
}
