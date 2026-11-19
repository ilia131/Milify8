"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Headphones, Library, PanelRight, Search, Settings, UserRound, CircleStar, AudioLines } from "lucide-react";
import { useAppSelector } from "@/redux/hook";

const links = [
  { href: "/browse", title: "مرور موسیقی", icon: Headphones },
  { href: "/search", title: "جستجو", icon: Search },
  { href: "/explore", title: "کشف", icon: Compass },
  { href: "/library", title: "کتابخانه", icon: Library },
  { href: "/beats", title: "بازار بیت", icon: AudioLines },
  { href: "/browse/trackpacks", title: "اشتراک", icon: CircleStar },
  { href: "/settings", title: "تنظیمات", icon: Settings },
];

export default function DesktopNavigation({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="milify-shell min-h-dvh lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
      <aside className={`sticky top-0 hidden h-dvh flex-col gap-8 border-e border-white/10 bg-[#101313] px-3 pt-5 lg:flex ${expanded ? "w-56" : "w-18"}`}>
        <div className="flex items-center justify-between gap-2 px-1">
          {expanded && (
            <Link href="/browse" className="flex items-center gap-2 font-bold">
              <Image src="/Icons/milify-192.png" alt="" width={32} height={32} className="rounded-lg" />
              میلیفای
            </Link>
          )}
          <button type="button" aria-label={expanded ? "جمع کردن منو" : "باز کردن منو"}
            aria-controls="desktop-nav" aria-expanded={expanded}
            className="rounded-lg p-2 text-white/65 hover:bg-white/10 hover:text-white"
            onClick={() => setExpanded(!expanded)}>
            <PanelRight size={20} />
          </button>
        </div>
        <nav id="desktop-nav" aria-label="منوی اصلی" className="grid gap-1">
          {links.map(({ href, title, icon: Icon }) => {
            const current = pathname === href || (pathname.startsWith(href + "/") && pathname !== "/browse/trackpacks");
            return (
              <Link key={href} href={href} aria-label={title} title={title}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${current ? "bg-emerald-300/12 text-emerald-200" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={20} className="shrink-0" />
                {expanded && title}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 hidden min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#101313]/95 px-6 backdrop-blur lg:flex">
          <form role="search" className="flex w-full max-w-sm items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 focus-within:border-emerald-300/70"
            onSubmit={(event) => {
              event.preventDefault();
              const query = new FormData(event.currentTarget).get("query")?.toString().trim();
              router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
            }}>
            <button type="submit" aria-label="جستجو"><Search size={18} /></button>
            <input className="min-w-0 flex-1 outline-none" name="query" type="search" maxLength={200}
              aria-label="جستجوی آهنگ، آلبوم و هنرمند" placeholder="جستجوی آهنگ، آلبوم و هنرمند" />
          </form>
          <Link href={authenticated ? "/profile" : "/auth/login"} className="flex shrink-0 items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">
            <UserRound size={18} />
            {authenticated ? "حساب من" : "ورود"}
          </Link>
        </header>
        <div className="mx-auto min-w-0 max-w-[1680px] lg:px-6 lg:pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
