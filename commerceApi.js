// This helper is for direct calls to the search API that bypass the atomic engine. Used for the PDP product retrieval.

import { navUrls } from "./navbar";

const {
  VITE_ORGANIZATION_ID,
  VITE_ENVIRONMENT,
  VITE_ACCESS_TOKEN,
  VITE_SEARCH_TOKEN,
  VITE_JAMBOREE,
  VITE_LOCALE,
} = import.meta.env;

const LOGGED_IN = localStorage.getItem("logged-in") === "true";
const ACCESS_TOKEN = LOGGED_IN ? VITE_SEARCH_TOKEN : VITE_ACCESS_TOKEN;

const prefix = `VITE_${VITE_JAMBOREE}_${VITE_LOCALE}_`;

const TRACKING_ID = import.meta.env[`${prefix}TRACKING_ID`];
const LANGUAGE = import.meta.env[`${prefix}LANGUAGE`];
const COUNTRY = import.meta.env[`${prefix}COUNTRY`];
const CURRENCY = import.meta.env[`${prefix}CURRENCY`];

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
  };
};
