import { commerceEngine } from "../engine.js";
import { initAtomicRecommendations } from "../shared/initAtomicRecommendations.js";
import { getEnvValue } from "../configHelper.js";
import { mountInfoBanner } from "../components/infoBanner.js";
import { getPdpHrefTemplate } from "../router.js";
import { renderCartWidget, getCart, getCartController } from "../components/cartWidget.js";
import recs1Template from "./templates/recs1.html?raw";
import recs2Template from "./templates/recs2.html?raw";

/**
 * Sync localStorage cart items into the Headless engine's cart state.
 * This ensures recommendation requests include cart context on fresh loads.
 */
function syncCartToEngine() {
  const cart = getCart();
  const cartController = getCartController();
  if (!cartController || cart.length === 0) return;
  try {
    for (const item of cart) {
      cartController.updateItemQuantity({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity });
    }
  } catch (e) {
    console.warn("Failed to sync cart to engine:", e);
  }
}

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

    // Sync localStorage cart into engine before fetching recommendations
    syncCartToEngine();

    await initAtomicRecommendations(commerceEngine);
    mountInfoBanner({ visitorPath: "/plp/accessories/towels" });

    // Render shared cart widget (show empty state on this page, purchase mode)
    const cartCardEl = document.getElementById("cart-card");
    if (cartCardEl) {
      renderCartWidget(cartCardEl, { showEmpty: true, mode: "purchase" });
    }
  },
};
