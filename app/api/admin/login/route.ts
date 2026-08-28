import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminPassword, createAdminSessionValue, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (typeof password !== "string" || !checkAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return NextResponse.json({ ok: true });
}
