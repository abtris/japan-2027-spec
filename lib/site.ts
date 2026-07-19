import type { Metadata } from "next";
import type { JournalEntry } from "./entries";
import type { Locale } from "./content";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export function homeMetadata(locale: Locale): Metadata {
  const english = locale === "en";
  const path = english ? "/en/" : "/";
  const title = english ? "Japan 2027 — travel journal" : "Japonsko 2027 — cestovní deník";
  const description = english
    ? "Follow our April 2027 journey through Japan — the route, daily itinerary, stories, and photographs shared with friends and family."
    : "Sledujte naši cestu Japonskem v dubnu 2027 — trasu, denní program, zážitky a fotografie pro přátele a rodinu.";
  return {
    metadataBase: siteUrl,
    title,
    description,
    alternates: { canonical: path, languages: { cs: "/", en: "/en/", "x-default": "/" } },
    openGraph: {
      type: "website", locale: english ? "en_US" : "cs_CZ", alternateLocale: [english ? "cs_CZ" : "en_US"],
      title, description, url: path, images: [{ url: "/assets/social-preview.png", width: 1200, height: 630, alt: english ? "A stylised map of Japan with a red torii gate" : "Stylizovaná mapa Japonska s červenou bránou torii" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/assets/social-preview.png"] },
  };
}

export function entryMetadata(entry: JournalEntry, locale: Locale): Metadata {
  const english = locale === "en";
  const prefix = english ? "/en" : "";
  const title = `${english ? entry.titleEn : entry.titleCs} — ${english ? "Japan" : "Japonsko"} 2027`;
  const description = english ? entry.summaryEn : entry.summaryCs;
  const path = `${prefix}/entries/${entry.slug}/`;
  const image = entry.photoUrl || "/assets/social-preview.png";
  const alt = english ? entry.photoAltEn : entry.photoAltCs;
  return {
    metadataBase: siteUrl,
    title,
    description,
    alternates: { canonical: path, languages: { cs: `/entries/${entry.slug}/`, en: `/en/entries/${entry.slug}/`, "x-default": `/entries/${entry.slug}/` } },
    openGraph: { type: "article", locale: english ? "en_US" : "cs_CZ", title, description, url: path, images: [{ url: image, alt: alt || title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
