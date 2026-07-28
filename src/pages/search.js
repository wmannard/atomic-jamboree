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
    container.innerHTML = searchTemplate;

    // Set dynamic href-template on all product links
    const pdpHref = getPdpHrefTemplate();
    container.querySelectorAll("atomic-product-link").forEach((el) => {
      el.setAttribute("href-template", pdpHref);
    });

    await initAtomicCommerce(commerceEngine);
    initBadgePlacements(PLACEMENT_CONFIGS.SEARCH);
    mountInfoBanner({ visitorPath: "/search" });
  },
};
