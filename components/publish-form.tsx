"use client";

import { upload } from "@vercel/blob/client";
import { parse } from "exifr";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { JournalEntry, JournalPhoto, PhotoExif } from "../lib/entries";
import { entrySlug } from "../lib/slug";
import { itinerary } from "../lib/content";
import { availableEntrySlug, entryDays } from "../lib/entry-days";

const tripDays = entryDays(itinerary);
const firstTripDay = tripDays[1];

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
  const [language, setLanguage] = useState<"Cs" | "En">("Cs");
  const [selectedPhoto, setSelectedPhoto] = useState<string>();
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [progress, setProgress] = useState("");
  const [quickDay, setQuickDay] = useState(firstTripDay.date);
  const [date, setDate] = useState(firstTripDay.date);
  const [slug, setSlug] = useState(() => availableEntrySlug(firstTripDay.slug, entries));
  const formRef = useRef<HTMLFormElement>(null);
  const slugEdited = useRef(false);
  const invalidFocus = useRef(false);
  const visibleEntries = entries.filter((entry) => `${entry.titleCs} ${entry.titleEn} ${entry.placeCs} ${entry.date}`.toLocaleLowerCase("cs").includes(search.toLocaleLowerCase("cs")));

  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);

  function canLeave() {
    return !busy && (!dirty || confirm("Máte neuložené změny. Opravdu je chcete zahodit?"));
  }

  function focusEditor() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>(`[name="title${language}"]`)?.focus());
  }

  function startNew() {
    if (!canLeave()) return;
    formRef.current?.reset();
    setEditing(undefined);
    setPhotos([]);
    setSelectedPhoto(undefined);
    setResult(undefined);
    setDirty(false);
    slugEdited.current = false;
    setQuickDay(firstTripDay.date);
    setDate(firstTripDay.date);
    setSlug(availableEntrySlug(firstTripDay.slug, entries));
    focusEditor();
  }

  function startEdit(entry: JournalEntry) {
    if (editing?.slug === entry.slug || !canLeave()) return;
    setEditing(entry);
    setQuickDay("");
    setDate(entry.date);
    setSlug(entry.slug);
    setPhotos(entry.photos.map((photo) => ({ ...photo, id: photo.url })));
    setSelectedPhoto(entry.photos[0]?.url);
    setResult(undefined);
    setDirty(false);
    focusEditor();
  }

  function formChanged(event: FormEvent<HTMLFormElement>) {
    setDirty(true);
    const input = event.target as HTMLInputElement;
    if (input.name === "slug") slugEdited.current = true;
    if (input.name === "titleCs" && !editing && !quickDay && !slugEdited.current && !photos.some((photo) => photo.url)) {
      setSlug(availableEntrySlug(entrySlug(input.value), entries));
    }
  }

  function chooseDay(value: string) {
    setQuickDay(value);
    const day = tripDays.find((item) => item.date === value);
    if (day) setDate(day.date);
    if (!photos.some((photo) => photo.url)) {
      const title = formRef.current?.elements.namedItem("titleCs") as HTMLInputElement | null;
      setSlug(availableEntrySlug(day?.slug || entrySlug(title?.value || ""), entries));
      slugEdited.current = false;
    }
  }

  function showInvalid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalidFocus.current) return;
    invalidFocus.current = true;
    const input = event.target as HTMLInputElement;
    const panel = input.closest<HTMLElement>("[data-language]");
    if (panel) setLanguage(panel.dataset.language as "Cs" | "En");
    const photo = input.closest<HTMLElement>("[data-photo-id]");
    if (photo) setSelectedPhoto(photo.dataset.photoId);
    setResult({ error: true, message: `${input.closest("label")?.firstChild?.textContent || "Pole"}: ${input.validationMessage}` });
    requestAnimationFrame(() => { input.focus(); invalidFocus.current = false; });
  }

  function removePhoto(id: string) {
    const remaining = photos.filter((photo) => photo.id !== id);
    setPhotos(remaining);
    setSelectedPhoto(remaining[0]?.id);
    setDirty(true);
  }

  function movePhoto(index: number, direction: -1 | 1) {
    const next = [...photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next);
    setDirty(true);
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
      const added = files.map((file) => ({ id: crypto.randomUUID(), file, altCs: "", altEn: "" }));
      setPhotos((current) => [...current, ...added]);
      if (added.length) { setSelectedPhoto(added[0].id); setDirty(true); }
      setResult(undefined);
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Fotografie nelze přidat.", error: true });
    }
  }

  function updatePhoto(id: string, field: PhotoTextField, value: string) {
    setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, [field]: value } : photo));
    setDirty(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(undefined);
    setProgress("Připravuji fotografie…");
    const form = event.currentTarget;
    const data = new FormData(form);
    const slug = String(data.get("slug") || "");
    try {
      if (!editing && entries.some((entry) => entry.slug === slug)) throw new Error("Tato adresa už patří jinému zápisku. Zvolte jinou adresu nebo otevřete původní zápisek k úpravě.");
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
      // Keep successful uploads for a retry if saving the entry fails.
      setPhotos(uploaded.map((photo, index) => ({ ...photo, id: photos[index].id })));
      setProgress("Ukládám zápisek…");
      const payload = Object.fromEntries(data.entries());
      const response = await fetch("/api/admin/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, photos: uploaded }),
      });
      const json = await response.json() as { error?: string; entry?: JournalEntry; urls?: { cs: string; en: string } };
      if (!response.ok || !json.urls || !json.entry) throw new Error(json.error || "Uložení se nezdařilo.");
      setEditing(json.entry);
      setDirty(false);
      setResult({ message: editing ? "Zápisek byl upraven." : "Zápisek byl publikován.", urls: json.urls });
      router.refresh();
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Uložení se nezdařilo.", error: true });
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  async function removeEntry(entry: JournalEntry) {
    if (busy) return;
    if (editing?.slug === entry.slug && dirty && !canLeave()) return;
    if (!confirm(`Opravdu odstranit „${entry.titleCs}“ včetně fotografií?`)) return;
    setBusy(true);
    setResult(undefined);
    try {
      const response = await fetch(`/api/admin/entries?slug=${encodeURIComponent(entry.slug)}`, { method: "DELETE" });
      const json = await response.json() as { error?: string };
      if (!response.ok) throw new Error(json.error || "Odstranění se nezdařilo.");
      if (editing?.slug === entry.slug) {
        setEditing(undefined);
        setPhotos([]);
        setSelectedPhoto(undefined);
        setDirty(false);
        slugEdited.current = false;
        setQuickDay(firstTripDay.date);
        setDate(firstTripDay.date);
        setSlug(availableEntrySlug(firstTripDay.slug, entries.filter((item) => item.slug !== entry.slug)));
      }
      setResult({ message: "Zápisek byl odstraněn." });
      router.refresh();
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Odstranění se nezdařilo.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-workspace">
      <aside className="admin-library" aria-labelledby="entries-title">
        <div className="admin-library__heading"><h2 id="entries-title">Zápisky <span>{entries.length}</span></h2><button type="button" onClick={startNew} disabled={busy}>+ Nový</button></div>
        <label className="admin-search">Najít zápisek<input type="search" placeholder="Název, místo nebo datum…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <ul className="admin-entry-list">
          {visibleEntries.map((entry) => <li key={entry.slug}>
            <button type="button" className="admin-entry-choice" aria-pressed={editing?.slug === entry.slug} onClick={() => startEdit(entry)} disabled={busy}>
              {entry.photos[0] ? <img src={entry.photos[0].url} alt="" loading="lazy" /> : <span className="admin-entry-placeholder" aria-hidden="true">✳</span>}
              <span><strong>{entry.titleCs}</strong><small>{entry.date} · {entry.placeCs}</small><small>{entry.photos.length} foto · Publikováno</small></span>
            </button>
          </li>)}
        </ul>
        {!visibleEntries.length && <div className="admin-empty"><span aria-hidden="true">✳</span><strong>{entries.length ? "Nic jsme nenašli" : "První zápisek čeká na vás"}</strong><p>{entries.length ? "Zkuste jiný název nebo místo." : "Napište pár řádků, přidejte fotografie a podělte se o cestu."}</p></div>}
      </aside>

      <form ref={formRef} className="publish-form" id="entry-editor" key={editing?.slug || "new"} onSubmit={submit} onChange={formChanged} onInvalidCapture={showInvalid} aria-busy={busy}>
        <div className="editor-heading">
          <div><p className="eyebrow">{editing ? "Publikovaný zápisek" : "Nový příběh z cesty"}</p><h2>{editing ? editing.titleCs : "Co jste dnes zažili?"}</h2></div>
          {editing && <a className="text-link" href={`/entries/${editing.slug}/`} target="_blank" rel="noreferrer">Otevřít na webu ↗</a>}
        </div>
        <fieldset disabled={busy}>
          <legend className="visually-hidden">Obsah zápisku</legend>
          {!editing && <label className="editor-day-select">Den podle programu
            <select value={quickDay} onChange={(event) => chooseDay(event.target.value)}>
              {tripDays.map((day) => <option key={day.date} value={day.date}>{day.label}</option>)}
              <option value="">Vlastní zápisek — jiné datum nebo další příběh</option>
            </select>
            <small>Vyberte den a datum i adresu doplníme za vás. Více zápisků ze stejného dne je v pořádku.</small>
          </label>}
          <div className="editor-meta form-grid">
            <label>Datum zážitku<input name="date" type="date" required value={date} onChange={(event) => { if (!editing) chooseDay(""); setDate(event.target.value); }} /></label>
            <label>Adresa zápisku<input name="slug" required readOnly={Boolean(editing) || photos.some((photo) => photo.url)} value={slug} onChange={(event) => setSlug(event.target.value)} maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="rano-v-kjotu" /><small>{editing || photos.some((photo) => photo.url) ? "Adresa zápisku s uloženými fotografiemi se nemění." : quickDay ? "Doplněno podle programu. Adresu můžete upravit." : "Doplní se z českého názvu. Můžete ji upravit."}</small></label>
          </div>
          <div className="editor-language-bar">
            <div className="editor-language-switch" role="group" aria-label="Jazyk zápisku a fotografií">
              <button type="button" aria-pressed={language === "Cs"} onClick={() => setLanguage("Cs")}>Čeština</button>
              <button type="button" aria-pressed={language === "En"} onClick={() => setLanguage("En")}>English</button>
            </div>
            <span>Publikujeme obě jazykové verze.</span>
          </div>
          {(["Cs", "En"] as const).map((suffix) => <div className="editor-writing" data-language={suffix} hidden={language !== suffix} key={suffix}>
            <label>{suffix === "Cs" ? "Název zápisku" : "Entry title"}<input className="editor-title-input" name={`title${suffix}`} required defaultValue={editing?.[`title${suffix}`]} maxLength={160} placeholder={suffix === "Cs" ? "Třeba: Ráno mezi chrámy v Kjótu" : "For example: A morning among Kyoto’s temples"} /></label>
            <label>{suffix === "Cs" ? "Místo" : "Location"}<input name={`place${suffix}`} required defaultValue={editing?.[`place${suffix}`]} maxLength={120} placeholder={suffix === "Cs" ? "Kjóto, Japonsko" : "Kyoto, Japan"} /></label>
            <label>{suffix === "Cs" ? "Krátké úvodní shrnutí" : "Short introduction"}<textarea name={`summary${suffix}`} required defaultValue={editing?.[`summary${suffix}`]} maxLength={320} rows={2} placeholder={suffix === "Cs" ? "Pár vět, které se zobrazí v přehledu deníku…" : "A few words for the journal overview…"} /><small>{suffix === "Cs" ? "Nejvýše 320 znaků." : "Up to 320 characters."}</small></label>
            <label>{suffix === "Cs" ? "Váš příběh" : "Your story"}<textarea className="editor-body-input" name={`body${suffix}`} required defaultValue={editing?.[`body${suffix}`]} maxLength={20000} rows={9} placeholder={suffix === "Cs" ? "Co vám utkvělo v paměti?" : "What will you remember about today?"} /><small>{suffix === "Cs" ? "Odstavce oddělte prázdným řádkem." : "Separate paragraphs with a blank line."}</small></label>
          </div>)}

          <section className="photo-editor" aria-labelledby="photos-title">
            <div className="admin-section-heading"><div><h2 id="photos-title">Fotografie <small>{photos.length}/5</small></h2><p>První snímek bude titulní fotografií zápisku.</p></div><label className={`file-button${photos.length >= 5 ? " file-button--disabled" : ""}`}>+ Přidat fotografie<input type="file" multiple disabled={photos.length >= 5} accept={imageTypes.join(",")} onChange={addPhotos} /></label></div>
            {!photos.length && <div className="photo-empty"><strong>Vyberte 1–5 fotografií</strong><p>JPEG, PNG nebo WebP, do 20 MB za snímek.<br />Velikost pro web upravíme automaticky, fotografické údaje zachováme bez GPS.</p></div>}
            <div className="photo-strip" role="group" aria-label="Vyberte fotografii k úpravě">
              {photos.map((photo, index) => <button type="button" key={photo.id} className="photo-thumb" aria-pressed={selectedPhoto === photo.id} aria-label={`Fotografie ${index + 1}${photo.file ? ": " + photo.file.name : ""}`} onClick={() => setSelectedPhoto(photo.id)}>
                {photo.url ? <img src={photo.url} alt="" /> : photo.file ? <LocalPhotoPreview file={photo.file} /> : null}
                <span>{index === 0 ? "1 · Titulní" : index + 1}</span>
              </button>)}
            </div>
            {photos.map((photo, index) => <article className="admin-photo" data-photo-id={photo.id} hidden={selectedPhoto !== photo.id} key={photo.id}>
              <div className="admin-photo__preview">
                {photo.url ? <img src={photo.url} alt="" /> : photo.file ? <LocalPhotoPreview file={photo.file} /> : null}
                <strong>{photo.file?.name || `Fotografie ${index + 1}`}</strong>
                <div className="photo-order"><button type="button" className="button-secondary" disabled={index === 0} aria-label={`Posunout fotografii ${index + 1} dopředu`} onClick={() => movePhoto(index, -1)}>← Dříve</button><button type="button" className="button-secondary" disabled={index === photos.length - 1} aria-label={`Posunout fotografii ${index + 1} dozadu`} onClick={() => movePhoto(index, 1)}>Později →</button></div>
                {photo.exif && <p className="photo-camera">{[photo.exif.camera, photo.exif.lens].filter(Boolean).join(" · ") || "EXIF údaje jsou uložené."}</p>}
                <button type="button" className="button-danger" onClick={() => removePhoto(photo.id)}>Odebrat fotografii</button>
              </div>
              {(["Cs", "En"] as const).map((suffix) => <div className="photo-fields" data-language={suffix} hidden={language !== suffix} key={suffix}>
                <div className="editor-language-switch" role="group" aria-label="Jazyk popisků fotografie">
                  <button type="button" aria-pressed={language === "Cs"} onClick={() => setLanguage("Cs")}>Čeština</button>
                  <button type="button" aria-pressed={language === "En"} onClick={() => setLanguage("En")}>English</button>
                </div>
                <p className="eyebrow">{suffix === "Cs" ? "Popisky česky" : "English captions"}</p>
                <label>{suffix === "Cs" ? "Co je na fotografii?" : "What is in the photograph?"}<input required value={photo[`alt${suffix}`]} onChange={(event) => updatePhoto(photo.id, `alt${suffix}`, event.target.value)} maxLength={300} placeholder={suffix === "Cs" ? "Např. Brána torii při západu slunce" : "For example: A torii gate at sunset"} /><small>{suffix === "Cs" ? "Povinný popis pro čtečky obrazovky." : "Required description for screen readers."}</small></label>
                <label>{suffix === "Cs" ? "Titulek (volitelný)" : "Title (optional)"}<input value={photo[`title${suffix}`] || ""} onChange={(event) => updatePhoto(photo.id, `title${suffix}`, event.target.value)} maxLength={160} /></label>
                <label>{suffix === "Cs" ? "Příběh snímku (volitelný)" : "Photo story (optional)"}<textarea value={photo[`description${suffix}`] || ""} onChange={(event) => updatePhoto(photo.id, `description${suffix}`, event.target.value)} maxLength={1000} rows={3} /></label>
              </div>)}
            </article>)}
          </section>
        </fieldset>

        <div className="editor-savebar">
          <div><strong role="status" aria-live="polite">{busy ? progress || "Pracuji…" : dirty ? "Máte neuložené změny" : editing ? "Všechny změny jsou uložené" : "Připraveno pro nový zápisek"}</strong><small>{busy ? "Nezavírejte prosím tuto stránku." : "Uložením se zápisek zveřejní v češtině i angličtině."}</small></div>
          <button type="submit" disabled={busy}>{busy ? "Ukládám…" : editing ? "Uložit změny" : "Publikovat zápisek"} <span aria-hidden="true">↗</span></button>
          {result && <p className={`form-status${result.error ? " form-status--error" : ""}`} role={result.error ? "alert" : "status"}>
            {result.message}{result.urls && <> <a href={result.urls.cs} target="_blank" rel="noreferrer">Česky ↗</a> · <a href={result.urls.en} target="_blank" rel="noreferrer">English ↗</a></>}
          </p>}
        </div>
        {editing && <div className="editor-danger-zone"><button type="button" className="button-danger" disabled={busy} onClick={() => removeEntry(editing)}>Odstranit zápisek</button><span>Odstraní zápisek i jeho fotografie z webu.</span></div>}
      </form>
    </div>
  );
}
