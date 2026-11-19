"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResetPasswordConfirmMutation } from "@/redux/services/authApiSlice";

export default function ResetPasswordConfirmPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const router = useRouter();
  const [confirm, { isLoading }] = useResetPasswordConfirmMutation();
  const [error, setError] = useState("");

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-5 text-2xl font-bold">انتخاب رمز عبور جدید</h1>
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const password = form.get("password");
        const confirmation = form.get("confirmation");
        if (typeof password !== "string" || password !== confirmation) {
          setError("رمز عبور و تکرار آن یکسان نیستند.");
          return;
        }
        setError("");
        try {
          await confirm({ uid, token, new_password: password, re_new_password: password }).unwrap();
          router.replace("/auth/login");
        } catch {
          setError("تغییر رمز انجام نشد. اعتبار پیوند و شروط رمز عبور را بررسی کنید.");
        }
      }}>
        <label className="block">رمز عبور جدید
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="input mt-2" />
        </label>
        <label className="block">تکرار رمز عبور
          <input name="confirmation" type="password" required minLength={8} autoComplete="new-password" className="input mt-2" />
        </label>
        <button className="rounded-lg bg-emerald-300 px-4 py-2 text-black" disabled={isLoading}>
          {isLoading ? "در حال ذخیره…" : "ذخیرهٔ رمز عبور"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}
