"use client";

import { upload } from "@vercel/blob/client";
import { useState, type FormEvent } from "react";

type Result = { message: string; urls?: { cs: string; en: string }; error?: boolean };

export function PublishForm() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(undefined);
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("photo");
    const slug = String(data.get("slug") || "");
    try {
      if (!(file instanceof File) || !file.size) throw new Error("Vyberte fotografii.");
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Fotografie musí být JPEG, PNG nebo WebP.");
      if (file.size > 20 * 1024 * 1024) throw new Error("Fotografie může mít nejvýše 20 MB.");
      const filename = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
      const photo = await upload(`images/${slug}/${filename}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        clientPayload: JSON.stringify({ slug }),
      });
      const payload = Object.fromEntries([...data.entries()].filter(([key]) => key !== "photo"));
      const response = await fetch("/api/admin/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, photoUrl: photo.url }),
      });
      const json = await response.json() as { error?: string; urls?: { cs: string; en: string } };
      if (!response.ok || !json.urls) throw new Error(json.error || "Publikace se nezdařila.");
      form.reset();
      setResult({ message: "Zápisek byl publikován.", urls: json.urls });
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Publikace se nezdařila.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="publish-form" onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend>Nový zápisek</legend>
        <div className="form-grid">
          <label>Slug<input name="slug" required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="hiroshima-day-3" /></label>
          <label>Datum<input name="date" type="date" required /></label>
          <label>Místo česky<input name="placeCs" required maxLength={120} /></label>
          <label>Place in English<input name="placeEn" required maxLength={120} /></label>
          <label>Název česky<input name="titleCs" required maxLength={160} /></label>
          <label>English title<input name="titleEn" required maxLength={160} /></label>
          <label>Shrnutí česky<textarea name="summaryCs" required maxLength={320} rows={3} /></label>
          <label>English summary<textarea name="summaryEn" required maxLength={320} rows={3} /></label>
          <label>Text česky<textarea name="bodyCs" required maxLength={20000} rows={10} /></label>
          <label>English text<textarea name="bodyEn" required maxLength={20000} rows={10} /></label>
          <label>Fotografie<input name="photo" type="file" required accept="image/jpeg,image/png,image/webp" /></label>
          <label>Alternativní text česky<input name="photoAltCs" required maxLength={300} /></label>
          <label>Alternative text in English<input name="photoAltEn" required maxLength={300} /></label>
        </div>
        <button type="submit">{busy ? "Publikuji…" : "Publikovat"}</button>
      </fieldset>
      {result && <p className={`form-status${result.error ? " form-status--error" : ""}`} role="status" aria-live="polite">
        {result.message}{result.urls && <> <a href={result.urls.cs}>Česky</a> · <a href={result.urls.en}>English</a></>}
      </p>}
    </form>
  );
}
