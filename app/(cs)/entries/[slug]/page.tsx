import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryPage } from "../../../../components/entry-page";
import { getEntry } from "../../../../lib/entries";
import { entryMetadata } from "../../../../lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = await getEntry((await params).slug);
  return entry ? entryMetadata(entry, "cs") : {};
}

export default async function CzechEntry({ params }: { params: Promise<{ slug: string }> }) {
  const entry = await getEntry((await params).slug);
  if (!entry) notFound();
  return <EntryPage entry={entry} locale="cs" />;
}
