import { resolve } from "path";

const jamboree = process.env.VITE_JAMBOREE;
const locale = process.env.VITE_LOCALE;
const base =
  jamboree && locale ? `/jamboree_${jamboree}_${locale.toLowerCase()}/` : "/";

export default {
  base,
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        listing1: resolve(__dirname, "listing1/index.html"),
        listing2: resolve(__dirname, "listing2/index.html"),
        listing3: resolve(__dirname, "listing3/index.html"),
        recs1: resolve(__dirname, "recs1/index.html"),
        recs2: resolve(__dirname, "recs2/index.html"),
        pdp: resolve(__dirname, "pdp/index.html"),
      },
    },
  },
};
