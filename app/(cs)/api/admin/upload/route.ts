import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticatedRequest } from "../../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as HandleUploadBody;
    if (body.type === "blob.generate-client-token" && !isAuthenticatedRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || "{}") as { slug?: string };
        if (!payload.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) throw new Error("Invalid slug.");
        if (!pathname.startsWith(`images/${payload.slug}/`)) throw new Error("Invalid upload path.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 20 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
