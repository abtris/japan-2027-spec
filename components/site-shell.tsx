import { copy, type Locale } from "../lib/content";

export function SiteHeader({ locale, solid = false, entrySlug }: { locale: Locale; solid?: boolean; entrySlug?: string }) {
  const text = copy[locale];
  const english = locale === "en";
  const home = english ? "/en/" : "/";
  const counterpart = entrySlug
    ? `${english ? "" : "/en"}/entries/${entrySlug}/`
    : english ? "/" : "/en/";
  return (
    <>
      <a className="skip-link" href="#main">{text.skip}</a>
      <header className={`site-header${solid ? " site-header--solid" : ""}`}>
        <a className="brand" href={home} aria-label={text.homeLabel}><span aria-hidden="true" />{text.brand}</a>
        <nav aria-label={text.navLabel}>
          <a href={`${home}#route`}>{text.route}</a>
          <a href={`${home}#journal`} aria-current={entrySlug ? "page" : undefined}>{text.journal}</a>
          <span className="language-switch">
            {english ? <a lang="cs" href={counterpart}>CS</a> : <strong aria-current="page">CS</strong>}
            {" "}<span>/</span>{" "}
            {english ? <strong aria-current="page">EN</strong> : <a lang="en" href={counterpart}>EN</a>}
          </span>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const home = locale === "en" ? "/en/" : "/";
  return (
    <footer>
      <a className="brand" href={home}><span aria-hidden="true" />{text.brand}</a>
      <p>{text.footer}</p>
    </footer>
  );
}
