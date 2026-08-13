import "./qa-info.js";
import "./shared/initAtomicLoader.js";
import "./components/badgePlacement.js";
import "./components/navbar.js";
import { engineReady } from "./engine.js";
import { registerRoute, initRouter } from "./router.js";
import { searchPage } from "./pages/search.js";
import { listing1Page, listing2Page, listing3Page } from "./pages/listing.js";
import { recs1Page, recs2Page } from "./pages/recs.js";
import { pdpPage } from "./pages/pdp.js";

// Register all routes
registerRoute("/search", searchPage);
registerRoute("/listing1", listing1Page);
registerRoute("/listing2", listing2Page);
registerRoute("/listing3", listing3Page);
registerRoute("/recs1", recs1Page);
registerRoute("/recs2", recs2Page);
registerRoute("/pdp", pdpPage);

// Show loading spinner while fetching token
document.getElementById("app").innerHTML = `
  <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
`;

// Wait for engine to be ready with a valid token, then start routing
try {
  await engineReady;
  initRouter();
} catch (err) {
  document.getElementById("app").innerHTML = `
    <div class="alert alert-danger text-center my-5">
      <h4>Search service unavailable</h4>
      <p>${err.message}</p>
      <p>Check that <code>COVEO_API_KEY</code> is configured correctly.</p>
    </div>
  `;
}
