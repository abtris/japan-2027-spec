## Context

The repository contains a complete bilingual static site and is already connected to GitHub and Vercel, but Vercel currently cannot detect Next.js because there is no root package manifest. During the trip, the owner needs to publish journal text and photographs from a browser without editing and redeploying source files.

## Goals / Non-Goals

**Goals:**

- Preserve the existing Czech and English design, routes, itinerary, metadata, and no-JavaScript public reading experience.
- Let one owner sign in and publish validated bilingual journal entries with a photograph.
- Persist uploads independently from deployments and show them immediately on public pages.
- Make the repository build and deploy as a standard Next.js project on Vercel.

**Non-Goals:**

- Multiple authors, roles, public accounts, comments, drafts, rich-text editing, media galleries, or content search.
- A generalized CMS, database, image editor, or offline synchronization.
- Importing arbitrary HTML or Markdown from visitors.

## Decisions

### Use Next.js App Router without a component framework

Move the existing pages into server-rendered React components and continue using the current shared CSS and artwork from `public/assets`. Route groups provide separate Czech and English root layouts so each document keeps the correct `lang` value. Public pages remain server-rendered and require no client JavaScript for reading.

Keeping the static files alongside an unrelated API was considered, but it would leave uploaded entries disconnected from the existing journal. A CMS framework was rejected because one owner and a small number of posts do not justify its schema and administration layers.

### Store entries and photographs in Vercel Blob

Use one public Blob store. Photographs upload directly from the browser through Vercel Blob client-upload tokens, avoiding the Vercel Function request-body limit. Each entry is stored as validated JSON under `entries/<slug>.json`; its image uses a randomized path under `images/<slug>/`. Public pages list and parse the entry JSON, with the existing introductory entry retained as an in-code fallback.

A relational database was rejected for the first version because entries are independent documents, writes are rare, and there is one author. Add a database when editing history, relationships, search, or concurrent writers become real requirements.

### Protect all writes with one signed owner session

The administrator submits `ADMIN_PASSWORD` over HTTPS. A successful login sets a short-lived, HTTP-only, secure, same-site cookie signed with `ADMIN_SESSION_SECRET`. The admin page and every upload or publish endpoint verify the signature and expiry; hiding the form alone is never treated as authorization. Password comparison is constant-time and no credential is stored in the repository.

Hosted identity providers were considered but add accounts and external configuration that are unnecessary for a single owner. The password/session scheme can later be replaced without changing public content URLs.

### Accept structured plain text and one image

The form requires a safe slug, date, Czech and English titles, summaries, bodies, and alternative text. The image must be JPEG, PNG, or WebP and no larger than 20 MB. Bodies are rendered as escaped paragraphs rather than HTML or Markdown, eliminating an unnecessary sanitization dependency.

### Deploy from the existing GitHub production branch

Add `package.json` at the repository root so Vercel auto-detects Next.js with Root Directory `.`. Push the verified migration to the linked repository, connect that repository to the Vercel project, create a Blob store, and configure `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and the Blob credentials in Vercel.

## Risks / Trade-offs

- Blob listing and fetching performs one read per entry → acceptable for a small personal journal; move entry metadata to a database when volume makes this measurable.
- Public Blob content is readable by URL → store only intended public journal text and photos; credentials and drafts never enter Blob.
- Losing the administrator password blocks publishing → rotate the Vercel environment variable and redeploy.
- The first version does not edit or delete published entries → correct mistakes by republishing a corrected slug through Blob tooling; add explicit editing only when needed.
- A failed JSON write after a photo upload can leave an unused image → harmless at expected volume; periodic Blob cleanup is sufficient.

## Migration Plan

1. Add the Next.js application and preserve public URLs and assets.
2. Verify type checking, production build, bilingual pages, and authorization failures locally.
3. Commit and push to the existing GitHub repository.
4. Link the Vercel project, provision Blob, set secrets, and deploy the production branch.
5. Verify public pages, administrator login, one test publication, and localized entry URLs.

Rollback is a Git revert to the last static commit followed by a Vercel redeployment. Blob objects remain intact and can be reused after recovery.

## Open Questions

None. The first version intentionally supports one owner and one photograph per published entry.
