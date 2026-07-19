import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticatedRequest } from "../../../../../lib/auth";
import { saveEntry } from "../../../../../lib/entries";

export async function POST(request: NextRequest) {
  if (!isAuthenticatedRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const entry = await saveEntry(await request.json());
    revalidatePath("/");
    revalidatePath("/en/");
    return NextResponse.json({
      entry,
      urls: { cs: `/entries/${entry.slug}/`, en: `/en/entries/${entry.slug}/` },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Publication failed." }, { status: 400 });
  }
}
