import { setViewUrl } from "./engine.js";
import { navUrls, updateNavHighlight } from "./components/navbar.js";

/**
 * Simple hash-based router for the single-entry app.
 * Routes are defined as hash fragments: #/, #/listing1, #/listing2, etc.
 * Each route maps to a page module that renders content into #app.
 */

const routes = {};

/**
 * Register a route with a handler function.
 * @param {string} path - The hash path (e.g., "/", "/listing1")
 * @param {object} config - { title, render, viewUrl }
 */
export function registerRoute(path, config) {
  routes[path] = config;
}

/**
 * Navigate to a route programmatically.
 * @param {string} path - The hash path to navigate to
 */
export function navigate(path) {
  window.location.hash = `#${path}`;
}

/**
 * Get the href-template string for PDP links.
 * Produces a path-based URL that works with both hash routing and direct navigation.
 * E.g. "/jamboree_3_en/pdp/?${permanentid}"
 */
export function getPdpHrefTemplate() {
  // Get the base path (e.g. /jamboree_3_en/)
  const path = window.location.pathname;
  const match = path.match(/\/jamboree_\d+_(en|fr|nl)\//i);
  const basePath = match ? match[0] : "/";
  return `${window.location.origin}${basePath}pdp/?\${permanentid}`;
}

/**
 * Get the current route path from the hash.
 * Route paths always start with "/". Coveo writes state without a leading "/"
 * (e.g., #perPage=10&sortCriteria=relevance). If the hash isn't a route path,
 * we return null to signal "no route change".
 *
 * The "?" separator is used to pass parameters (e.g. product ID) to route
 * handlers, so we strip it here and let the handler read from the full hash.
 */
function getCurrentPath() {
  const hash = window.location.hash.slice(1); // remove '#'
  if (!hash) return "/";
  // Route paths always start with "/"; anything else is Coveo search state
  if (!hash.startsWith("/")) return null;
  // Strip query portion so "/pdp?PRODUCT_ID" matches the "/pdp" route
  const qIndex = hash.indexOf("?");
  return qIndex === -1 ? hash : hash.slice(0, qIndex);
}

let currentRenderedPath = null;

/**
 * Resolve and render the current route.
 */
async function resolveRoute() {
  const path = getCurrentPath();

  // If the hash is Coveo state (not a route path), render the default route
  // if nothing has been rendered yet. This handles the case where the page
  // loads with a Coveo state hash (e.g. #perPage=10) from a previous session.
  if (path === null) {
    if (currentRenderedPath === null) {
      // Nothing rendered yet — fall through to render the default "/" route
      renderRoute("/");
    }
    return;
  }

  // Don't re-render if we're already showing this page.
  // This prevents unnecessary re-renders when Coveo updates the hash with search state.
  if (path === currentRenderedPath) return;

  renderRoute(path);
}

async function renderRoute(path) {
  const route = routes[path];

  if (!route) {
    document.getElementById("app").innerHTML = `
      <div class="alert alert-warning text-center my-5">
        <h4>Page not found</h4>
        <p>No route registered for: ${path}</p>
        <a href="#/">Go to Search</a>
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
 * If the page was loaded via a path-based URL (e.g. /jamboree_3_en/pdp/?PRODUCT_ID),
 * redirect into the equivalent hash route so the SPA router can handle it.
 * This supports shareable/bookmarkable path-based PDP links.
 */
function redirectPathToHash() {
  const path = window.location.pathname;
  const match = path.match(/\/jamboree_\d+_(en|fr|nl)\/pdp\/?$/i);
  if (match) {
    // Extract product ID from query string (e.g. ?RDWSK1_6057_BK or ?0=RDWSK1_6057_BK)
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("0") || params.toString().replace("=", "");
    if (productId) {
      // Build the base path (strip /pdp/ suffix) and set the hash route
      const basePath = path.replace(/\/pdp\/?$/, "/");
      window.history.replaceState(null, "", basePath + "#/pdp?" + productId);
      return true;
    }
  }
  return false;
}

/**
 * Initialize the router - listen for hash changes and render initial route.
 */
export function initRouter() {
  redirectPathToHash();
  window.addEventListener("hashchange", resolveRoute);
  resolveRoute();
}
