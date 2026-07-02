import { setViewUrl } from "./engine.js";
import { navUrls } from "./navbar.js";

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
 * Get the current route path from the hash.
 */
function getCurrentPath() {
  const hash = window.location.hash.slice(1); // remove '#'
  return hash || "/";
}

/**
 * Resolve and render the current route.
 */
async function resolveRoute() {
  const path = getCurrentPath();
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
}

/**
 * Initialize the router - listen for hash changes and render initial route.
 */
export function initRouter() {
  window.addEventListener("hashchange", resolveRoute);
  resolveRoute();
}
