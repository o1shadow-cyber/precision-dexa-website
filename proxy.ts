import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionValue, ADMIN_COOKIE_NAME } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSessionValue(session)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin"],
};
