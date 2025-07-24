# atomic-jamboree

A test environment for Commerce jamborees

## Start

```sh
cp .env.example .env
npm install
npm run build
npm run preview
```

Windows:

```bat
copy .env.example .env
npm install
npm run build-on-windows
npm run preview
```

The interactive vite environment won't work since the various pages are copied at build time by the build-all script.
You need a build before running the preview.
