import { copy, type Locale } from "../lib/content";
import type { JournalEntry } from "../lib/entries";
import { SiteFooter, SiteHeader } from "./site-shell";

export function EntryPage({ entry, locale }: { entry: JournalEntry; locale: Locale }) {
  const english = locale === "en";
  const text = copy[locale];
  const title = english ? entry.titleEn : entry.titleCs;
  const summary = english ? entry.summaryEn : entry.summaryCs;
  const body = english ? entry.bodyEn : entry.bodyCs;
  const place = english ? entry.placeEn : entry.placeCs;
  const photoAlt = english ? entry.photoAltEn : entry.photoAltCs;
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
            {entry.photoUrl && <figure><img src={entry.photoUrl} alt={photoAlt || ""} loading="lazy" /><figcaption>{place} · {entry.date}</figcaption></figure>}
            {body.split(/\n{2,}/).map((paragraph, index) => <p className={index === 0 ? "entry__lead" : undefined} key={paragraph}>{paragraph}</p>)}
          </div>
          <footer className="entry__footer"><a className="text-link" href={`${home}#journal`}><span aria-hidden="true">←</span> {text.back}</a></footer>
        </article>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
