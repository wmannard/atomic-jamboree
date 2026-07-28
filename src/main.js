import "./qa-info.js";
import "./shared/initAtomicLoader.js";
import "./components/badgePlacement.js";
import "./components/navbar.js";
import { registerRoute, initRouter } from "./router.js";
import { searchPage } from "./pages/search.js";
import { listing1Page, listing2Page, listing3Page } from "./pages/listing.js";
import { recs1Page, recs2Page } from "./pages/recs.js";
import { pdpPage } from "./pages/pdp.js";

// Register all routes
registerRoute("/", searchPage);
registerRoute("/listing1", listing1Page);
registerRoute("/listing2", listing2Page);
registerRoute("/listing3", listing3Page);
registerRoute("/recs1", recs1Page);
registerRoute("/recs2", recs2Page);
registerRoute("/pdp", pdpPage);

// Start the router
initRouter();
