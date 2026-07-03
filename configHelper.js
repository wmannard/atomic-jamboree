/**
 * Parse the current jamboree number and locale from the URL path.
 * Expected path pattern: /jamboree_{N}_{locale}/...
 * Falls back to jamboree 1, EN if not found (e.g. during local dev at root).
 */
function parseContext() {
  const match = window.location.pathname.match(/\/jamboree_(\d+)_(en|fr|nl)\//i);
  if (match) {
    return { jamboree: match[1], locale: match[2].toUpperCase() };
  }
  return { jamboree: "1", locale: "EN" };
}

const { jamboree } = parseContext();
let locale = parseContext().locale;

/**
 * All VITE_* env vars are inlined at build time into import.meta.env.
 * Since we now build once (not per-jamboree), all values for all jamborees
 * are available in the same bundle.
 *
 * Lookup precedence:
 * 1. VITE_{jamboree}_{locale}_{key} (most specific, e.g. VITE_3_FR_LANGUAGE)
 * 2. VITE_{jamboree}_{key} (jamboree-wide, e.g. VITE_3_TRACKING_ID)
 * 3. VITE_{key} (global default, e.g. VITE_SEARCH_URL)
 *
 * @param {string} key - The environment variable key (without prefix)
 * @returns {string|undefined} The environment variable value
 */
export function getEnvValue(key) {
  return import.meta.env[`VITE_${jamboree}_${locale}_${key}`] ??
         import.meta.env[`VITE_${jamboree}_${key}`] ??
         import.meta.env[`VITE_${key}`];
}

/**
 * Get the current jamboree number (as a string).
 */
export function getJamboree() {
  return jamboree;
}

/**
 * Get the current locale (uppercase, e.g. "EN", "FR", "NL").
 */
export function getLocale() {
  return locale;
}

/**
 * Update the current locale used for env var lookups.
 * @param {string} newLocale - Uppercase locale code (e.g. "FR")
 */
export function setLocale(newLocale) {
  locale = newLocale.toUpperCase();
}
