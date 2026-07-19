import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { equal, verifyBearer } from "./auth-core";

const COOKIE_NAME = "japan-admin";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function signature(expires: string) {
  return createHmac("sha256", secret()).update(expires).digest("base64url");
}

export function authConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret().length >= 32);
}

export function verifyPassword(password: string) {
  return authConfigured() && equal(password, process.env.ADMIN_PASSWORD!);
}

function verifyToken(token?: string) {
  if (!authConfigured() || !token) return false;
  const [expires, provided, extra] = token.split(".");
  return !extra && /^\d+$/.test(expires) && Number(expires) > Date.now() && equal(provided || "", signature(expires));
}

export async function isAuthenticated() {
  return verifyToken((await cookies()).get(COOKIE_NAME)?.value);
}

export function isAuthenticatedRequest(request: NextRequest) {
  return verifyToken(request.cookies.get(COOKIE_NAME)?.value)
    || verifyBearer(request.headers.get("authorization"), process.env.ADMIN_API_TOKEN || "");
}

export function setSession(response: NextResponse) {
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  response.cookies.set(COOKIE_NAME, `${expires}.${signature(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function clearSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
}
