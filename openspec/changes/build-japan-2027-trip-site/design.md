## Context

The repository has no existing application. The site is a small, public, personal journal for friends and family, with content added occasionally before, during, and after the 2027 trip. It must remain easy to open from a shared link and pleasant to read on a phone.

## Goals / Non-Goals

**Goals:**

- Deliver a fast, responsive trip overview and chronological journal.
- Give each entry a stable URL with useful sharing metadata.
- Keep publishing and hosting simple enough for a personal site.
- Make the core experience work without client-side JavaScript.

**Non-Goals:**

- Accounts, comments, subscriptions, or other visitor data collection.
- A browser-based CMS or automated social publishing.
- Interactive maps, live location tracking, or itinerary management.
- A generalized blogging platform or reusable component framework.

## Decisions

### Use native static web files

Build the first version with semantic HTML and CSS, adding JavaScript only if a requirement cannot be met without it. Static files need no application server, database, framework, or runtime dependency and can be hosted by any static provider. A CMS, single-page app, and static-site generator were considered but add setup and maintenance that the expected number of entries does not justify.

### Give entries directory-based URLs

The home page lives at `/`, and each journal entry lives at `/entries/<slug>/`. Entry pages contain their own title, description, canonical URL, and social metadata. Directory URLs remain stable if the static hosting provider changes and work without client-side routing. A single page with fragment links was rejected because fragments cannot provide entry-specific social previews.

### Keep content close to its page

Trip copy and metadata remain in the relevant HTML document, while shared photos and styles live under `/assets/`. This duplicates a small amount of page chrome but avoids a content pipeline and build dependency. If manual duplication becomes error-prone after the journal grows, a static-site generator can replace this structure without changing public URLs.

### Make HTML the complete experience

Navigation, stories, dates, locations, photos, and captions are available in the document markup. CSS provides responsive layout and respects user preferences such as reduced motion. Images include intrinsic dimensions, useful alternative text, and lazy loading when they are below the initial viewport.

### Support pre-trip and published states

Before the first entry exists, the home page shows the trip introduction and a clear message that stories will appear later. Adding an entry consists of creating its page, adding its photos, and linking it into the newest-first home-page journal list.

## Risks / Trade-offs

- Repeated navigation and metadata can drift between pages → keep the shared chrome small and check links and metadata whenever an entry is added.
- Large travel photos can make mobile pages slow → export appropriately sized web images and lazy-load images below the fold.
- A public journal can reveal unwanted personal or location details → publish updates intentionally and avoid live location details unless explicitly desired.
- The final domain is not known yet → keep links root-relative and set canonical URLs when the deployment URL is selected.

## Migration Plan

There is no existing site to migrate. Deploy the static directory to the selected host, set the public URL in canonical and social metadata, and verify the home page plus entry URLs. Rollback is restoring the previous static deployment.

## Open Questions

- Which public domain or static host will be used?
- What initial trip copy, dates, and photos are available before departure?
