import { commerceEngine } from "../engine.js";
import { initAtomicRecommendations } from "../shared/initAtomicRecommendations.js";
import { getEnvValue } from "../configHelper.js";
import { mountInfoBanner } from "../components/infoBanner.js";
import { getPdpHrefTemplate } from "../router.js";
import recs1Template from "./templates/recs1.html?raw";
import recs2Template from "./templates/recs2.html?raw";

export const recs1Page = {
  title: "Recs 1",
  viewUrl: import.meta.env.VITE_RECS_1_URL,
  async render(container) {
    const pdpHref = getPdpHrefTemplate();
    container.innerHTML = recs1Template.replaceAll(
      "<atomic-product-link",
      `<atomic-product-link href-template="${pdpHref}"`
    );

    const boughtSlot = getEnvValue("SLOT_ID_POPULAR_BOUGHT");
    const viewedSlot = getEnvValue("SLOT_ID_POPULAR_VIEWED");

    document.getElementById("popular_bought").setAttribute("slot-id", boughtSlot);
    document.getElementById("popular_viewed").setAttribute("slot-id", viewedSlot);

    await initAtomicRecommendations(commerceEngine);
  },
};

export const recs2Page = {
  title: "Recs 2",
  viewUrl: import.meta.env.VITE_RECS_2_URL,
  async render(container) {
    const pdpHref = getPdpHrefTemplate();
    container.innerHTML = recs2Template.replaceAll(
      "<atomic-product-link",
      `<atomic-product-link href-template="${pdpHref}"`
    );

    const cartSlot = getEnvValue("SLOT_ID_CART_RECOMMENDATIONS");
    document.getElementById("cart_recommendations").setAttribute("slot-id", cartSlot);

    await initAtomicRecommendations(commerceEngine);
    mountInfoBanner({ visitorPath: "/plp/accessories/towels" });
  },
};
