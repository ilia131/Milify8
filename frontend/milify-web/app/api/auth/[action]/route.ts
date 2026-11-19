import { NextRequest, NextResponse } from "next/server";

const endpoints = {
  login: "jwt/create",
  google: "google/login",
  refresh: "jwt/refresh",
  logout: "logout",
} as const;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function clearSession(response: NextResponse) {
  for (const name of ["access", "refresh"]) {
    response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
  }
  return response;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!Object.hasOwn(endpoints, action)) {
    return new NextResponse(null, { status: 404 });
  }

  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    return new NextResponse(null, { status: 403 });
  }

  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const unavailable = () => NextResponse.json(
    { detail: "سرویس ورود در دسترس نیست." }, { status: 503 },
  );
  if (!apiUrl) return unavailable();

  const refresh = request.cookies.get("refresh")?.value;
  if (action === "refresh" && !refresh) {
    return clearSession(new NextResponse(null, { status: 401 }));
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  const access = request.cookies.get("access")?.value;
  if (action === "google" && access) headers.set("Cookie", `access=${access}`);

  try {
    const upstream = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/${endpoints[action as keyof typeof endpoints]}/`,
      {
        method: "POST",
        headers,
        body: action === "refresh" || action === "logout"
          ? JSON.stringify({ refresh })
          : await request.text(),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (action === "logout" && upstream.ok) {
      return clearSession(new NextResponse(null, { status: 204 }));
    }

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      const response = NextResponse.json(
        data ?? { detail: "درخواست انجام نشد." }, { status: upstream.status },
      );
      return action === "refresh" && upstream.status === 401
        ? clearSession(response)
        : response;
    }
    if (typeof data?.access !== "string") return unavailable();

    const response = NextResponse.json(
      { created: data.created, user: data.user },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set("access", data.access, { ...cookieOptions, maxAge: 3600 });
    if (typeof data.refresh === "string") {
      response.cookies.set("refresh", data.refresh, { ...cookieOptions, maxAge: 604800 });
    }
    return response;
  } catch {
    return unavailable();
  }
}
