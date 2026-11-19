"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { useActivationMutation } from "@/redux/services/authApiSlice";
import useSpotifyRouter from "@/hooks/authhooks/useSpotifyRouter";
import { useToast } from "@/components/ToastProvider/ToastProvider";

export default function ActivateContent() {
  const searchParams = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [activation, { isLoading }] = useActivationMutation();

  const { replace } = useSpotifyRouter();
  const { success, error } = useToast();

  const hasActivated = useRef(false);

  useEffect(() => {
    if (!uid || !token) {
      return;
    }

    if (hasActivated.current) {
      return;
    }

    hasActivated.current = true;

    const activateAccount = async () => {
      try {
        await activation({
          uid,
          token,
        }).unwrap();

        success("حساب شما فعال شد.");

        replace("/auth/login");
      } catch (err) {
        console.error("Activation error:", err);

        error(
          "پیوند فعال‌سازی معتبر نیست یا اعتبار آن پایان یافته است."
        );
      }
    };

    activateAccount();
  }, [uid, token, activation, replace, success, error]);

  if (!uid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            پیوند فعال‌سازی قدیمی
          </h1>

          <p className="mt-2 text-gray-400">
            برای ثبت‌نام جدید نیازی به فعال‌سازی ایمیل نیست.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        {isLoading ? (
          <>
            <h1 className="text-xl font-semibold">
              در حال فعال‌سازی حساب…
            </h1>

            <p className="mt-2 text-gray-400">
              لطفاً منتظر بمانید.
            </p>
          </>
        ) : (
          <p className="text-gray-400">
            نتیجهٔ فعال‌سازی را در اعلان صفحه ببینید.
          </p>
        )}
      </div>
    </div>
  );
}
