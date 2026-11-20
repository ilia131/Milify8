"use client";

import Link from "next/link";
import { ArrowUpLeft, Compass, Headphones } from "lucide-react";
import { useAppSelector } from "@/redux/hook";
import { useGetMyProfileQuery } from "@/redux/services/profileApiSlice";

export default function BrowseWelcome() {
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { currentData: profile } = useGetMyProfileQuery(undefined, { skip: !authenticated });
  const name = authenticated ? profile?.first_name?.trim() || profile?.username : undefined;

  return <header className="milify-welcome">
    <div className="min-w-0">
      <h1 className="break-words text-3xl font-black sm:text-4xl">{name ? <>سلام، <bdi>{name}</bdi></> : "به میلیفای خوش آمدید"}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/search" className="milify-chip inline-flex items-center gap-2">پیدا کردن موسیقی <ArrowUpLeft size={16} /></Link>
        <Link href="/explore" className="milify-chip inline-flex items-center gap-2"><Compass size={16} /> کاوش</Link>
      </div>
    </div>
    <Headphones className="hidden size-24 shrink-0 text-[var(--milify-green)] sm:block" strokeWidth={1.25} aria-hidden />
  </header>;
}
