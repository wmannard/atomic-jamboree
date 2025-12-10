#!/bin/bash

if [ "$BUILD_ONE" = "1" ]; then
  # run with `BUILD_ONE=1 npm run start` to speed up development (en/jamboree_1 only)
  JAMBOREE=1
  LOCALE=EN
  OUTDIR="dist/jamboree_${JAMBOREE}_$(echo $LOCALE | tr '[:upper:]' '[:lower:]')"
  echo "Building just $JAMBOREE $LOCALE → $OUTDIR"
  VITE_JAMBOREE=$JAMBOREE VITE_LOCALE=$LOCALE npx vite build --outDir $OUTDIR &
else
  for JAMBOREE in {1..9}; do
    for LOCALE in EN FR NL; do
      OUTDIR="dist/jamboree_${JAMBOREE}_$(echo $LOCALE | tr '[:upper:]' '[:lower:]')"
      echo "Building for jamboree $JAMBOREE $LOCALE → $OUTDIR"
      if [ "$NETLIFY" = "true" ]; then
        VITE_JAMBOREE=$JAMBOREE VITE_LOCALE=$LOCALE npx vite build --outDir $OUTDIR
      else
        VITE_JAMBOREE=$JAMBOREE VITE_LOCALE=$LOCALE npx vite build --outDir $OUTDIR &
      fi
    done
  done
fi

wait
echo "All builds complete."

