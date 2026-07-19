import { NextResponse, type NextRequest } from "next/server";
import { setSession, verifyPassword } from "../../../../../lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = typeof form.get("password") === "string" ? String(form.get("password")) : "";
  if (!verifyPassword(password)) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  setSession(response);
  return response;
}
