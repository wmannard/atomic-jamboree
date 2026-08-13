// This helper is for direct calls to the search API that bypass the atomic engine.
// Used for PDP product retrieval and badge fetching.

import { getEnvValue, getJamboree, getLocaleContext } from "./configHelper";
import { navUrls } from "./components/navbar";
import { fetchToken } from "./tokenClient.js";

const { VITE_ORGANIZATION_ID, VITE_ENVIRONMENT } = import.meta.env;

const TRACKING_ID = `jamboree_${getJamboree()}`;

// Token cache for direct API calls
let cachedToken = null;

async function getToken() {
  if (!cachedToken) {
    cachedToken = await fetchToken();
  }
  return cachedToken;
}

/**
 * Fetch wrapper that adds Authorization header and retries on token expiry (401/419).
 */
async function authenticatedFetch(url, options = {}) {
  let token = await getToken();
  let res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });

  // Token expired — refresh and retry once
  if (res.status === 401 || res.status === 419) {
    cachedToken = null;
    token = await getToken();
    res = await fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }

  return res;
}

const generateClientId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const searchProduct = async (productId, options = {}) => {
  const { language, country, currency } = getLocaleContext();
  const baseUrl =
    VITE_ENVIRONMENT === "prod"
      ? "https://platform.cloud.coveo.com"
      : `https://platform${VITE_ENVIRONMENT}.cloud.coveo.com`;

  const url = `${baseUrl}/rest/organizations/${VITE_ORGANIZATION_ID}/commerce/v2/search`;

  const body = {
    trackingId: TRACKING_ID,
    language,
    country,
    currency,
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

  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
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
    language,
    country,
    currency,
  };
};

export const fetchBadges = async (productId, placementIds) => {
  const { language, country, currency } = getLocaleContext();
  const baseUrl =
    VITE_ENVIRONMENT === "prod"
      ? "https://platform.cloud.coveo.com"
      : `https://platform${VITE_ENVIRONMENT}.cloud.coveo.com`;

  const url = `${baseUrl}/rest/organizations/${VITE_ORGANIZATION_ID}/commerce/v2/tracking-ids/${TRACKING_ID}/badges`;

  const body = {
    language,
    country,
    currency,
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

  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Badges API request failed: ${response.status}`);
  }

  return response.json();
};
