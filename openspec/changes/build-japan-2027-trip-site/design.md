## Context

The site is a small, public, personal journal for friends and family, with content added before, during, and after the April 1–15, 2027 trip. The first static version already exists and now needs to present the planned route and supplied itinerary in both Czech and English. It must remain easy to open from a shared link and pleasant to read on a phone.

## Goals / Non-Goals

**Goals:**

- Deliver a fast, responsive trip overview and chronological journal.
- Create a cinematic, photo-led visual identity suited to travel storytelling.
- Show the planned journey on a clear map connected to the daily itinerary.
- Publish equivalent Czech and English versions with an obvious language switch.
- Give each entry a stable URL with useful sharing metadata.
- Keep publishing and hosting simple enough for a personal site.
- Make the core experience work without client-side JavaScript.

**Non-Goals:**

- Accounts, comments, subscriptions, or other visitor data collection.
- A browser-based CMS or automated social publishing.
- Live location tracking, turn-by-turn routing, map-service integration, or an in-browser itinerary editor.
- A generalized blogging platform or reusable component framework.

## Decisions

### Adopt a cinematic photo-led editorial direction

Use the supplied travel landing pages for composition and the watercolor route artwork for the site palette: warm washi paper, ink navy, mist blue, muted olive, sakura pink, shrine red, fine divider lines, and generous vertical spacing. Before trip photography exists, the home page hero uses matching original vector artwork with a map of Japan in the background and a Torii gate as the dominant foreground shape. Photographs replace or extend this artwork during the trip.

Translate the references' tour cards and numbered slides into real journal entries, dates, and places rather than copying their travel-agency structure. Use original artwork, trip photography, copy, icons, and composition; the reference images are inspiration only and are not production assets. On small screens, cards stack, headings scale within the viewport, and text moves off an image when an overlay cannot remain readable.

Reference images supplied for this direction:

- [Japan travel landing](references/japan-travel-landing.jpg) ([source](https://i.pinimg.com/736x/68/25/ce/6825cea5ef4ec1792e7ea4ff0a5f9c67.jpg))
- [Mountain travel landing](references/mountain-travel-landing.jpg) ([source](https://i.pinimg.com/736x/e0/91/bb/e091bb4046b0f90669ee4e3b9d03948c.jpg))
- [Japan travel landing crop](references/japan-travel-landing-crop.jpg) ([source](https://i.pinimg.com/736x/5d/81/7b/5d817bd230befa111383dd7420f075c9.jpg))

### Use native static web files

Build the first version with semantic HTML and CSS, adding JavaScript only if a requirement cannot be met without it. Static files need no application server, database, framework, or runtime dependency and can be hosted by any static provider. A CMS, single-page app, and static-site generator were considered but add setup and maintenance that the expected number of entries does not justify.

### Publish Czech and English static versions

The Czech site is the default at `/`, and the English version lives at `/en/`. Every localized page provides a visible `CS / EN` switch to its direct counterpart and declares the correct document language, canonical URL, and `hreflang` alternates. Czech and English pages share styles and image assets but keep their copy in separate HTML documents. This small, intentional duplication is simpler than adding runtime localization and keeps both versions usable without JavaScript.

### Use the supplied journey-map artwork

Place the supplied watercolor route artwork between the trip introduction and journal, preserving its original crop, proportions, labels, and illustration. A compact set of numbered native links below the image connects every trip day or grouped range to the matching itinerary section. The ordered itinerary remains the accessible source of truth if the illustrated map is difficult to interpret.

Adding a stop means updating the artwork when needed, adding one numbered link, and adding the matching anchored journal section in both languages. A mapping library, remote tiles, pan/zoom controls, and a point-management UI were rejected because a fixed fifteen-day route does not need them.

### Use the itinerary as the pre-trip journal

The supplied April 1–15 schedule appears chronologically below the map with day number, date, place, and description. Kyoto remains one grouped item for days 6–8, and day 12 visibly preserves the conditional Nagano/Tokyo plan. During the trip, each planned section can gain daily observations and photographs without changing its anchor or map marker.

### Give entries directory-based URLs

The Czech home page lives at `/`, with entries at `/entries/<slug>/`; English counterparts live at `/en/` and `/en/entries/<slug>/`. Entry pages contain their own localized title, description, canonical URL, language alternates, and social metadata. Directory URLs remain stable if the static hosting provider changes and work without client-side routing.

### Keep content close to its page

Localized trip copy and metadata remain in the relevant HTML document, while shared artwork, photos, and styles live under `/assets/`. This duplicates a small amount of page chrome but avoids a content pipeline and build dependency. If maintaining both languages becomes error-prone after the journal grows, a static-site generator can replace this structure without changing public URLs.

### Make HTML the complete experience

Navigation, stories, dates, locations, photos, and captions are available in the document markup. CSS provides responsive layout and respects user preferences such as reduced motion. Images include intrinsic dimensions, useful alternative text, and lazy loading when they are below the initial viewport.

### Support pre-trip and published states

Before departure, the home page shows the full planned itinerary. During the trip, planned items become daily journal entries as observations and photographs are added. Real photographs are optional until the matching day occurs; the map, dates, and itinerary remain complete without them.

## Risks / Trade-offs

- Repeated navigation and metadata can drift between pages → keep the shared chrome small and check links and metadata whenever an entry is added.
- Large, full-bleed travel photos can make mobile pages slow → provide responsive image sizes, export efficient web formats, and lazy-load images below the fold.
- Text over cinematic photography can lose contrast → use content-aware placement with a dark gradient or solid fallback and verify contrast on every selected image.
- Illustrated map labels become small on a phone → preserve the image proportions and provide readable numbered place links plus the full itinerary directly below it.
- The route line is schematic rather than a navigation route → label it as the planned journey and keep dates and destinations authoritative in the itinerary.
- Czech and English content can drift → pair equivalent URLs directly and review both versions whenever an itinerary or journal item changes.
- A public journal can reveal unwanted personal or location details → publish updates intentionally and avoid live location details unless explicitly desired.
- The final domain is not known yet → keep links root-relative and set canonical URLs when the deployment URL is selected.

## Migration Plan

There is no existing site to migrate. Deploy the static directory to the selected host, set the public URL in canonical and social metadata, and verify the home page plus entry URLs. Rollback is restoring the previous static deployment.

## Open Questions

- Which public domain or static host will be used?
