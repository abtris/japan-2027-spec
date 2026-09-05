import { copy, itinerary, type Locale } from "../lib/content";
import type { JournalEntry } from "../lib/entries";
import { SiteFooter, SiteHeader } from "./site-shell";

export function HomePage({ locale, entries }: { locale: Locale; entries: JournalEntry[] }) {
  const text = copy[locale];
  const english = locale === "en";
  const entryPrefix = english ? "/en/entries" : "/entries";
  const date = new Intl.DateTimeFormat(english ? "en-GB" : "cs-CZ", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__content">
            <p className="eyebrow">{text.heroEyebrow}</p>
            <h1 id="hero-title">{text.heroTitle}</h1>
            <p className="hero__intro">{text.heroIntro}</p>
            <p className="hero__date">{text.routeEyebrow}<span aria-hidden="true"> · </span>{english ? "A photographic journey" : "Fotografická cesta"}</p>
            <a className="text-link" href="#route">{text.heroLink} <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hero__art" aria-hidden="true">
            <img className="hero__map" src="/assets/japan-outline.svg" alt="" width="500" height="620" />
            <svg className="hero__gate" viewBox="40 400 870 500" fill="none">
              <path d="M100 485h755l38 39H62z" fill="#753e33" />
              <path d="M75 414c156 27 578 27 738 0l26 55c-190 34-590 34-790 0z" fill="#a84f40" />
              <path d="M148 500h73l-21 352h-91zM667 500h73l39 352h-92z" fill="#a84f40" />
              <path d="M188 580h515v38H188z" fill="#b66753" />
              <path d="M95 852h131l-8 31H85zM669 852h132l11 31H677z" fill="#753e33" />
              <path d="M412 482h76v94h-76z" fill="#753e33" />
            </svg>
            <span className="hero__art-caption">日本 <span>35° N / 139° E</span></span>
          </div>
        </section>

        <section className="intro section" id="about" aria-labelledby="about-title">
          <div><p className="eyebrow">{text.introEyebrow}</p><h2 id="about-title">{text.introTitle}</h2></div>
          <div className="intro__copy">{text.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section className="journal section" id="journal" aria-labelledby="journal-title">
          <div className="section-heading">
            <div><p className="eyebrow">{text.journalEyebrow}</p><h2 id="journal-title">{text.journal}</h2></div>
            <p className="section-heading__note">{text.journalNote}</p>
          </div>
          <ol className="entry-grid">
            {entries.map((entry, index) => {
              const photo = entry.photos[0];
              return (
                <li key={entry.slug}>
                  <a className={`entry-card${photo ? "" : " entry-card--note"}`} href={`${entryPrefix}/${entry.slug}/`}>
                    {photo ? <img className="entry-card__image" src={photo.url} alt={english ? photo.altEn : photo.altCs} loading="lazy" /> : <div className="entry-card__paper" aria-hidden="true"><span>{english ? "Notes before departure" : "Zápisky před odletem"}</span><span className="entry-card__folio">{String(entries.length - index).padStart(2, "0")}</span><span>Praha → 日本</span></div>}
                    <div className="entry-card__copy">
                      <span className="entry-card__meta"><time dateTime={entry.date}>{date.format(new Date(entry.date))}</time> · {english ? entry.placeEn : entry.placeCs}</span>
                      <h3>{english ? entry.titleEn : entry.titleCs}</h3>
                      <p>{english ? entry.summaryEn : entry.summaryCs}</p>
                      <span className="text-link">{text.read} <span aria-hidden="true">↗</span></span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="route-section section" id="route" aria-labelledby="route-title">
          <div className="section-heading">
            <div><p className="eyebrow">{text.routeEyebrow}</p><h2 id="route-title">{text.routeTitle}</h2></div>
            <p className="section-heading__note">{text.routeNote}</p>
          </div>
          <div className="route-layout">
            <figure className="journey-map">
              <a href="/assets/japan-expedition-route.png" target="_blank" rel="noreferrer" aria-label={english ? "Open full-size journey map (new tab)" : "Otevřít mapu v plné velikosti (nová karta)"}>
                <img src="/assets/japan-expedition-route.png" alt={text.mapAlt} width="1024" height="1536" loading="lazy" decoding="async" />
              </a>
              <figcaption>{english ? "Our route, from the first landing to the last photograph." : "Naše trasa od prvního přistání po poslední fotografii."}<a className="text-link" href="/assets/japan-expedition-route.png" target="_blank" rel="noreferrer">{english ? "Enlarge map (new tab)" : "Zvětšit mapu (nová karta)"} <span aria-hidden="true">↗</span></a></figcaption>
            </figure>
            <div className="itinerary" id="itinerary">
              <div className="itinerary-heading"><h3>{text.itinerary}</h3><span>{english ? "15 days · 13 chapters" : "15 dní · 13 kapitol"}</span></div>
              <ol className="itinerary-list">
                {itinerary.map((day) => <li id={day.id} key={day.id}>
                  <details className="day-card">
                    <summary><span className="day-card__number">{day.number}</span><span className="day-card__heading"><span>{english ? day.enTitle : day.csTitle}</span><time dateTime={day.date}>{english ? day.enDate : day.csDate}</time></span><span className="day-card__toggle" aria-hidden="true">+</span></summary>
                    <p>{english ? day.enText : day.csText}</p>
                  </details>
                </li>)}
              </ol>
              <p className="map-key">{text.itineraryNote}</p>
            </div>
          </div>
        </section>

        <section className="closing-image" aria-label={english ? "Japan 2027" : "Japonsko 2027"}><span aria-hidden="true">✳</span><p>{text.closing}</p><span className="eyebrow">{english ? "See you along the way." : "Uvidíme se cestou."}</span></section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
