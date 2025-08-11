# atomic-jamboree

A test environment for Commerce jamborees

## Start

Copy `.env.local.example` to `.env.local` and provide a token.

# Mac/linux:

```sh
npm install
npm run start
```

# Windows:

```bat
npm install
npm run start-on-windows
```

The interactive vite environment won't work since the various pages are copied at build time by the build-all script.
You need a build before running the preview.
