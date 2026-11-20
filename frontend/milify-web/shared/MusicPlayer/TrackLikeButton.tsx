"use client";

import { Heart } from "lucide-react";
import { useToast } from "@/components/ToastProvider/ToastProvider";
import { useAppSelector } from "@/redux/hook";
import { useGetLikedStatusQuery, useToggleLikeSongMutation } from "@/redux/services/likedSongs";

export default function TrackLikeButton({ id }: { id: string }) {
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { currentData, isFetching, isError, refetch } = useGetLikedStatusQuery([id], { skip: !authenticated || !id });
  const [toggleLike, { isLoading }] = useToggleLikeSongMutation();
  const { error } = useToast();
  const liked = currentData?.[id] === true;

  if (!authenticated || !id) return null;
  return <button type="button" className="milify-icon disabled:opacity-50" aria-pressed={liked}
    aria-label={isError ? "دریافت دوبارهٔ وضعیت پسندیدن" : liked ? "حذف از آهنگ‌های پسندیده" : "پسندیدن آهنگ"}
    disabled={isLoading || isFetching} onClick={async () => {
      if (isError) {
        void refetch();
        return;
      }
      try {
        await toggleLike(id).unwrap();
      } catch {
        error("به‌روزرسانی آهنگ‌های پسندیده انجام نشد.");
      }
    }}>
    <Heart size={19} fill={liked ? "currentColor" : "none"} className={liked ? "text-[var(--milify-green)]" : ""} />
  </button>;
}
