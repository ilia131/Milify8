"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/shared/BottomNav/BottomNav";
import MenuBar from "@/shared/MenuBar/MenuBar";
import MusicPlayerProvider from "@/shared/MusicPlayer/MusicPlayerProvider";
import MusicOptionsSheet from "@/shared/ui/BottomSheet/MusicOptionsSheet";
import PlaylistSelectorSheet from "@/components/Library/PlaylistSelectorSheet";
import { PlayerUIProvider } from "@/shared/MusicPlayer/context/playerUIContext";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { closeMenu } from "@/redux/features/uiSlice";
import { useNavigationLoading } from "@/components/NavigationLoadingProvider/NavigationLoadingProvider";
import DesktopNavigation from "./DesktopNavigation";

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isLoading, stopLoading } = useNavigationLoading();
  const isMenuOpen = useAppSelector((state) => state.ui.isMenuOpen);
  const hasSong = useAppSelector((state) => state.player.queue.length > 0);

  useEffect(() => {
    stopLoading();
    dispatch(closeMenu());
  }, [dispatch, pathname, stopLoading]);

  const standalone = pathname === "/" || pathname.startsWith("/home") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/reset-password/") || pathname === "/activate" || pathname === "/offline";
  const hideBottomNav = pathname === "/library/LikedSongs/AddLikeSongs";

  return (
    <PlayerUIProvider>
      {standalone ? (
        <div className={pathname.startsWith("/auth") ? "mx-auto min-h-dvh w-full max-w-xl" : "min-h-dvh"}>
          {children}
        </div>
      ) : (
        <DesktopNavigation>
          <div className={`relative mx-auto min-h-dvh w-full min-w-0 milify-content ${hasSong ? "milify-content-playing" : ""}`}>
            {children}
            {!hideBottomNav && <BottomNav />}
          </div>
        </DesktopNavigation>
      )}

      {hasSong && <MusicPlayerProvider visible={!standalone} />}
      {!standalone && (
        <>
          <MusicOptionsSheet />
          <MenuBar isOpen={isMenuOpen} onClose={() => dispatch(closeMenu())} />
          <PlaylistSelectorSheet />
        </>
      )}

      {isLoading && (
        <div role="status" className="fixed inset-0 z-[99999] grid place-content-center justify-items-center gap-4 bg-[#121212]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
          <span className="text-sm">در حال بارگذاری…</span>
        </div>
      )}
    </PlayerUIProvider>
  );
}
