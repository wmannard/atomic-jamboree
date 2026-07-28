import { buildCommerceEngine } from "@coveo/headless/commerce";
import { buildContext } from "@coveo/headless/commerce";
import { buildRecommendations } from "@coveo/headless/commerce";
import { getEnvValue, getLocaleContext, setLocaleSlug, parseLocaleSlug } from "./configHelper";

const {
  VITE_ORGANIZATION_ID,
  VITE_ENVIRONMENT,
  VITE_NEW_ACCESS_TOKEN,
  VITE_SEARCH_TOKEN,
} = import.meta.env;

// Use VITE_SEARCH_TOKEN if 'logged-in' is true in localStorage
const LOGGED_IN = localStorage.getItem("logged-in") === "true";
const ACCESS_TOKEN = LOGGED_IN ? VITE_SEARCH_TOKEN : VITE_NEW_ACCESS_TOKEN;

const TRACKING_ID = getEnvValue("TRACKING_ID");
const { language: LANGUAGE, country: COUNTRY, currency: CURRENCY } = getLocaleContext();

export const commerceEngine = buildCommerceEngine({
  configuration: {
    organizationId: VITE_ORGANIZATION_ID,
    environment: VITE_ENVIRONMENT,
    accessToken: ACCESS_TOKEN,
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

// Context controller for updating view URL on navigation
const contextController = buildContext(commerceEngine);

/**
 * Update the engine's view URL when navigating between pages.
 * This is critical for correct analytics and PLP targeting.
 * @param {string} url - The URL corresponding to the current page/view
 */
export function setViewUrl(url) {
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
