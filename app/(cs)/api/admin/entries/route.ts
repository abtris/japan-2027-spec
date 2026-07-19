import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticatedRequest } from "../../../../../lib/auth";
import { deleteEntry, getStoredEntries, saveEntry } from "../../../../../lib/entries";

function refreshEntry(slug?: string) {
  revalidatePath("/");
  revalidatePath("/en/");
  if (slug) {
    revalidatePath(`/entries/${slug}/`);
    revalidatePath(`/en/entries/${slug}/`);
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthenticatedRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ entries: await getStoredEntries() });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const entry = await saveEntry(await request.json());
    refreshEntry(entry.slug);
    return NextResponse.json({
      entry,
      urls: { cs: `/entries/${entry.slug}/`, en: `/en/entries/${entry.slug}/` },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Publication failed." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticatedRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const slug = request.nextUrl.searchParams.get("slug") || "";
  try {
    await deleteEntry(slug);
    refreshEntry(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Deletion failed." }, { status: 400 });
  }
}
