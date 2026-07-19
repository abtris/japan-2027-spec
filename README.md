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
