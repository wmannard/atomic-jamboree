# atomic-jamboree

A test environment for Commerce jamborees

## Start

Copy `.env.local.example` to `.env.local` and provide a token.

### Mac/Linux:

```sh
npm install
npm run start
```

Set environment variable `BUILD_ONE=1` to just build the english/jamboree_1 pages
for faster debugging:

```sh
BUILD_ONE=1 npm run start
```

### Windows:

```bat
npm install
npm run start-on-windows
```

For faster debugging, set `BUILD_ONE=1`:

```bat
set BUILD_ONE=1
npm run start-on-windows
```

## Note

The interactive (live) Vite environment won't work since the various pages are copied at build time by the `build-all` script.
You need a build before running the preview. This could be improved by consolidating the multiple HTML entry points into a 
single-entry app with programmatic Atomic engine resets instead of page navigations.
