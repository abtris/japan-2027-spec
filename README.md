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
- `ADMIN_PASSWORD`: a unique password-manager-generated password, 15–1024 characters
- `ADMIN_SESSION_SECRET`: at least 32 random characters
- `ADMIN_API_TOKEN`: an independent token of at least 32 characters for CLI and app access
- `ADMIN_ALLOWED_ORIGINS`: optional comma-separated exact browser origins, e.g. `https://japan.prskavec.net`. When omitted, the configured site URL and Vercel deployment/branch URLs are used. No wildcards. Configure separately for production and preview; non-Vercel localhost requests are supported for local testing.
- `BLOB_READ_WRITE_TOKEN`: added automatically when the Blob store is connected

After changing `NEXT_PUBLIC_SITE_URL`, redeploy so canonical and social URLs use the production origin.

## Administrator security

Browser login/logout and cookie-authenticated mutations require a trusted `Origin`. Entry and upload requests must use `application/json`; the HTML login form uses `application/x-www-form-urlencoded` with a 16 KiB server-side body limit. Valid Bearer API clients do not need an Origin header. Admin pages and APIs send anti-framing, `nosniff`, and private/no-store headers.

Session cookies expire after 12 hours and are bound to the current password, session secret, and Vercel environment. Deploying this update invalidates old-format cookies; changing the password or secret invalidates existing sessions after redeployment. Keep production and preview credentials independent. If a configured password is shorter than 15 characters, replace it before deploying this update or browser login will be unavailable.

**Remaining controls (no additional service provisioned):** logout removes the browser cookie but does not revoke a stolen copy before expiry. For an incident, rotate `ADMIN_SESSION_SECRET` and redeploy; rotate `ADMIN_API_TOKEN` separately if compromised. Login throttling is not implemented in application memory, because that would not reliably protect multiple Vercel instances. Configure and verify an edge rate-limit rule on `/api/admin/login` and `/api/admin/login/` before treating brute-force protection as complete. Immediate individual-session revocation and shared application throttling require shared state; these remain deferred.

## Admin API

The existing entry and direct-upload endpoints accept `Authorization: Bearer $ADMIN_API_TOKEN`. Their client-generation contract is available at [`/openapi.yaml`](./public/openapi.yaml).

## Staging and observability

The persistent `staging` branch deploys to Vercel Preview and receives a stable branch URL. Merge or push verified changes to `master` for production.

Vercel Web Analytics and Speed Insights are included in both localized layouts. Enable both products for the Vercel project, then deploy to begin collecting page views and Core Web Vitals.
