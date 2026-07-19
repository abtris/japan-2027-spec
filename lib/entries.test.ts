import assert from "node:assert/strict";
import test from "node:test";
import { validateEntry } from "./entries.ts";

const photo = (number: number) => ({
  url: `https://store.public.blob.vercel-storage.com/images/hiroshima-day-3/photo-${number}.webp`,
  altCs: `Fotografie ${number}`,
  altEn: `Photograph ${number}`,
  exif: { camera: "Nikon Z8", iso: 100, latitude: 50.08 },
});

const entry = (photos: unknown[]) => ({
  slug: "hiroshima-day-3",
  date: "2027-04-03",
  placeCs: "Hirošima",
  placeEn: "Hiroshima",
  titleCs: "Hirošima",
  titleEn: "Hiroshima",
  summaryCs: "Den v Hirošimě.",
  summaryEn: "A day in Hiroshima.",
  bodyCs: "Text zápisku.",
  bodyEn: "Entry text.",
  photos,
});

test("validates one-to-five photos and keeps only selected EXIF", () => {
  const valid = validateEntry(entry(Array.from({ length: 5 }, (_, index) => photo(index + 1))));
  assert.equal(valid.photos.length, 5);
  assert.deepEqual(valid.photos[0].exif, { camera: "Nikon Z8", iso: 100 });
  assert.throws(() => validateEntry(entry([])), /one to five/);
  assert.throws(() => validateEntry(entry(Array.from({ length: 6 }, (_, index) => photo(index + 1)))), /one to five/);
  assert.throws(() => validateEntry(entry([{ ...photo(1), url: "https://store.public.blob.vercel-storage.com/images/another-entry/photo.webp" }])), /under this entry/);
});
