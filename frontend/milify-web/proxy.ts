import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.cookies.has("access") || request.cookies.has("refresh")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: [
    "/library/:path*",
    "/settings",
    "/settings/edit-profile",
    "/settings/change-password",
    "/profile/:path*",
    "/notifications/:path*",
    "/purchases/:path*",
  ],
};
