"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ApiError, api, session, type PanelUser } from "./client";

const User = createContext<PanelUser | null>(null);

export function usePanelUser() {
  const user = useContext(User);
  if (!user) throw new Error("Panel session is required");
  return user;
}

export function PanelLayout({ children, title, links }: {
  children: ReactNode;
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PanelUser | null>(null);
  const [state, setState] = useState<"checking" | "granted" | "denied" | "error">("checking");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [isLoggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    function expired() {
      setUser(null);
      setState("denied");
      if (pathname !== "/login") router.replace("/login");
    }
    window.addEventListener("milify-session-ended", expired);
    if (pathname !== "/login") {
      api<PanelUser>("me", { signal: controller.signal }).then((account) => {
        if (controller.signal.aborted) return;
        setUser(account);
        setState("granted");
      }).catch((failure) => {
        if (controller.signal.aborted) return;
        if (failure instanceof ApiError && [401, 403].includes(failure.status)) expired();
        else setState("error");
      });
    }
    return () => {
      controller.abort();
      window.removeEventListener("milify-session-ended", expired);
    };
  }, [attempt, pathname, router]);

  if (pathname === "/login") return <main className="panel-login">{children}</main>;
  if (state !== "granted" || !user) {
    return <main className="panel-login">
      {state === "error" ? <>
        <p role="alert">سرویس پنل در دسترس نیست.</p>
        <button onClick={() => { setState("checking"); setAttempt(attempt + 1); }}>تلاش دوباره</button>
      </> : <p role="status">در حال بررسی نشست…</p>}
    </main>;
  }

  async function logout() {
    setError("");
    setLoggingOut(true);
    try {
      await session("logout");
      setUser(null);
      setState("denied");
      router.replace("/login");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "خروج انجام نشد.");
    } finally {
      setLoggingOut(false);
    }
  }

  return <User.Provider value={user}>
    <div className="panel-shell">
      <aside className="panel-sidebar">
        <Link href="/" className="panel-brand">{title}</Link>
        <nav aria-label="منوی پنل">
          {links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
        </nav>
        <button type="button" className="panel-secondary" disabled={isLoggingOut} onClick={logout}>خروج</button>
        {error && <p role="alert">{error}</p>}
      </aside>
      <main className="panel-content">
        <header className="panel-user">{user.artist_name || user.username}</header>
        {children}
      </main>
    </div>
  </User.Provider>;
}

export function PanelLogin({ title }: { title: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setError("");
    try {
      await session("login", fields);
      window.location.replace("/");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "ورود انجام نشد.");
      setPending(false);
    }
  }
  return <form onSubmit={submit} className="panel-card panel-form">
    <h1>{title}</h1>
    <label>ایمیل<input dir="ltr" name="email" type="email" autoComplete="username" required /></label>
    <label>رمز عبور<input dir="ltr" name="password" type="password" autoComplete="current-password" required /></label>
    <button disabled={pending}>{pending ? "در حال ورود…" : "ورود"}</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
