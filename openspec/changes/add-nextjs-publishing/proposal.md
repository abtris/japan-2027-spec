## Why

The journal now needs durable publishing during the trip and a Vercel deployment workflow, which the current static HTML cannot provide. A small authenticated Next.js backend will let the owner add bilingual stories and photographs without introducing a general-purpose CMS.

## What Changes

- Migrate the existing bilingual site to Next.js App Router while preserving its design, public URLs, itinerary, accessibility, and metadata.
- Add a private administrator sign-in and publishing form for bilingual journal entries and one photograph per entry.
- Store entry JSON and uploaded photographs in Vercel Blob and render published entries in the existing journal section and localized entry pages.
- Add root-level package and environment configuration so Vercel detects and builds Next.js correctly.
- Use the existing GitHub repository as the deployment source and connect its production branch to Vercel.

## Capabilities

### New Capabilities

- `journal-publishing`: Covers authenticated administration, validated photo and entry uploads, persistent storage, and publication into Czech and English journal views.

### Modified Capabilities

None.

## Impact

- Replaces static page files with a Next.js application at the repository root while retaining shared visual assets.
- Adds Next.js, React, and Vercel Blob runtime dependencies.
- Adds administrator credentials and Blob credentials as deployment environment variables.
- Connects the existing GitHub repository to a Vercel project for automatic deployments.
