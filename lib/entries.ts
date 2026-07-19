import { list, put } from "@vercel/blob";

export type JournalEntry = {
  slug: string;
  date: string;
  placeCs: string;
  placeEn: string;
  titleCs: string;
  titleEn: string;
  summaryCs: string;
  summaryEn: string;
  bodyCs: string;
  bodyEn: string;
  photoUrl?: string;
  photoAltCs?: string;
  photoAltEn?: string;
  publishedAt: string;
};

export const seedEntry: JournalEntry = {
  slug: "the-journey-begins",
  date: "2026-07-19",
  placeCs: "Přípravy",
  placeEn: "Planning",
  titleCs: "Cesta začíná",
  titleEn: "The journey begins",
  summaryCs: "Proč vzniká tento deník a co na jeho stránkách najdete.",
  summaryEn: "Why we are making this journal and what will fill these pages.",
  bodyCs: "V roce 2027 vyrážíme do Japonska a tento deník vezme naše přátele a rodinu s námi.\n\nTrasa už má svůj tvar, ale necháváme v ní dost prostoru, aby nás cesta mohla překvapit. Těšíme se na velká města i tiché chrámy, hory, zahrady a jarní sakury.\n\nJakmile vyrazíme, budou tyto stránky přibývat společně s cestou: zápisky z jednotlivých dní, navštívená místa, fotografie, jídlo i drobnosti, které se ve zprávách snadno ztratí.\n\nTy nejlepší chvíle budou nejspíš ty, které se naplánovat nedají.\n\nTohle je první bod na mapě. Další přibudou z Japonska v dubnu 2027.",
  bodyEn: "In 2027 we are going to Japan, and this journal is our way of bringing friends and family along.\n\nThe route now has a shape, but we are leaving enough room for the trip to surprise us. We are looking forward to great cities and quiet temples, mountains, gardens, and spring cherry blossom.\n\nOnce we set out, these pages will grow with the journey: notes from each day, places, photographs, meals, and the small details that are too easily lost in a stream of messages.\n\nThe best moments will probably be the ones we cannot plan.\n\nThis is the first marker on the map. More will follow from Japan in April 2027.",
  publishedAt: "2026-07-19T00:00:00.000Z",
};

const requiredFields = [
  "slug", "date", "placeCs", "placeEn", "titleCs", "titleEn", "summaryCs",
  "summaryEn", "bodyCs", "bodyEn", "photoUrl", "photoAltCs", "photoAltEn",
] as const;

const limits: Partial<Record<(typeof requiredFields)[number], number>> = {
  slug: 80,
  placeCs: 120,
  placeEn: 120,
  titleCs: 160,
  titleEn: 160,
  summaryCs: 320,
  summaryEn: 320,
  bodyCs: 20_000,
  bodyEn: 20_000,
  photoAltCs: 300,
  photoAltEn: 300,
};

function isPublicBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function validateEntry(value: unknown): JournalEntry {
  if (!value || typeof value !== "object") throw new Error("Invalid entry payload.");
  const source = value as Record<string, unknown>;
  const fields = Object.fromEntries(requiredFields.map((key) => {
    const field = typeof source[key] === "string" ? source[key].trim() : "";
    if (!field) throw new Error(`Missing field: ${key}.`);
    if (limits[key] && field.length > limits[key]!) throw new Error(`Field is too long: ${key}.`);
    return [key, field];
  })) as Record<(typeof requiredFields)[number], string>;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug)) throw new Error("Slug must contain lowercase letters, numbers, and hyphens only.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date) || Number.isNaN(Date.parse(`${fields.date}T00:00:00Z`))) throw new Error("Date must be valid.");
  if (!isPublicBlobUrl(fields.photoUrl)) throw new Error("Photo must be stored in the configured public Vercel Blob store.");

  return { ...fields, publishedAt: new Date().toISOString() };
}

function hasBlobCredentials() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
}

async function storedEntries() {
  if (!hasBlobCredentials()) return [];
  try {
    const { blobs } = await list({ prefix: "entries/", limit: 100 });
    const entries = await Promise.all(blobs.map(async ({ url }) => {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to read ${url}`);
      return response.json() as Promise<JournalEntry>;
    }));
    return entries;
  } catch (error) {
    console.error("Unable to load journal entries from Blob.", error);
    return [];
  }
}

export async function getEntries() {
  const entries = await storedEntries();
  const unique = [seedEntry, ...entries.filter(({ slug }) => slug !== seedEntry.slug)];
  return unique.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEntry(slug: string) {
  return (await getEntries()).find((entry) => entry.slug === slug);
}

export async function saveEntry(value: unknown) {
  if (!hasBlobCredentials()) throw new Error("Vercel Blob is not configured.");
  const entry = validateEntry(value);
  await put(`entries/${entry.slug}.json`, JSON.stringify(entry), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });
  return entry;
}
