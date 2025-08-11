@echo off
setlocal enabledelayedexpansion

for /L %%J in (1,1,9) do (
  for %%L in (EN FR) do (
    set "JAMBOREE=%%J"
    set "LOCALE=%%L"
    set "OUTDIR=dist/jamboree_!JAMBOREE!_!LOCALE!"
    echo Building for jamboree !JAMBOREE! !LOCALE! -> !OUTDIR!
    set "VITE_JAMBOREE=!JAMBOREE!"
    set "VITE_LOCALE=!LOCALE!"
    start "" npx vite build --outDir !OUTDIR!
  )
)

endlocal