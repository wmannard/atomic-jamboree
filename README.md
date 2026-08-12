# atomic-jamboree

A QA/test environment for [Coveo Atomic](https://docs.coveo.com/en/atomic/latest/) commerce interfaces. The app provides 9 isolated tracking IDs so multiple testers can use the same org without their tests affecting each other. Each tracking ID is available in 3 locales (EN, FR, NL).

## Setup

```sh
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and set your `COVEO_API_KEY`. See the [Search Token Service](#search-token-service) section below for how to create this key.

`npm install` automatically copies Atomic language and asset files into `public/` via the postinstall hook.

## Development

```sh
npm run dev
```

Navigate to any jamboree/locale path, e.g. `http://localhost:5173/jamboree_1/en-us-usd/`. The landing page at `http://localhost:5173/` links to all combinations.

## Production build + preview

```sh
npm run build
npm run preview
```

## URL structure

Each jamboree and locale is accessed via URL path:

```
/jamboree_1/en-us-usd/       → Jamboree 1, English (US/USD)
/jamboree_3/fr-fr-eur/       → Jamboree 3, French (FR/EUR)
/jamboree_9/nl-nl-eur/       → Jamboree 9, Dutch (NL/EUR)
```

Within a jamboree, switching locale is instant (no page reload). Switching tracking ID (jamboree) navigates to a new URL.

## Project structure

```
app.html              ← SPA entry point
index.html            ← Landing page (jamboree picker)
vite.config.js        ← Build config + dev/preview rewrite + token plugin
netlify.toml          ← Netlify deploy config + /api/token redirect
scripts/              ← Build tooling (resource copying)
server/
└── token.js          ← Shared token generation logic (used by Vite plugin + Netlify function)
netlify/
└── functions/
    └── token.js      ← Netlify serverless function wrapper
public/               ← Static assets (gitignored, populated by postinstall)
src/
├── main.js           ← App entry, routing setup (awaits engine)
├── router.js         ← Pathname-based SPA router
├── engine.js         ← Coveo commerce engine (async init + token renewal)
├── tokenClient.js    ← Client-side token fetch with retry
├── configHelper.js   ← Env var resolution (jamboree/locale from URL)
├── commerceApi.js    ← Direct API calls (product detail page)
├── components/       ← Navbar, info banner, badge custom element
├── pages/            ← Route handlers (search, listing, recs, product detail)
│   └── templates/    ← HTML templates (imported as strings at build time)
└── shared/           ← Atomic component initialization helpers
```

## How it works

- Single Vite build — all env vars for all 9 jamborees × 3 locales are inlined into one bundle
- `configHelper.js` parses the jamboree number and locale from the URL path at runtime
- Netlify rewrites serve the same built `app.html` for all `/jamboree_*/` paths
- The Vite dev/preview server includes middleware that does the same rewriting locally
- Page markup lives in `src/pages/templates/*.html` and is inlined into the JS bundle at build time

## Search Token Service

The storefront uses **server-generated search tokens** instead of API keys directly in the browser. This is required because API keys do not support [dictionary field retrieval](https://docs.coveo.com/en/2036/), which is needed for multi-language pricing and product data.

### How it works

1. The browser calls `GET /api/token` (handled by the Vite plugin in dev, Netlify function in prod)
2. The server uses the `COVEO_API_KEY` to call the Coveo platform's `/rest/search/v2/token` endpoint
3. The platform returns a short-lived JWT search token (≤24h validity, `ey...` format)
4. The browser uses this token for all search/listing/recommendation requests
5. When the token expires, the Headless engine's `renewAccessToken` callback automatically fetches a fresh one — no manual intervention needed

### Creating the API key

In the [Coveo admin console](https://platformdev.cloud.coveo.com/) for the org specified by `COVEO_ORG_ID` in `.env`:

1. Go to **Organization** → **API Keys**
2. Click **Add key**
3. Select the **"Authenticated Search"** template
4. This grants only the **"Impersonate"** privilege — the minimum required to mint search tokens

The resulting key:
- **Can** generate anonymous search tokens (which support dictionary fields)
- **Cannot** execute queries directly, read/write indexed content, or perform any administrative operations

This key is the only secret in the project. It lives server-side and never reaches the browser bundle.

### Local development setup

```sh
cp .env.local.example .env.local
# Edit .env.local and paste your COVEO_API_KEY value
npm run dev
```

For `COVEO_API_KEY` you can use either:
- The dedicated "Jamboree search-token generation" API key (ask a teammate or create one per the instructions above)
- A short-lived superuser token from https://platformdev.cloud.coveo.com/token — works fine for local dev since it has all privileges including Impersonate (expires after 4 hours)

The Vite token plugin automatically exposes `/api/token` during dev. No separate server needed.

### Production setup (Netlify)

Add the following environment variables in the Netlify site settings:
- Site dashboard → **Site configuration** → **Environment variables** → **Add a variable**

| Variable | Value |
|----------|-------|
| `COVEO_API_KEY` | Your authenticated search API key |
| `COVEO_ORG_ID` | The Coveo organization ID (must match `VITE_ORGANIZATION_ID` in `.env`) |
| `COVEO_ENVIRONMENT` | The platform environment: `dev`, `stg`, or `prod` (must match `VITE_ENVIRONMENT` in `.env`) |

These are the same variables listed in `.env.local.example`. If the org or environment changes, update both the `.env` file (for the client bundle) and the Netlify env vars (for the serverless function).

The Netlify function at `netlify/functions/token.js` handles token generation in production.

### Token renewal

Token renewal is fully automatic. The Coveo Headless engine detects expired tokens (HTTP 419) and calls the `renewAccessToken` callback, which fetches a fresh token from `/api/token`. This happens transparently — no page reload or user action required. Long QA sessions (>24h) work without interruption.
