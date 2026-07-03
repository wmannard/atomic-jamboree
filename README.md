# atomic-jamboree

A test environment for Commerce jamborees.

## Setup

```sh
npm install
cp .env.local.example .env.local
# Fill in your access token in .env.local
```

## Development

```sh
npm run dev
```

Then navigate to `http://localhost:5173/jamboree_1_en/` (or any jamboree/locale combo).

The dev server supports all `/jamboree_{1-9}_{en|fr|nl}/` paths — config is resolved from the URL at runtime.

## Production build + preview

```sh
npm run start
```

This builds once and serves a preview. The landing page at `/` links to all jamboree/locale combinations.

## URL structure

Each jamboree and locale is accessed via URL path:

```
/jamboree_1_en/       → Jamboree 1, English (US/USD)
/jamboree_3_fr/       → Jamboree 3, French (FR/EUR)
/jamboree_9_nl/       → Jamboree 9, Dutch (NL/EUR)
```

Within a jamboree, switching locale is instant (no page reload). Switching tracking ID navigates to the new URL.

## How it works

- Single Vite build — all env vars for all 9 jamborees × 3 locales are inlined into one bundle
- `configHelper.js` parses the jamboree number and locale from the URL path at runtime
- Netlify rewrites serve the same built app for all `/jamboree_*/` paths
- The Vite dev server includes a middleware plugin that does the same rewriting locally
