"use client";

import { Compass, Home, Library, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/browse", label: "خانه", icon: Home },
  { href: "/search", label: "جست‌وجو", icon: Search },
  { href: "/explore", label: "کاوش", icon: Compass },
  { href: "/library", label: "کتابخانه", icon: Library },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="منوی اصلی" className="milify-bottom-nav">
      {items.map(({ href, label, icon: Icon }) => <Link key={href} href={href}
        aria-current={pathname === href || pathname.startsWith(href + "/") ? "page" : undefined}
        className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-xs">
        <Icon size={21} />{label}
      </Link>)}
    </nav>
  );
}
