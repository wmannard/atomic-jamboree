import { setViewUrl } from "./engine.js";
import { navUrls, updateNavHighlight } from "./components/navbar.js";

/**
 * Pathname-based router for the single-entry app.
 * Routes are defined as path suffixes: /, /listing1, /listing2, etc.
 * The URL base (e.g. /jamboree_3/en-us-usd/) is stripped before matching.
 * Hash fragment is left free for Coveo Atomic's URL manager.
 */

const routes = {};

/**
 * Get the base path for the current jamboree context.
 * E.g. "/jamboree_3/en-us-usd/"
 */
function getBasePath() {
  const match = window.location.pathname.match(/\/jamboree_\d+\/([a-z]{2}-[a-z]{2}-[a-z]{3})\//i);
  return match ? match[0] : "/";
}

/**
 * Register a route with a handler function.
 * @param {string} path - The route path (e.g., "/", "/listing1")
 * @param {object} config - { title, render, viewUrl }
 */
export function registerRoute(path, config) {
  routes[path] = config;
}

/**
 * Navigate to a route programmatically.
 * @param {string} path - The route path to navigate to (e.g. "/listing1")
 */
export function navigate(path) {
  const url = getBasePath() + path.replace(/^\//, "");
  window.history.pushState(null, "", url);
  resolveRoute();
}

/**
 * Get the href-template string for PDP links.
 * Produces a path-based URL for use in Coveo atomic-product-link href-template.
 * E.g. "/jamboree_3/en-us-usd/pdp/?${permanentid}"
 */
export function getPdpHrefTemplate() {
  const basePath = getBasePath();
  return `${window.location.origin}${basePath}pdp/?\${permanentid}`;
}

/**
 * Get the current route path by stripping the jamboree base from the pathname.
 * E.g. /jamboree_3/en-us-usd/listing1 → /listing1
 *      /jamboree_3/en-us-usd/         → /
 *      /jamboree_3/en-us-usd/pdp/     → /pdp
 */
function getCurrentPath() {
  const pathname = window.location.pathname;
  const basePath = getBasePath();
  let routePath = pathname.slice(basePath.length); // e.g. "listing1" or "pdp/" or ""
  // Normalise: strip trailing slash, ensure leading slash
  routePath = "/" + routePath.replace(/\/+$/, "");
  if (routePath === "/") return "/";
  return routePath;
}

let currentRenderedPath = null;

/**
 * Resolve and render the current route.
 */
async function resolveRoute() {
  const path = getCurrentPath();

  // Don't re-render if we're already showing this page.
  // Exception: PDP uses a query param for product ID, so always re-render it.
  if (path === currentRenderedPath && path !== "/pdp") return;

  renderRoute(path);
}

async function renderRoute(path) {
  const route = routes[path];

  if (!route) {
    document.getElementById("app").innerHTML = `
      <div class="alert alert-warning text-center my-5">
        <h4>Page not found</h4>
        <p>No route registered for: ${path}</p>
        <a href="${getBasePath()}">Go to Search</a>
      </div>
    `;
    return;
  }

  // Update document title
  document.title = route.title;

  // Update the engine's view URL for correct analytics/PLP targeting
  const viewUrl = route.viewUrl || navUrls[route.title]?.url || window.location.href;
  setViewUrl(viewUrl);

  // Render the page content into #app
  const appContainer = document.getElementById("app");
  await route.render(appContainer);
  currentRenderedPath = path;

  // Update the navigation dropdown to reflect the current page
  updateNavHighlight(path);
}

/**
 * Initialize the router - listen for popstate (back/forward) and render initial route.
 */
export function initRouter() {
  installLinkInterceptor();
  window.addEventListener("popstate", resolveRoute);
  resolveRoute();
}

/**
 * Intercept clicks on same-origin internal links for SPA navigation.
 * This handles:
 * - Navbar links (e.g. /jamboree_3/en-us-usd/listing1)
 * - PDP links from Coveo product cards (e.g. /jamboree_3/en-us-usd/pdp/?PRODUCT_ID)
 * Uses composedPath to catch links inside shadow DOMs (Coveo components).
 */
function installLinkInterceptor() {
  document.addEventListener("click", (e) => {
    const composedPath = e.composedPath();
    const anchor = composedPath.find(
      (el) => el instanceof HTMLAnchorElement && el.href
    );
    if (!anchor) return;

    let url;
    try { url = new URL(anchor.href); } catch { return; }

    // Only intercept same-origin links within our jamboree base path
    if (url.origin !== window.location.origin) return;
    const basePath = getBasePath();
    if (!url.pathname.startsWith(basePath)) return;

    // Determine the route path
    let routePath = url.pathname.slice(basePath.length);
    routePath = "/" + routePath.replace(/\/+$/, "");
    if (routePath === "/") routePath = "/";

    // Only intercept if we have a registered route for this path
    if (!routes[routePath]) return;

    e.preventDefault();
    e.stopPropagation();

    // For PDP, preserve the query string (product ID)
    const dest = url.pathname + url.search;
    window.history.pushState(null, "", dest);
    resolveRoute();
  }, true);
}
