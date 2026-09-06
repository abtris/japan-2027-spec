import { NextResponse, type NextRequest } from "next/server";
import { clearSession, isTrustedOrigin } from "../../../../../lib/auth";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  try {
    await clearSession(response, request);
  } catch {
    return NextResponse.json({ error: "Odhlášení se nezdařilo. Zkuste to znovu." }, { status: 503 });
  }
  return response;
}
