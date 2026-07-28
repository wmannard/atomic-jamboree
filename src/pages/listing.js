import { commerceEngine } from "../engine.js";
import { initAtomicCommerce } from "../shared/initAtomicCommerce.js";
import { initBadgePlacements, PLACEMENT_CONFIGS } from "../shared/initBadgePlacements.js";
import { mountInfoBanner } from "../components/infoBanner.js";
import { getPdpHrefTemplate } from "../router.js";
import listTemplate from "./templates/listing-list.html?raw";
import gridTemplate from "./templates/listing-grid.html?raw";
import tableTemplate from "./templates/listing-table.html?raw";

const templates = { list: listTemplate, grid: gridTemplate, table: tableTemplate };

/**
 * Factory to create listing page configs.
 * Each listing differs in: title, heading, display mode, visitor path, and view URL.
 */
function createListingPage({ title, heading, viewUrl, visitorPath, display }) {
  return {
    title,
    viewUrl,
    async render(container) {
      const pdpHref = getPdpHrefTemplate();
      container.innerHTML = templates[display].replaceAll(
        "<atomic-product-link",
        `<atomic-product-link href-template="${pdpHref}"`
      );

      // Set dynamic values via DOM manipulation
      container.querySelector("h2").textContent = heading;

      await initAtomicCommerce(commerceEngine);
      initBadgePlacements(PLACEMENT_CONFIGS.PLP);
      mountInfoBanner({ visitorPath });
    },
  };
}

export const listing1Page = createListingPage({
  title: "Listing 1",
  heading: "Surf Accessories",
  viewUrl: import.meta.env.VITE_LISTING_1_URL,
  visitorPath: "/plp/accessories/surf-accessories",
  display: "list",
});

export const listing2Page = createListingPage({
  title: "Listing 2",
  heading: "Pants",
  viewUrl: import.meta.env.VITE_LISTING_2_URL,
  visitorPath: "/plp/clothing/pants",
  display: "grid",
});

export const listing3Page = createListingPage({
  title: "Listing 3",
  heading: "Towels",
  viewUrl: import.meta.env.VITE_LISTING_3_URL,
  visitorPath: "/plp/accessories/towels",
  display: "table",
});
