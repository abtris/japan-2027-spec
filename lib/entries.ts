import { del, list, put } from "@vercel/blob";

export type PhotoExif = {
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  exposureTime?: number;
  iso?: number;
  capturedAt?: string;
};

export type JournalPhoto = {
  url: string;
  altCs: string;
  altEn: string;
  titleCs?: string;
  titleEn?: string;
  descriptionCs?: string;
  descriptionEn?: string;
  exif?: PhotoExif;
};

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
  photos: JournalPhoto[];
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
  photos: [],
  publishedAt: "2026-07-19T00:00:00.000Z",
};

const requiredFields = [
  "slug", "date", "placeCs", "placeEn", "titleCs", "titleEn", "summaryCs",
  "summaryEn", "bodyCs", "bodyEn",
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
};

function isPublicBlobUrl(value: string, slug: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") && url.pathname.startsWith(`/images/${slug}/`);
  } catch {
    return false;
  }
}

function optionalText(source: Record<string, unknown>, key: string, limit: number) {
  const value = typeof source[key] === "string" ? source[key].trim() : "";
  if (value.length > limit) throw new Error(`Field is too long: ${key}.`);
  return value || undefined;
}

function optionalNumber(source: Record<string, unknown>, key: string, max: number) {
  const value = source[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > max) throw new Error(`Invalid EXIF field: ${key}.`);
  return value;
}

function validatePhoto(value: unknown, slug: string): JournalPhoto {
  if (!value || typeof value !== "object") throw new Error("Invalid photograph.");
  const source = value as Record<string, unknown>;
  const url = typeof source.url === "string" ? source.url.trim() : "";
  const altCs = typeof source.altCs === "string" ? source.altCs.trim() : "";
  const altEn = typeof source.altEn === "string" ? source.altEn.trim() : "";
  if (!isPublicBlobUrl(url, slug)) throw new Error("Photo must be stored under this entry in the configured public Vercel Blob store.");
  if (!altCs || !altEn) throw new Error("Each photograph requires Czech and English alternative text.");
  if (altCs.length > 300 || altEn.length > 300) throw new Error("Photograph alternative text is too long.");

  const photo: JournalPhoto = {
    url,
    altCs,
    altEn,
    titleCs: optionalText(source, "titleCs", 160),
    titleEn: optionalText(source, "titleEn", 160),
    descriptionCs: optionalText(source, "descriptionCs", 1_000),
    descriptionEn: optionalText(source, "descriptionEn", 1_000),
  };
  if (source.exif && typeof source.exif === "object") {
    const raw = source.exif as Record<string, unknown>;
    const capturedAt = optionalText(raw, "capturedAt", 40);
    if (capturedAt && Number.isNaN(Date.parse(capturedAt))) throw new Error("Invalid EXIF field: capturedAt.");
    const exif = Object.fromEntries(Object.entries({
      camera: optionalText(raw, "camera", 160),
      lens: optionalText(raw, "lens", 200),
      focalLength: optionalNumber(raw, "focalLength", 2_000),
      aperture: optionalNumber(raw, "aperture", 128),
      exposureTime: optionalNumber(raw, "exposureTime", 86_400),
      iso: optionalNumber(raw, "iso", 10_000_000),
      capturedAt,
    }).filter(([, field]) => field !== undefined)) as PhotoExif;
    if (Object.keys(exif).length) photo.exif = exif;
  }
  return photo;
}

export function validateEntry(value: unknown, publishedAt = new Date().toISOString()): JournalEntry {
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
  if (!Array.isArray(source.photos) || source.photos.length < 1 || source.photos.length > 5) throw new Error("An entry requires one to five photographs.");

  return { ...fields, photos: source.photos.map((photo) => validatePhoto(photo, fields.slug)), publishedAt };
}

function normalizeStoredEntry(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid stored entry.");
  const source = value as Record<string, unknown>;
  const photos = Array.isArray(source.photos) ? source.photos : source.photoUrl ? [{
    url: source.photoUrl,
    altCs: source.photoAltCs,
    altEn: source.photoAltEn,
  }] : [];
  const publishedAt = typeof source.publishedAt === "string" && !Number.isNaN(Date.parse(source.publishedAt))
    ? source.publishedAt
    : `${String(source.date)}T00:00:00.000Z`;
  return validateEntry({ ...source, photos }, publishedAt);
}

function hasBlobCredentials() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
}

async function storedEntries() {
  if (!hasBlobCredentials()) return [];
  try {
    const { blobs } = await list({ prefix: "entries/", limit: 100 });
    return await Promise.all(blobs.map(async ({ url }) => {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to read ${url}`);
      return normalizeStoredEntry(await response.json());
    }));
  } catch (error) {
    console.error("Unable to load journal entries from Blob.", error);
    return [];
  }
}

export async function getStoredEntries() {
  return (await storedEntries()).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEntries() {
  const entries = await getStoredEntries();
  const unique = [seedEntry, ...entries.filter(({ slug }) => slug !== seedEntry.slug)];
  return unique.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEntry(slug: string) {
  return (await getEntries()).find((entry) => entry.slug === slug);
}

export async function saveEntry(value: unknown) {
  if (!hasBlobCredentials()) throw new Error("Vercel Blob is not configured.");
  const candidate = validateEntry(value);
  if (candidate.slug === seedEntry.slug) throw new Error("The introductory entry cannot be changed.");
  const previous = (await storedEntries()).find(({ slug }) => slug === candidate.slug);
  const entry = { ...candidate, publishedAt: previous?.publishedAt || candidate.publishedAt };
  await put(`entries/${entry.slug}.json`, JSON.stringify(entry), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });
  const currentUrls = new Set(entry.photos.map(({ url }) => url));
  const removedUrls = previous?.photos.map(({ url }) => url).filter((url) => !currentUrls.has(url)) || [];
  if (removedUrls.length) await del(removedUrls);
  return entry;
}

export async function deleteEntry(slug: string) {
  if (!hasBlobCredentials()) throw new Error("Vercel Blob is not configured.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === seedEntry.slug) throw new Error("Invalid entry slug.");
  const entry = (await storedEntries()).find((item) => item.slug === slug);
  if (!entry) throw new Error("Entry not found.");
  await del([`entries/${slug}.json`, ...entry.photos.map(({ url }) => url)]);
}
