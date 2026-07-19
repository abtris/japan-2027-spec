# Japan 2027

Bilingual Next.js travel journal with a private publishing page and Vercel Blob storage.

## Local development

```sh
npm install
cp .env.example .env.local
npm run dev
```

Public pages are at `/` and `/en/`. The publishing form is at `/admin/`.

## Vercel configuration

Keep the project Root Directory set to `.` and connect a public Vercel Blob store. Configure:

- `NEXT_PUBLIC_SITE_URL`: production origin, for example `https://japan-2027.vercel.app`
- `ADMIN_PASSWORD`: a long private publishing password
- `ADMIN_SESSION_SECRET`: at least 32 random characters
- `BLOB_READ_WRITE_TOKEN`: added automatically when the Blob store is connected

After changing `NEXT_PUBLIC_SITE_URL`, redeploy so canonical and social URLs use the production origin.

## Staging and observability

The persistent `staging` branch deploys to Vercel Preview and receives a stable branch URL. Merge or push verified changes to `master` for production.

Vercel Web Analytics and Speed Insights are included in both localized layouts. Enable both products for the Vercel project, then deploy to begin collecting page views and Core Web Vitals.
