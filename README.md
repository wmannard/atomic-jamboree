# atomic-jamboree

A QA/test environment for [Coveo Atomic](https://docs.coveo.com/en/atomic/latest/) commerce interfaces. The app provides 9 isolated tracking IDs so multiple testers can use the same org without their tests affecting each other. Each tracking ID is available in 3 locales (EN, FR, NL).

## Setup

```sh
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and set your Coveo access token. You can get a short-lived superuser token at https://platformdev.cloud.coveo.com/token, or generate an anonymous search API key in the platform.

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
vite.config.js        ← Build config + dev/preview rewrite middleware
scripts/              ← Build tooling (resource copying)
public/               ← Static assets (gitignored, populated by postinstall)
src/
├── main.js           ← App entry, routing setup
├── router.js         ← Hash-based SPA router
├── engine.js         ← Coveo commerce engine singleton
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
