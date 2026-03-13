/**
 * Get environment variable with fallback precedence:
 * 1. VITE_{jamboree}_{locale}_{key} (most specific)
 * 2. VITE_{jamboree}_{key} (jamboree-wide)
 * 3. VITE_{key} (global default)
 * 
 * @param {string} key - The environment variable key (without prefix)
 * @returns {string|undefined} The environment variable value
 */
export function getEnvValue(key) {
  const jamboree = import.meta.env.VITE_JAMBOREE;
  const locale = import.meta.env.VITE_LOCALE;
  
  // Try locale-specific first, then jamboree-wide, then global
  return import.meta.env[`VITE_${jamboree}_${locale}_${key}`] ??
         import.meta.env[`VITE_${jamboree}_${key}`] ??
         import.meta.env[`VITE_${key}`];
}
