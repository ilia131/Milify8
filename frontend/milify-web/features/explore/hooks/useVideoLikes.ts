import { useEffect, useRef, useState } from "react";
import { useShortVideoLikeMutation } from "@/redux/services/shortApi";
import { useToast } from "@/components/ToastProvider/ToastProvider";
import type { Shorts } from "@/redux/services/artistApislice";

type DetailLike = {
  is_liked?: boolean;
  liked?: boolean;
  likes_count?: number;
} | null | undefined;

export function useVideoLikes(
  currentVideo: Shorts | undefined,
  detail: DetailLike
) {
  const { error: showError } = useToast();
  const [shortVideoLike] = useShortVideoLikeMutation();

  const [likedVideos, setLikedVideos] = useState<
    Record<string, boolean>
  >({});
  const [likeCounts, setLikeCounts] = useState<
    Record<string, number>
  >({});
  const [showLikeAnimation, setShowLikeAnimation] =
    useState(false);

  const animationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(animationTimer.current), []);

  function animateLike() {
    clearTimeout(animationTimer.current);
    setShowLikeAnimation(true);
    animationTimer.current = setTimeout(() => setShowLikeAnimation(false), 700);
  }

  const isLiked = (uuid: string) => likedVideos[uuid] ??
    (uuid === currentVideo?.uuid && Boolean(detail?.is_liked ?? detail?.liked));

  const handleLike = async (uuid: string, forceLike = false) => {
    const currentlyLiked = isLiked(uuid);

    // Double-tap on already liked → only animation
    if (forceLike && currentlyLiked) {
      animateLike();
      return;
    }

    const currentCount =
      likeCounts[uuid] ??
      (uuid === currentVideo?.uuid
        ? Number(detail?.likes_count ?? 0)
        : 0);

    const nextLiked = forceLike ? true : !currentlyLiked;

    // Optimistic update
    setLikedVideos((prev) => ({ ...prev, [uuid]: nextLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [uuid]: Math.max(
        0,
        currentCount + (nextLiked ? 1 : currentlyLiked ? -1 : 0)
      ),
    }));

    try {
      const response = await shortVideoLike(uuid).unwrap();

      setLikedVideos((prev) => ({
        ...prev,
        [uuid]: response.liked,
      }));
      setLikeCounts((prev) => ({
        ...prev,
        [uuid]: Math.max(0, Number(response.likes_count ?? 0)),
      }));
    } catch (err) {
      console.error(err);

      // Rollback
      setLikedVideos((prev) => ({
        ...prev,
        [uuid]: currentlyLiked,
      }));
      setLikeCounts((prev) => ({
        ...prev,
        [uuid]: currentCount,
      }));

      showError("ثبت پسند انجام نشد. دوباره تلاش کنید.");
    }
  };

  const handleDoubleClick = () => {
    if (!currentVideo) return;

    const alreadyLiked = isLiked(currentVideo.uuid);

    if (!alreadyLiked) {
      void handleLike(currentVideo.uuid, true);
    }

    animateLike();
  };

  return {
    likedVideos,
    likeCounts,
    showLikeAnimation,
    handleLike,
    handleDoubleClick,
  };
}