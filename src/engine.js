import { buildCommerceEngine } from "@coveo/headless/commerce";
import { buildContext } from "@coveo/headless/commerce";
import { buildRecommendations } from "@coveo/headless/commerce";
import { getJamboree, getLocaleContext, setLocaleSlug, parseLocaleSlug } from "./configHelper";
import { fetchToken } from "./tokenClient.js";

const { VITE_ORGANIZATION_ID, VITE_ENVIRONMENT } = import.meta.env;

const TRACKING_ID = `jamboree_${getJamboree()}`;
const { language: LANGUAGE, country: COUNTRY, currency: CURRENCY } = getLocaleContext();

/**
 * Initialize the commerce engine with a fresh search token.
 * Exported as a Promise so consumers can `await engineReady`.
 */
export const engineReady = initEngine();

/** Mutable reference to the resolved engine instance. */
export let commerceEngine = null;

async function initEngine() {
  const token = await fetchToken();

  const engine = buildCommerceEngine({
    configuration: {
      organizationId: VITE_ORGANIZATION_ID,
      environment: VITE_ENVIRONMENT,
      accessToken: token,
      renewAccessToken: () => fetchToken(),
      analytics: {
        trackingId: TRACKING_ID,
      },
      context: {
        language: LANGUAGE,
        country: COUNTRY,
        currency: CURRENCY,
        view: {
          url: window.location.href,
        },
      },
      preprocessRequest: (request) => {
        const body = request.body ? JSON.parse(request.body) : {};
        if (request.url && request.url.includes("/listing")) {
          const sponsoredProducts =
            JSON.parse(localStorage.getItem("sponsored-products") || "{}") || {};
          body.pinnedProducts = sponsoredProducts?.sponsored || [];
        }
        request.body = JSON.stringify(body);
        return request;
      },
    },
  });

  commerceEngine = engine;
  window.__commerceEngine = engine; // Expose for devtools debugging
  return engine;
}

// Context controller — created lazily after engine resolves
let contextController = null;

/**
 * Update the engine's view URL when navigating between pages.
 * This is critical for correct analytics and PLP targeting.
 * @param {string} url - The URL corresponding to the current page/view
 */
export function setViewUrl(url) {
  if (!commerceEngine) return;
  if (!contextController) {
    contextController = buildContext(commerceEngine);
  }
  contextController.setView({ url });
}

/**
 * Switch the locale without a page reload.
 * Parses language/country/currency from the locale slug,
 * then calls updateLocale on the Atomic interface to batch the context + i18n change.
 * @param {string} newSlug - Locale slug (e.g. "fr-fr-eur", "en-us-usd")
 */
export function switchLocale(newSlug) {
  const { language, country, currency } = parseLocaleSlug(newSlug);

  // Update configHelper's locale for any subsequent getLocaleContext calls
  setLocaleSlug(newSlug);

  // Call updateLocale which atomically updates engine context + i18n
  const iface = document.querySelector("atomic-commerce-interface");
  if (iface?.updateLocale) {
    iface.updateLocale(language, country, currency);
    // updateLocale dispatches setContext but doesn't trigger a refetch —
    // we need to explicitly re-execute the request.
    iface.executeFirstRequest();
  }

  // Handle recommendation interfaces (they don't have executeFirstRequest,
  // so we call updateLocale then manually refresh each recommendation list)
  const recInterfaces = document.querySelectorAll(
    "atomic-commerce-recommendation-interface"
  );
  if (recInterfaces.length > 0) {
    recInterfaces.forEach((recIface) => {
      if (recIface.updateLocale) {
        recIface.updateLocale(language, country, currency);
      }
    });

    // Refresh each recommendation list by building a temporary controller
    // and calling refresh() which dispatches fetchRecommendations with the
    // updated context.
    const recLists = document.querySelectorAll(
      "atomic-commerce-recommendation-list"
    );
    recLists.forEach((list) => {
      const slotId = list.getAttribute("slot-id");
      if (slotId) {
        const ctrl = buildRecommendations(commerceEngine, {
          options: { slotId },
        });
        ctrl.refresh();
      }
    });
  }
}
