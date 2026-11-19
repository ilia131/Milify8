import type { Metadata } from "next";
import localFont from "next/font/local";
import type { CSSProperties, ReactNode } from "react";
import { PanelLayout } from "@milify/panel-kit/layout";
import { links } from "@/services/routes";
import "@milify/panel-kit/panel.css";

const font = localFont({ src: "../public/fonts/Vazirmatn.ttf", variable: "--panel-font", display: "swap" });

export const metadata: Metadata = { title: "مدیریت میلیفای", robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="fa" dir="rtl" className={font.variable} style={{ "--accent": "#b5a6fc" } as CSSProperties}>
    <body><PanelLayout links={links} title="مدیریت میلیفای">{children}</PanelLayout></body>
  </html>;
}
