## 1. Next.js Foundation

- [x] 1.1 Add the root Next.js package manifest, TypeScript configuration, environment example, and ignore rules
- [x] 1.2 Move shared visual assets under `public/assets` and preserve their public URLs

## 2. Public Journal Migration

- [ ] 2.1 Add localized root layouts, shared navigation, footer, itinerary data, and reusable page components
- [ ] 2.2 Recreate Czech and English home pages with the existing design, metadata, route map, itinerary, and journal section
- [ ] 2.3 Add localized stable entry routes that render the introductory entry and uploaded entries with accessible photographs

## 3. Publishing Backend

- [ ] 3.1 Add signed, expiring owner sessions plus login and logout routes with constant-time credential checks
- [ ] 3.2 Add authenticated Vercel Blob client-upload token handling with image type and 20 MB size limits
- [ ] 3.3 Add validated entry persistence, safe Blob URL checks, localized content rendering, and cache revalidation
- [ ] 3.4 Add a responsive administrator login and publishing form with clear success and error feedback

## 4. Verification

- [ ] 4.1 Install locked dependencies and pass TypeScript and production Next.js builds
- [ ] 4.2 Verify bilingual public routes, metadata, 320-pixel layout, missing-entry behavior, and unauthorized write rejection
- [ ] 4.3 Validate the OpenSpec change strictly and document required Vercel environment variables

## 5. GitHub and Vercel

- [ ] 5.1 Commit and push the verified migration to the existing GitHub production branch
- [ ] 5.2 Connect the GitHub repository to Vercel with Root Directory `.`, provision Blob and secrets, and complete a production deployment
- [ ] 5.3 Verify the deployed public pages, administrator login, test publication, and bilingual entry URLs
