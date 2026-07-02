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
      },
    },
  },
};
