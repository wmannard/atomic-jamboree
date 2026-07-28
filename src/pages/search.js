import { commerceEngine } from "../engine.js";
import { initAtomicCommerce } from "../shared/initAtomicCommerce.js";
import { initBadgePlacements, PLACEMENT_CONFIGS } from "../shared/initBadgePlacements.js";
import { mountInfoBanner } from "../components/infoBanner.js";
import { getPdpHrefTemplate } from "../router.js";
import searchTemplate from "./templates/search.html?raw";

export const searchPage = {
  title: "Search",
  viewUrl: import.meta.env.VITE_SEARCH_URL,
  async render(container) {
    const pdpHref = getPdpHrefTemplate();
    container.innerHTML = searchTemplate.replaceAll(
      "<atomic-product-link",
      `<atomic-product-link href-template="${pdpHref}"`
    );

    await initAtomicCommerce(commerceEngine);
    initBadgePlacements(PLACEMENT_CONFIGS.SEARCH);
    mountInfoBanner({ visitorPath: "/search" });
  },
};
