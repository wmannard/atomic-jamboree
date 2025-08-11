#!/bin/bash

# for JAMBOREE in {1..9}; do
for JAMBOREE in {1..1}; do
  # for LOCALE in EN FR; do
  for LOCALE in EN; do
    OUTDIR="dist/jamboree_${JAMBOREE}_$(echo $LOCALE | tr '[:upper:]' '[:lower:]')"
    echo "Building for jamboree $JAMBOREE $LOCALE → $OUTDIR"
    if [ "$NETLIFY" = "true" ]; then
      # Memory safe sequential builds for Netlify
      VITE_JAMBOREE=$JAMBOREE VITE_LOCALE=$LOCALE npx vite build --outDir $OUTDIR
    else
      # Fast parallel builds for local development
      VITE_JAMBOREE=$JAMBOREE VITE_LOCALE=$LOCALE npx vite build --outDir $OUTDIR &
    fi
  done
done

wait
echo "All builds complete."
