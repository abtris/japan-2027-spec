import { copy, type Locale } from "../lib/content";
import type { JournalEntry, JournalPhoto } from "../lib/entries";
import { SiteFooter, SiteHeader } from "./site-shell";

function exposure(seconds: number) {
  return seconds <= .5 ? `1/${Math.round(1 / seconds)} s` : `${Number(seconds.toFixed(2))} s`;
}

function shootingDetails(photo: JournalPhoto, english: boolean) {
  const exif = photo.exif;
  if (!exif) return [];
  return [
    [english ? "Camera" : "Tělo", exif.camera],
    [english ? "Lens" : "Objektiv", exif.lens],
    [english ? "Focal length" : "Ohnisko", exif.focalLength && `${Number(exif.focalLength.toFixed(1))} mm`],
    [english ? "Aperture" : "Clona", exif.aperture && `ƒ/${Number(exif.aperture.toFixed(1))}`],
    [english ? "Shutter" : "Čas", exif.exposureTime && exposure(exif.exposureTime)],
    ["ISO", exif.iso && String(Math.round(exif.iso))],
    [english ? "Captured" : "Pořízeno", exif.capturedAt?.replace("T", " ").replace(/\.\d{3}Z?$/, "")],
  ].filter((item): item is [string, string] => Boolean(item[1]));
}

export function EntryPage({ entry, locale }: { entry: JournalEntry; locale: Locale }) {
  const english = locale === "en";
  const text = copy[locale];
  const title = english ? entry.titleEn : entry.titleCs;
  const summary = english ? entry.summaryEn : entry.summaryCs;
  const body = english ? entry.bodyEn : entry.bodyCs;
  const place = english ? entry.placeEn : entry.placeCs;
  const home = english ? "/en/" : "/";
  return (
    <>
      <SiteHeader locale={locale} solid entrySlug={entry.slug} />
      <main id="main">
        <article className="entry">
          <header className="entry__header">
            <p className="eyebrow"><time dateTime={entry.date}>{entry.date}</time> · {place}</p>
            <h1>{title}</h1>
            <p className="entry__dek">{summary}</p>
          </header>
          <div className="entry__body">
            {body.split(/\n{2,}/).map((paragraph, index) => <p className={index === 0 ? "entry__lead" : undefined} key={`${index}-${paragraph}`}>{paragraph}</p>)}
            {entry.photos.map((photo, index) => {
              const photoTitle = english ? photo.titleEn : photo.titleCs;
              const description = english ? photo.descriptionEn : photo.descriptionCs;
              const details = shootingDetails(photo, english);
              return <figure className="entry-photo" key={photo.url}>
                <img src={photo.url} alt={english ? photo.altEn : photo.altCs} loading="lazy" />
                <figcaption>
                  {photoTitle && <strong>{photoTitle}</strong>}
                  {description && <p>{description}</p>}
                  {details.length > 0 && <dl className="photo-exif">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
                  {!photoTitle && !description && details.length === 0 && <span>{place} · {entry.date} · {index + 1}/{entry.photos.length}</span>}
                </figcaption>
              </figure>;
            })}
          </div>
          <footer className="entry__footer"><a className="text-link" href={`${home}#journal`}><span aria-hidden="true">←</span> {text.back}</a></footer>
        </article>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
