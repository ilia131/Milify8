import { NextRequest, NextResponse } from "next/server";

type Panel = "admin" | "artist";

const maxUpload = 128 * 1024 * 1024;
const noStore = { "Cache-Control": "no-store" };

function endpoint(path: string) {
  const server = process.env.API_URL;
  if (!server) throw new Error("API_URL is missing");
  return `${server.replace(/\/+$/, "")}/api/${path}`;
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin === (process.env.PANEL_ORIGIN || request.nextUrl.origin)
    && (!request.headers.has("sec-fetch-site") || request.headers.get("sec-fetch-site") === "same-origin");
}

function fail(status: number, detail: string) {
  return NextResponse.json({ detail }, { status, headers: noStore });
}

function cookies(response: NextResponse, panel: Panel, tokens?: { access: string; refresh: string }) {
  for (const [key, age] of [["access", 3600], ["refresh", 604800]] as const) {
    response.cookies.set(`milify_${panel}_${key}`, tokens?.[key] ?? "", {
      maxAge: tokens ? age : 0,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      path: "/",
    });
  }
  return response;
}

function bearer(request: NextRequest, panel: Panel) {
  const token = request.cookies.get(`milify_${panel}_access`)?.value;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function forward(response: Response) {
  if (response.status === 204) return new NextResponse(null, { status: 204, headers: noStore });
  const contentType = response.headers.get("Content-Type")?.split(";")[0].trim();
  if (contentType !== "application/json" && contentType !== "application/problem+json") {
    return fail(response.ok ? 502 : response.status, "پاسخ سرویس میلیفای قابل پردازش نیست.");
  }
  return new NextResponse(response.body, {
    status: response.status, headers: { ...noStore, "Content-Type": contentType },
  });
}

export function sessionHandler(panel: Panel) {
  return async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
    const { action } = await context.params;
    if (!["login", "refresh", "logout"].includes(action) && !(panel === "artist" && action === "google")) return fail(404, "مسیر پیدا نشد.");
    if (!sameOrigin(request) || request.headers.get("content-type")?.split(";")[0] !== "application/json") {
      return fail(403, "مبدأ درخواست مجاز نیست.");
    }
    const refresh = request.cookies.get(`milify_${panel}_refresh`)?.value;
    if (action === "refresh" && !refresh) return cookies(fail(401, "نشست پایان یافته است."), panel);

    try {
      const response = await fetch(endpoint(action === "logout" ? "logout/" : `panels/${panel}/${action}/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "login" || action === "google" ? await request.text() : JSON.stringify({ refresh }),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const result = forward(response);
        return action === "refresh" && [401, 403].includes(response.status) ? cookies(result, panel) : result;
      }
      if (action === "logout") return cookies(new NextResponse(null, { status: 204, headers: noStore }), panel);
      const tokens = await response.json();
      if (typeof tokens?.access !== "string" || typeof tokens?.refresh !== "string") {
        return fail(502, "پاسخ سرویس ورود معتبر نیست.");
      }
      return cookies(new NextResponse(null, { status: 204, headers: noStore }), panel, tokens);
    } catch {
      return fail(503, "سرویس ورود در دسترس نیست.");
    }
  };
}

export function dataHandler(panel: Panel, allowedPaths: RegExp) {
  return async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    const route = path.join("/");
    if (!path.every((item) => item && !/[\\/]/.test(item) && item !== "." && item !== "..") || !allowedPaths.test(route)) {
      return fail(404, "مسیر پیدا نشد.");
    }
    if (request.method !== "GET" && !sameOrigin(request)) return fail(403, "مبدأ درخواست مجاز نیست.");
    const auth = bearer(request, panel);
    if (!auth) return fail(401, "لطفاً وارد حساب شوید.");

    try {
      const control = await fetch(endpoint(`panels/${panel}/me/`), {
        headers: auth, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
      });
      if (!control.ok || route === "me") return forward(control);

      const headers = new Headers(auth);
      let body: ArrayBuffer | undefined;
      if (request.body) {
        if (Number(request.headers.get("Content-Length")) > maxUpload) return fail(413, "حجم فایل بیش از حد مجاز است.");
        const contentType = request.headers.get("Content-Type");
        if (contentType) headers.set("Content-Type", contentType);
        const reader = request.body.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > maxUpload) {
            await reader.cancel();
            return fail(413, "حجم فایل بیش از حد مجاز است.");
          }
          chunks.push(value);
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        body = bytes.buffer;
      }
      const encoded = path.map(encodeURIComponent).join("/");
      return forward(await fetch(endpoint(`${encoded}/${request.nextUrl.search}`), {
        method: request.method, headers, body, cache: "no-store", redirect: "error",
        signal: AbortSignal.timeout(body ? 120000 : 20000),
      }));
    } catch {
      return fail(503, "ارتباط با سرویس میلیفای برقرار نشد.");
    }
  };
}
