#!/bin/bash

for JAMBOREE in {1..9}; do
  for LOCALE in EN FR; do
    OUTDIR="dist/jamboree_${JAMBOREE}_$(echo $LOCALE | tr '[:upper:]' '[:lower:]')"
    echo "Building for jamboree $JAMBOREE $LOCALE → $OUTDIR"
    VITE_JAMBOREE=$JAMBOREE VITE_LOCALE=$LOCALE npx vite build --outDir $OUTDIR &
  done
done

wait
echo "All builds complete."