import type { CSSProperties } from "react";
import { copy, itinerary, mapStops, type Locale } from "../lib/content";
import type { JournalEntry } from "../lib/entries";
import { SiteFooter, SiteHeader } from "./site-shell";

function local(entry: JournalEntry, locale: Locale) {
  const english = locale === "en";
  return {
    title: english ? entry.titleEn : entry.titleCs,
    summary: english ? entry.summaryEn : entry.summaryCs,
    place: english ? entry.placeEn : entry.placeCs,
    alt: english ? entry.photoAltEn : entry.photoAltCs,
  };
}

export function HomePage({ locale, entries }: { locale: Locale; entries: JournalEntry[] }) {
  const text = copy[locale];
  const english = locale === "en";
  const entryPrefix = english ? "/en/entries" : "/entries";
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <p className="eyebrow">{text.heroEyebrow}</p>
            <h1 id="hero-title">{text.heroTitle}</h1>
            <p className="hero__intro">{text.heroIntro}</p>
            <a className="text-link" href="#route">{text.heroLink} <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="intro section" id="about" aria-labelledby="about-title">
          <p className="eyebrow">{text.introEyebrow}</p>
          <h2 id="about-title">{text.introTitle}</h2>
          <div className="intro__copy">{text.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section className="route-section section" id="route" aria-labelledby="route-title">
          <div className="section-heading">
            <div><p className="eyebrow">{text.routeEyebrow}</p><h2 id="route-title">{text.routeTitle}</h2></div>
            <p className="section-heading__note">{text.routeNote}</p>
          </div>
          <div className="journey-map">
            <img src="/assets/japan-expedition-route.png" alt={text.mapAlt} width="1024" height="1536" loading="lazy" decoding="async" />
          </div>
          <nav aria-label={text.mapNav}>
            <ol className="map-day-links">
              {mapStops.map((stop) => <li key={stop.id}><a href={`#${stop.id}`}><span>{stop.number}</span>{stop[locale]}</a></li>)}
            </ol>
          </nav>
          <p className="map-key">{text.mapKey}</p>
        </section>

        <section className="itinerary section" id="itinerary" aria-labelledby="itinerary-title">
          <div className="section-heading">
            <div><p className="eyebrow">{text.itineraryEyebrow}</p><h2 id="itinerary-title">{text.itinerary}</h2></div>
            <p className="section-heading__note">{text.itineraryNote}</p>
          </div>
          <ol className="itinerary-list">
            {itinerary.map((day) => (
              <li className="day-card" id={day.id} key={day.id}>
                <p className="day-card__meta"><span className="day-card__number">{day.number}</span><time dateTime={day.date}>{english ? day.enDate : day.csDate}</time></p>
                <div className="day-card__copy"><h3>{english ? day.enTitle : day.csTitle}</h3><p>{english ? day.enText : day.csText}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="journal section" id="journal" aria-labelledby="journal-title">
          <div className="section-heading">
            <div><p className="eyebrow">{text.journalEyebrow}</p><h2 id="journal-title">{text.journal}</h2></div>
            <p className="section-heading__note">{text.journalNote}</p>
          </div>
          <ol className="entry-grid">
            {entries.map((entry, index) => {
              const item = local(entry, locale);
              const style = entry.photoUrl ? { backgroundImage: `linear-gradient(0deg, rgb(245 240 230 / 98%), rgb(245 240 230 / 20%)), url("${entry.photoUrl}")` } as CSSProperties : undefined;
              return (
                <li key={entry.slug}>
                  <a className="entry-card" href={`${entryPrefix}/${entry.slug}/`} style={style}>
                    <span className="entry-card__number" aria-hidden="true">{String(entries.length - index).padStart(2, "0")}</span>
                    <span className="entry-card__meta"><time dateTime={entry.date}>{entry.date}</time> · {item.place}</span>
                    <strong>{item.title}</strong><span>{item.summary}</span>
                    <span className="text-link">{text.read} <span aria-hidden="true">→</span></span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="closing-image" aria-label={english ? "Japan 2027" : "Japonsko 2027"}><p>{text.closing}</p></section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
