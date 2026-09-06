import { NextResponse, type NextRequest } from "next/server";
import { isTrustedOrigin, setSession, verifyPassword } from "../../../../../lib/auth";
import { loginPassword, mediaType } from "../../../../../lib/auth-core";
import { loginRetryAfter } from "../../../../../lib/auth-store";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  if (mediaType(request.headers.get("content-type")) !== "application/x-www-form-urlencoded") {
    return NextResponse.json({ error: "Expected a URL-encoded login form." }, { status: 415 });
  }
  try {
    // Vercel overwrites this header. Outside Vercel use one bucket, not spoofable client headers.
    const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") || "unknown" : "local";
    const retryAfter = await loginRetryAfter(ip);
    if (retryAfter) return NextResponse.json({ error: "Příliš mnoho pokusů. Zkuste to později." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  } catch {
    return NextResponse.json({ error: "Přihlášení je dočasně nedostupné." }, { status: 503 });
  }
  let password: string;
  try {
    password = await loginPassword(request);
  } catch (error) {
    return NextResponse.json({ error: "Invalid login form." }, { status: error instanceof RangeError ? 413 : 400 });
  }
  if (!verifyPassword(password)) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  try {
    await setSession(response);
  } catch {
    return NextResponse.json({ error: "Přihlášení je dočasně nedostupné." }, { status: 503 });
  }
  return response;
}
