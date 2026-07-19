## 1. Next.js Foundation

- [x] 1.1 Add the root Next.js package manifest, TypeScript configuration, environment example, and ignore rules
- [x] 1.2 Move shared visual assets under `public/assets` and preserve their public URLs

## 2. Public Journal Migration

- [x] 2.1 Add localized root layouts, shared navigation, footer, itinerary data, and reusable page components
- [x] 2.2 Recreate Czech and English home pages with the existing design, metadata, route map, itinerary, and journal section
- [x] 2.3 Add localized stable entry routes that render the introductory entry and uploaded entries with accessible photographs

## 3. Publishing Backend

- [x] 3.1 Add signed, expiring owner sessions plus login and logout routes with constant-time credential checks
- [x] 3.2 Add authenticated Vercel Blob client-upload token handling with image type and 20 MB size limits
- [x] 3.3 Add validated entry persistence, safe Blob URL checks, localized content rendering, and cache revalidation
- [x] 3.4 Add a responsive administrator login and publishing form with clear success and error feedback

## 4. Verification

- [x] 4.1 Install locked dependencies and pass TypeScript and production Next.js builds
- [x] 4.2 Verify bilingual public routes, metadata, 320-pixel layout, missing-entry behavior, and unauthorized write rejection
- [x] 4.3 Validate the OpenSpec change strictly and document required Vercel environment variables

## 5. GitHub and Vercel

- [x] 5.1 Commit and push the verified migration to the existing GitHub production branch
- [ ] 5.2 Connect the GitHub repository to Vercel with Root Directory `.`, provision Blob and secrets, and complete a production deployment
- [ ] 5.3 Verify the deployed public pages, administrator login, test publication, and bilingual entry URLs

## 6. Entry Management and Photo Details

- [x] 6.1 Extend validation and Blob persistence for entry listing, replacement, deletion, and one-to-five photo records
- [x] 6.2 Add selected EXIF extraction plus browser-side 2400-pixel WebP resizing without retaining originals, GPS, or unrelated metadata
- [x] 6.3 Add the administrator entry list and create, edit, delete, and multi-photo controls
- [x] 6.4 Render localized photo titles, descriptions, and available shooting settings on public entry pages
- [x] 6.5 Verify CRUD authorization, photo-count limits, partial EXIF data, bilingual rendering, type checking, and production build
