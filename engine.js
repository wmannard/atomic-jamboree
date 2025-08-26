import { buildCommerceEngine } from "@coveo/headless/commerce";
import { navUrls } from "./navbar";

const {
  VITE_ORGANIZATION_ID,
  VITE_ENVIRONMENT,
  VITE_ACCESS_TOKEN,
  VITE_SEARCH_TOKEN,
  VITE_JAMBOREE,
  VITE_LOCALE,
} = import.meta.env;

// Use VITE_SEARCH_TOKEN if 'logged-in' is true in localStorage
const LOGGED_IN = localStorage.getItem('logged-in') === 'true';
const ACCESS_TOKEN = LOGGED_IN ? VITE_SEARCH_TOKEN : VITE_ACCESS_TOKEN;

const prefix = `VITE_${VITE_JAMBOREE}_${VITE_LOCALE}_`;

const TRACKING_ID = import.meta.env[`${prefix}TRACKING_ID`];
const LANGUAGE = import.meta.env[`${prefix}LANGUAGE`];
const COUNTRY = import.meta.env[`${prefix}COUNTRY`];
const CURRENCY = import.meta.env[`${prefix}CURRENCY`];

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
        url: navUrls[document.title].url,
      },
    },
    preprocessRequest: (request) => {
      const body = request.body ? JSON.parse(request.body) : {};
        // If the request is for a listing, pull sponsored products from localStorage
        if (request.url && request.url.includes('/listing')) {
          const sponsoredProducts = JSON.parse(localStorage.getItem('sponsored-products') || '{}') || {};
          body.pinnedProducts = sponsoredProducts?.sponsored || [];
        }
      request.body = JSON.stringify(body);
      return request;
    },
  },
});
