import { buildCommerceEngine } from "@coveo/headless/commerce";
import { buildContext } from "@coveo/headless/commerce";
import { getEnvValue } from "./configHelper";

const {
  VITE_ORGANIZATION_ID,
  VITE_ENVIRONMENT,
  VITE_ACCESS_TOKEN,
  VITE_SEARCH_TOKEN,
} = import.meta.env;

// Use VITE_SEARCH_TOKEN if 'logged-in' is true in localStorage
const LOGGED_IN = localStorage.getItem("logged-in") === "true";
const ACCESS_TOKEN = LOGGED_IN ? VITE_SEARCH_TOKEN : VITE_ACCESS_TOKEN;

const TRACKING_ID = getEnvValue("TRACKING_ID");
const LANGUAGE = getEnvValue("LANGUAGE");
const COUNTRY = getEnvValue("COUNTRY");
const CURRENCY = getEnvValue("CURRENCY");

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
