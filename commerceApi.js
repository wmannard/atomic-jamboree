// This helper is for direct calls to the search API that bypass the atomic engine. Used for the PDP product retrieval.

import { getEnvValue } from "./configHelper";
import { navUrls } from "./navbar";

const {
  VITE_ORGANIZATION_ID,
  VITE_ENVIRONMENT,
  VITE_NEW_ACCESS_TOKEN,
  VITE_SEARCH_TOKEN,
} = import.meta.env;

// VITE_NEW_ACCESS_TOKEN is a transitional name — revert to VITE_ACCESS_TOKEN when ready
const LOGGED_IN = localStorage.getItem("logged-in") === "true";
const ACCESS_TOKEN = LOGGED_IN ? VITE_SEARCH_TOKEN : VITE_NEW_ACCESS_TOKEN;

const TRACKING_ID = getEnvValue('TRACKING_ID');
const LANGUAGE = getEnvValue('LANGUAGE');
const COUNTRY = getEnvValue('COUNTRY');
const CURRENCY = getEnvValue('CURRENCY');

const generateClientId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const searchProduct = async (productId, options = {}) => {
  const baseUrl =
    VITE_ENVIRONMENT === "prod"
      ? "https://platform.cloud.coveo.com"
      : `https://platform${VITE_ENVIRONMENT}.cloud.coveo.com`;

  const url = `${baseUrl}/rest/organizations/${VITE_ORGANIZATION_ID}/commerce/v2/search`;

  const body = {
    trackingId: TRACKING_ID,
    language: LANGUAGE,
    country: COUNTRY,
    currency: CURRENCY,
    clientId: generateClientId(),
    page: 0,
    perPage: options.perPage || 10,
    query: productId,
    context: {
      view: {
        url: navUrls[document.title]?.url || window.location.href,
      },
      ...options.context,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Commerce API request failed: ${response.status}`);
  }

  const result = await response.json();

  // Find the exact product by permanentid
  const product = result.products?.find((p) => p.permanentid === productId);

  if (!product) {
    throw new Error(`Product with id ${productId} not found`);
  }

  return {
    ...result,
    product, // The matched product
    language: LANGUAGE,
    country: COUNTRY,
    currency: CURRENCY,
  };
};

export const fetchBadges = async (productId, placementIds) => {
  const baseUrl =
    VITE_ENVIRONMENT === "prod"
      ? "https://platform.cloud.coveo.com"
      : `https://platform${VITE_ENVIRONMENT}.cloud.coveo.com`;

  const url = `${baseUrl}/rest/organizations/${VITE_ORGANIZATION_ID}/commerce/v2/tracking-ids/${TRACKING_ID}/badges`;

  const body = {
    language: LANGUAGE,
    country: COUNTRY,
    currency: CURRENCY,
    placementIds: placementIds.filter(Boolean),
    context: {
      user: {
        userAgent: navigator.userAgent,
      },
      view: {
        url: window.location.href,
      },
      capture: true,
      cart: [],
      source: ["@coveo/headless@3.35.1"],
      product: {
        productId,
      },
      enableSemantic: true,
      enableML: true,
      enableBusinessRules: false,
      enableMerchandizing: false,
      enableRGA: false,
      useSSR: false,
    },
    clientId: generateClientId(),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Badges API request failed: ${response.status}`);
  }

  return response.json();
};
