"use client";

import { upload } from "@vercel/blob/client";
import { parse } from "exifr";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { JournalEntry, JournalPhoto, PhotoExif } from "../lib/entries";

type Result = { message: string; urls?: { cs: string; en: string }; error?: boolean };
type PhotoDraft = Omit<JournalPhoto, "url"> & { id: string; url?: string; file?: File };
type PhotoTextField = "altCs" | "altEn" | "titleCs" | "titleEn" | "descriptionCs" | "descriptionEn";

function LocalPhotoPreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return url ? <img src={url} alt="" /> : null;
}

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const exifFields = ["Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO", "DateTimeOriginal"];

function exifText(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function exifNumber(value: unknown) {
  const number = Array.isArray(value) ? value[0] : value;
  return typeof number === "number" && Number.isFinite(number) && number > 0 ? number : undefined;
}

function localExifDate(date: Date) {
  const part = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}:${part(date.getSeconds())}`;
}

async function extractExif(file: File): Promise<PhotoExif | undefined> {
  const raw = await parse(file, exifFields).catch(() => undefined) as Record<string, unknown> | undefined;
  if (!raw) return undefined;
  const make = exifText(raw.Make);
  const model = exifText(raw.Model);
  const camera = make && model && !model.toLowerCase().includes(make.toLowerCase()) ? `${make} ${model}` : model || make;
  const date = raw.DateTimeOriginal instanceof Date && !Number.isNaN(raw.DateTimeOriginal.valueOf()) ? localExifDate(raw.DateTimeOriginal) : undefined;
  const exif: PhotoExif = {
    camera,
    lens: exifText(raw.LensModel),
    focalLength: exifNumber(raw.FocalLength),
    aperture: exifNumber(raw.FNumber),
    exposureTime: exifNumber(raw.ExposureTime),
    iso: exifNumber(raw.ISO),
    capturedAt: date,
  };
  return Object.values(exif).some((value) => value !== undefined) ? exif : undefined;
}

async function resizePhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Fotografii se nepodařilo zpracovat.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .85));
  if (!blob) throw new Error("Fotografii se nepodařilo zmenšit.");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.webp`, { type: "image/webp" });
}

export function PublishForm({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<JournalEntry>();
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>();

  function startNew() {
    document.querySelector<HTMLFormElement>("#entry-editor")?.reset();
    setEditing(undefined);
    setPhotos([]);
    setResult(undefined);
  }

  function startEdit(entry: JournalEntry) {
    setEditing(entry);
    setPhotos(entry.photos.map((photo) => ({ ...photo, id: photo.url })));
    setResult(undefined);
    requestAnimationFrame(() => document.querySelector("#entry-editor")?.scrollIntoView({ behavior: "smooth" }));
  }

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    try {
      if (photos.length + files.length > 5) throw new Error("Zápisek může obsahovat nejvýše pět fotografií.");
      files.forEach((file) => {
        if (!imageTypes.includes(file.type)) throw new Error("Fotografie musí být JPEG, PNG nebo WebP.");
        if (file.size > 20 * 1024 * 1024) throw new Error("Jedna fotografie může mít nejvýše 20 MB.");
      });
      setPhotos((current) => [...current, ...files.map((file) => ({ id: crypto.randomUUID(), file, altCs: "", altEn: "" }))]);
      setResult(undefined);
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Fotografie nelze přidat.", error: true });
    }
  }

  function updatePhoto(id: string, field: PhotoTextField, value: string) {
    setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, [field]: value } : photo));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(undefined);
    const form = event.currentTarget;
    const data = new FormData(form);
    const slug = String(data.get("slug") || "");
    try {
      if (photos.length < 1 || photos.length > 5) throw new Error("Přidejte jednu až pět fotografií.");
      if (photos.some(({ altCs, altEn }) => !altCs.trim() || !altEn.trim())) throw new Error("Každá fotografie potřebuje alternativní text česky i anglicky.");
      const uploaded: JournalPhoto[] = await Promise.all(photos.map(async (photo, index) => {
        if (photo.url) {
          const { id: _id, file: _file, ...stored } = photo;
          return { ...stored, url: photo.url };
        }
        if (!photo.file) throw new Error("Fotografii se nepodařilo načíst.");
        const [exif, resized] = await Promise.all([extractExif(photo.file!), resizePhoto(photo.file!)]);
        const blob = await upload(`images/${slug}/photo-${index + 1}.webp`, resized, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
          clientPayload: JSON.stringify({ slug }),
        });
        return {
          url: blob.url,
          altCs: photo.altCs,
          altEn: photo.altEn,
          titleCs: photo.titleCs,
          titleEn: photo.titleEn,
          descriptionCs: photo.descriptionCs,
          descriptionEn: photo.descriptionEn,
          exif,
        };
      }));
      const payload = Object.fromEntries(data.entries());
      const response = await fetch("/api/admin/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, photos: uploaded }),
      });
      const json = await response.json() as { error?: string; urls?: { cs: string; en: string } };
      if (!response.ok || !json.urls) throw new Error(json.error || "Uložení se nezdařilo.");
      form.reset();
      setEditing(undefined);
      setPhotos([]);
      setResult({ message: editing ? "Zápisek byl upraven." : "Zápisek byl publikován.", urls: json.urls });
      router.refresh();
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Uložení se nezdařilo.", error: true });
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(entry: JournalEntry) {
    if (!confirm(`Opravdu odstranit „${entry.titleCs}“ včetně fotografií?`)) return;
    setBusy(true);
    setResult(undefined);
    try {
      const response = await fetch(`/api/admin/entries?slug=${encodeURIComponent(entry.slug)}`, { method: "DELETE" });
      const json = await response.json() as { error?: string };
      if (!response.ok) throw new Error(json.error || "Odstranění se nezdařilo.");
      if (editing?.slug === entry.slug) startNew();
      setResult({ message: "Zápisek byl odstraněn." });
      router.refresh();
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Odstranění se nezdařilo.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="admin-entries" aria-labelledby="entries-title">
        <div className="admin-section-heading"><h2 id="entries-title">Zápisky</h2><button type="button" onClick={startNew}>Nový zápisek</button></div>
        {entries.length ? <ul>{entries.map((entry) => <li key={entry.slug}>
          <div><strong>{entry.titleCs}</strong><span>{entry.date} · {entry.placeCs} · {entry.photos.length} foto</span></div>
          <div className="admin-entry-actions"><button type="button" className="button-secondary" onClick={() => startEdit(entry)} disabled={busy}>Upravit</button><button type="button" className="button-danger" onClick={() => removeEntry(entry)} disabled={busy}>Odstranit</button></div>
        </li>)}</ul> : <p>Zatím nejsou publikované žádné vlastní zápisky.</p>}
      </section>

      <form className="publish-form" id="entry-editor" key={editing?.slug || "new"} onSubmit={submit}>
        <fieldset disabled={busy}>
          <legend>{editing ? "Upravit zápisek" : "Nový zápisek"}</legend>
          <div className="form-grid">
            <label>Slug<input name="slug" required readOnly={Boolean(editing)} defaultValue={editing?.slug} maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="hiroshima-day-3" /></label>
            <label>Datum<input name="date" type="date" required defaultValue={editing?.date} /></label>
            <label>Místo česky<input name="placeCs" required defaultValue={editing?.placeCs} maxLength={120} /></label>
            <label>Place in English<input name="placeEn" required defaultValue={editing?.placeEn} maxLength={120} /></label>
            <label>Název česky<input name="titleCs" required defaultValue={editing?.titleCs} maxLength={160} /></label>
            <label>English title<input name="titleEn" required defaultValue={editing?.titleEn} maxLength={160} /></label>
            <label>Shrnutí česky<textarea name="summaryCs" required defaultValue={editing?.summaryCs} maxLength={320} rows={3} /></label>
            <label>English summary<textarea name="summaryEn" required defaultValue={editing?.summaryEn} maxLength={320} rows={3} /></label>
            <label>Text česky<textarea name="bodyCs" required defaultValue={editing?.bodyCs} maxLength={20000} rows={10} /></label>
            <label>English text<textarea name="bodyEn" required defaultValue={editing?.bodyEn} maxLength={20000} rows={10} /></label>
          </div>

          <div className="photo-editor">
            <div className="admin-section-heading"><h2>Fotografie <small>{photos.length}/5</small></h2><label className="file-button">Přidat fotografie<input type="file" multiple disabled={photos.length >= 5} accept={imageTypes.join(",")} onChange={addPhotos} /></label></div>
            {photos.map((photo, index) => <article className="admin-photo" key={photo.id}>
              <div className="admin-photo__preview">
                {photo.url ? <img src={photo.url} alt="" /> : photo.file ? <LocalPhotoPreview file={photo.file} /> : null}
                {photo.file ? <strong>{photo.file.name}</strong> : null}
              </div>
              <div className="form-grid">
                <label>Alt text česky<input required value={photo.altCs} onChange={(event) => updatePhoto(photo.id, "altCs", event.target.value)} maxLength={300} /></label>
                <label>Alt text English<input required value={photo.altEn} onChange={(event) => updatePhoto(photo.id, "altEn", event.target.value)} maxLength={300} /></label>
                <label>Titulek česky (volitelný)<input value={photo.titleCs || ""} onChange={(event) => updatePhoto(photo.id, "titleCs", event.target.value)} maxLength={160} /></label>
                <label>English title (optional)<input value={photo.titleEn || ""} onChange={(event) => updatePhoto(photo.id, "titleEn", event.target.value)} maxLength={160} /></label>
                <label>Popis česky (volitelný)<textarea value={photo.descriptionCs || ""} onChange={(event) => updatePhoto(photo.id, "descriptionCs", event.target.value)} maxLength={1000} rows={3} /></label>
                <label>English description (optional)<textarea value={photo.descriptionEn || ""} onChange={(event) => updatePhoto(photo.id, "descriptionEn", event.target.value)} maxLength={1000} rows={3} /></label>
              </div>
              <button type="button" className="button-danger" onClick={() => setPhotos((current) => current.filter(({ id }) => id !== photo.id))}>Odebrat fotografii {index + 1}</button>
            </article>)}
          </div>

          <button type="submit">{busy ? "Ukládám…" : editing ? "Uložit změny" : "Publikovat"}</button>
          {editing && <button type="button" className="button-secondary cancel-edit" onClick={startNew}>Zrušit úpravy</button>}
        </fieldset>
        {result && <p className={`form-status${result.error ? " form-status--error" : ""}`} role="status" aria-live="polite">
          {result.message}{result.urls && <> <a href={result.urls.cs}>Česky</a> · <a href={result.urls.en}>English</a></>}
        </p>}
      </form>
    </>
  );
}
