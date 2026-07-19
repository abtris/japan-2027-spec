import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "../../../../../lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  clearSession(response);
  return response;
}
