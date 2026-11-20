"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AudioLines, CircleStar, Clock3, Compass, Disc3, Heart, Home, Library, ListMusic, PanelRight, Search, Settings, UserRound, Users } from "lucide-react";
import { useAppSelector } from "@/redux/hook";

const main = [
  { href: "/browse", title: "خانه", icon: Home, exact: true },
  { href: "/explore", title: "کاوش", icon: Compass },
  { href: "/search", title: "جست‌وجو", icon: Search },
];

const library = [
  { href: "/library", title: "کتابخانهٔ من", icon: Library, exact: true },
  { href: "/library/LikedSongs", title: "آهنگ‌های پسندیده", icon: Heart },
  { href: "/library/recent", title: "آخرین پخش‌ها", icon: Clock3 },
  { href: "/library?view=playlists", title: "پلی‌لیست‌های من", icon: ListMusic },
  { href: "/browse/albums", title: "آلبوم‌ها", icon: Disc3 },
  { href: "/library/following", title: "هنرمندان دنبال‌شده", icon: Users },
];

const account = [
  { href: "/beats", title: "بازار بیت", icon: AudioLines },
  { href: "/browse/trackpacks", title: "اشتراک", icon: CircleStar },
  { href: "/settings", title: "تنظیمات", icon: Settings },
];

export default function DesktopNavigation({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const [width, setWidth] = useState(248);
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const renderLinks = (links: (typeof main)) => links.map(({ href, title, icon: Icon, exact }) => {
    const current = pathname === href || (!exact && pathname.startsWith(href + "/"));
    return (
      <Link key={href} href={href} aria-label={title} title={title}
        aria-current={current ? "page" : undefined} className="milify-nav-link">
        <Icon size={20} className="shrink-0" />
        {expanded && <span className="truncate">{title}</span>}
      </Link>
    );
  });

  return (
    <div className="milify-shell min-h-dvh lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
      <aside className="milify-sidebar" style={{ width: expanded ? `clamp(12rem, ${width}px, 29vw)` : "4.5rem" }}>
        <div className="flex items-center justify-between gap-2">
          {expanded && <Link href="/browse" className="flex min-w-0 items-center gap-2 font-black">
            <Image src="/Icons/milify-192.png" alt="" width={32} height={32} className="rounded-lg" />
            <span className="truncate">میلیفای</span>
          </Link>}
          <button type="button" aria-label={expanded ? "جمع کردن منو" : "باز کردن منو"}
            aria-controls="desktop-nav" aria-expanded={expanded} className="milify-icon"
            onClick={() => setExpanded(!expanded)}><PanelRight size={20} /></button>
        </div>
        <div id="desktop-nav" className="flex min-h-0 flex-1 flex-col gap-3">
          <nav aria-label="منوی اصلی" className="grid gap-1">{renderLinks(main)}</nav>
          <nav aria-label="کتابخانه" className="grid min-h-0 auto-rows-min gap-1 overflow-y-auto border-y border-white/10 py-3">
            {renderLinks(library)}
          </nav>
          <nav aria-label="خدمات و تنظیمات" className="mt-auto grid gap-1">{renderLinks(account)}</nav>
        </div>
        {expanded && <input type="range" min={192} max={360} step={8} value={width}
          className="w-full accent-[var(--milify-green)]" aria-label="عرض منوی کناری"
          onChange={(event) => setWidth(event.target.valueAsNumber)} />}
      </aside>
      <div className="min-w-0">
        <header className="milify-header">
          <form role="search" className="milify-search w-full max-w-sm" onSubmit={(event) => {
            event.preventDefault();
            const query = new FormData(event.currentTarget).get("query")?.toString().trim();
            router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
          }}>
            <button type="submit" aria-label="جست‌وجو"><Search size={18} /></button>
            <input name="query" type="search" maxLength={200} aria-label="جست‌وجوی موسیقی" placeholder="جست‌وجوی موسیقی" />
          </form>
          <Link href={authenticated ? "/profile" : "/auth/login"} className="milify-chip flex shrink-0 items-center gap-2">
            <UserRound size={18} />{authenticated ? "حساب من" : "ورود"}
          </Link>
        </header>
        <div className="mx-auto min-w-0 max-w-[1680px] lg:px-6">{children}</div>
      </div>
    </div>
  );
}
