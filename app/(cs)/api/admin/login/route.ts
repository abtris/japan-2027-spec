import { NextResponse, type NextRequest } from "next/server";
import { isTrustedOrigin, setSession, verifyPassword } from "../../../../../lib/auth";
import { loginPassword, mediaType } from "../../../../../lib/auth-core";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  if (mediaType(request.headers.get("content-type")) !== "application/x-www-form-urlencoded") {
    return NextResponse.json({ error: "Expected a URL-encoded login form." }, { status: 415 });
  }
  let password: string;
  try {
    password = await loginPassword(request);
  } catch (error) {
    return NextResponse.json({ error: "Invalid login form." }, { status: error instanceof RangeError ? 413 : 400 });
  }
  if (!verifyPassword(password)) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  setSession(response);
  return response;
}
