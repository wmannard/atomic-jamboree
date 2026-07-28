/**
 * Parse a locale slug (e.g. "en-us-usd") into its component parts.
 * @param {string} slug - Lowercase locale slug from the URL
 * @returns {{ language: string, country: string, currency: string }}
 */
export function parseLocaleSlug(slug) {
  const [language, country, currency] = slug.toLowerCase().split("-");
  return {
    language,
    country: country.toUpperCase(),
    currency: currency.toUpperCase(),
  };
}

/**
 * Parse the current jamboree number and locale slug from the URL path.
 * Expected path pattern: /jamboree_{N}/{lang-country-currency}/...
 * Falls back to jamboree 1, en-us-usd if not found (e.g. during local dev at root).
 */
function parseContext() {
  const match = window.location.pathname.match(/\/jamboree_(\d+)\/([a-z]{2}-[a-z]{2}-[a-z]{3})\//i);
  if (match) {
    return { jamboree: match[1], localeSlug: match[2].toLowerCase() };
  }
  return { jamboree: "1", localeSlug: "en-us-usd" };
}

const { jamboree, localeSlug: initialSlug } = parseContext();
let localeSlug = initialSlug;

/**
 * All VITE_* env vars are inlined at build time into import.meta.env.
 * Since we now build once (not per-jamboree), all values for all jamborees
 * are available in the same bundle.
 *
 * Language, country, and currency are derived from the URL slug at runtime,
 * so no per-locale env vars are needed for those.
 *
 * Lookup precedence for other keys:
 * 1. VITE_{jamboree}_{key} (jamboree-wide, e.g. VITE_3_TRACKING_ID)
 * 2. VITE_{key} (global default, e.g. VITE_SEARCH_URL)
 *
 * @param {string} key - The environment variable key (without prefix)
 * @returns {string|undefined} The environment variable value
 */
export function getEnvValue(key) {
  return import.meta.env[`VITE_${jamboree}_${key}`] ??
         import.meta.env[`VITE_${key}`];
}

/**
 * Get the current jamboree number (as a string).
 */
export function getJamboree() {
  return jamboree;
}

/**
 * Get the current locale slug (lowercase, e.g. "en-us-usd", "fr-fr-eur").
 */
export function getLocaleSlug() {
  return localeSlug;
}

/**
 * Get the current locale's language, country, and currency parsed from the slug.
 */
export function getLocaleContext() {
  return parseLocaleSlug(localeSlug);
}

/**
 * Update the current locale slug (used when switching locale without a page reload).
 * @param {string} newSlug - Locale slug (e.g. "fr-fr-eur")
 */
export function setLocaleSlug(newSlug) {
  localeSlug = newSlug.toLowerCase();
}
