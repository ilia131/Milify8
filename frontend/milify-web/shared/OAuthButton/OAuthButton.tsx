"use client";

import { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { setAuth } from "@/redux/features/authSlice";
import { useGoogleTokenLoginMutation } from "@/redux/services/authApiSlice";

export function OAuthButton({ linking = false }: { linking?: boolean }) {
  const [message, setMessage] = useState("");
  const [googleLogin, { isLoading }] = useGoogleTokenLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <p className="text-center text-sm text-white/60">ورود با گوگل هنوز تنظیم نشده است.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2" aria-busy={isLoading}>
      <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => {
        setMessage("سرویس گوگل بارگذاری نشد.");
      }}>
        <GoogleLogin shape="pill" width="240"
          onError={() => setMessage("ورود با گوگل انجام نشد. دوباره تلاش کنید.")}
          onSuccess={async ({ credential }) => {
            if (!credential) {
              setMessage("توکن ورود گوگل دریافت نشد.");
              return;
            }
            setMessage("");
            try {
              await googleLogin({ id_token: credential }).unwrap();
              dispatch(setAuth());
              if (linking) setMessage("حساب گوگل متصل شد.");
              else router.replace("/browse");
            } catch (error) {
              const detail = (error as { data?: { detail?: unknown } })?.data?.detail;
              setMessage(typeof detail === "string" ? detail : "ورود با گوگل انجام نشد.");
            }
          }}
        />
      </GoogleOAuthProvider>
      <p role="status" className="text-center text-sm text-white/75">
        {isLoading ? "در حال بررسی حساب گوگل…" : message}
      </p>
    </div>
  );
}
