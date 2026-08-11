import { setViewUrl } from "./engine.js";
import { navUrls, updateNavHighlight } from "./components/navbar.js";

/**
 * Pathname-based router for the single-entry app.
 * Routes are defined as path suffixes: /, /listing1, /listing2, etc.
 * Context (tracking_id, locale) lives in query params and is preserved across navigations.
 * Hash fragment is left free for Coveo Atomic's URL manager.
 */

const routes = {};

/**
 * Register a route with a handler function.
 * @param {string} path - The route path (e.g., "/", "/listing1")
 * @param {object} config - { title, render, viewUrl }
 */
export function registerRoute(path, config) {
  routes[path] = config;
}

/**
 * Navigate to a route programmatically, preserving query params.
 * @param {string} path - The route path to navigate to (e.g. "/listing1")
 */
export function navigate(path) {
  const url = "/" + path.replace(/^\//, "") + window.location.search;
  window.history.pushState(null, "", url);
  resolveRoute();
}

/**
 * Get the href-template string for PDP links.
 * Produces a path-based URL for use in Coveo atomic-product-link href-template.
 * E.g. "http://localhost:5173/pdp/${permanentid}?tracking_id=jamboree_5&locale=en-us-usd"
 */
export function getPdpHrefTemplate() {
  const search = window.location.search;
  return `${window.location.origin}/pdp/\${permanentid}${search}`;
}

/**
 * Extract the product ID from the current URL pathname.
 * E.g. /pdp/SP04951_00002 → "SP04951_00002"
 *      /pdp/ → ""
 */
export function getPdpProductId() {
  const match = window.location.pathname.match(/^\/pdp\/(.+?)(?:\/)?$/);
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Get the current route path from the pathname.
 * E.g. /listing1 → /listing1
 *      /pdp/SP04951_00002 → /pdp
 *      / → /
 */
function getCurrentPath() {
  let pathname = window.location.pathname;
  // Normalize: strip trailing slashes, ensure leading slash
  pathname = "/" + pathname.replace(/^\/+|\/+$/g, "");
  // Map /pdp/ANYTHING to route key "/pdp"
  if (pathname.startsWith("/pdp/")) return "/pdp";
  return pathname === "/" ? "/" : pathname;
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
        <a href="/search${window.location.search ? '?' + window.location.search.slice(1) : ''}">Go to Search</a>
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
 * - Navbar links (e.g. /listing1)
 * - PDP links from Coveo product cards (e.g. /pdp/SP04951_00002?tracking_id=...)
 * Uses composedPath to catch links inside shadow DOMs (Coveo components).
 */
function installLinkInterceptor() {
  document.addEventListener("click", (e) => {
    const composedPath = e.composedPath();

    // Strategy 1: find a real <a> in the composed path
    let anchor = composedPath.find(
      (el) => el instanceof HTMLAnchorElement && el.href
    );

    // Strategy 2: find atomic-product-link in the path and get its shadow <a>
    if (!anchor) {
      for (const el of composedPath) {
        if (!el.tagName) continue;
        if (el.tagName.toLowerCase() === "atomic-product-link") {
          anchor = el.shadowRoot?.querySelector("a[href]");
          if (anchor) break;
        }
      }
    }

    // Strategy 3: walk up from the event target through host elements
    // to find an atomic-product-link (handles deeply nested shadow DOMs in recs)
    if (!anchor) {
      let node = e.composedPath()[0];
      while (node) {
        if (node instanceof HTMLAnchorElement && node.href) {
          anchor = node;
          break;
        }
        if (node.tagName?.toLowerCase() === "atomic-product-link") {
          anchor = node.shadowRoot?.querySelector("a[href]");
          if (anchor) break;
        }
        // Walk up: try parentElement, then host if we're at a shadow root boundary
        node = node.parentElement || node.getRootNode()?.host;
      }
    }

    if (!anchor) return;
    handleLinkClick(e, anchor);
  }, true);
}

function handleLinkClick(e, anchor) {
  let url;
  try { url = new URL(anchor.href); } catch { return; }

  // Only intercept same-origin links
  if (url.origin !== window.location.origin) return;

  // Determine the route path from the link's pathname
  let routePath = url.pathname.replace(/\/+$/, "") || "/";
  // Normalize /pdp/* to route key "/pdp"
  if (routePath.startsWith("/pdp/")) routePath = "/pdp";

  // Only intercept if we have a registered route for this path
  if (!routes[routePath]) return;

  e.preventDefault();

  // Preserve our query params (tracking_id, locale) from the current URL
  const dest = url.pathname + window.location.search;
  window.history.pushState(null, "", dest);
  resolveRoute();
}
