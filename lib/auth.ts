import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { credentialsConfigured, equal, sessionToken, SESSION_SECONDS, trustedOrigin, verifyBearer, verifySession } from "./auth-core";

const COOKIE_NAME = "japan-admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function scope() {
  return process.env.VERCEL_ENV || "local";
}

export function authConfigured() {
  return credentialsConfigured(process.env.ADMIN_PASSWORD || "", secret());
}

export function verifyPassword(password: string) {
  return authConfigured() && password.length <= 1024 && equal(password, process.env.ADMIN_PASSWORD!);
}

function verifyToken(token?: string) {
  return verifySession(token, process.env.ADMIN_PASSWORD || "", secret(), scope());
}

export function isTrustedOrigin(request: NextRequest) {
  // Never trust a sibling subdomain, wildcard, or a caller-supplied Host as the production allowlist.
  const allowed = process.env.ADMIN_ALLOWED_ORIGINS
    ? process.env.ADMIN_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : [process.env.NEXT_PUBLIC_SITE_URL, ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map((host) => `https://${host}`)].filter((origin): origin is string => Boolean(origin));
  if (!process.env.VERCEL) {
    const local = new URL(request.url);
    if (["localhost", "127.0.0.1", "[::1]"].includes(local.hostname)) allowed.push(local.origin);
  }
  return trustedOrigin(request.headers.get("origin"), allowed);
}

export async function isAuthenticated() {
  return verifyToken((await cookies()).get(COOKIE_NAME)?.value);
}

export function isAuthenticatedRequest(request: NextRequest) {
  if (verifyBearer(request.headers.get("authorization"), process.env.ADMIN_API_TOKEN || "")) return true;
  return verifyToken(request.cookies.get(COOKIE_NAME)?.value)
    && (["GET", "HEAD", "OPTIONS"].includes(request.method) || isTrustedOrigin(request));
}

export function setSession(response: NextResponse) {
  if (!authConfigured()) throw new Error("Administrator authentication is not configured.");
  const expires = Date.now() + SESSION_SECONDS * 1000;
  response.cookies.set(COOKIE_NAME, sessionToken(expires, process.env.ADMIN_PASSWORD!, secret(), scope()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function clearSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}
