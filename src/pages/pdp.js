import { searchProduct, fetchBadges } from "../commerceApi.js";
import { initBadgePlacements, PLACEMENT_CONFIGS } from "../shared/initBadgePlacements.js";
import { mountInfoBanner } from "../components/infoBanner.js";
import { getEnvValue } from "../configHelper.js";
import pdpTemplate from "./templates/pdp.html?raw";

export const pdpPage = {
  title: "Product Detail Page",
  viewUrl: import.meta.env.VITE_PDP_URL || "https://sports.barca.group",
  async render(container) {
    // Extract product ID from URL query string: /pdp/?<productId>
    const params = new URLSearchParams(window.location.search);
    let productId = params.get("0") || params.toString().replace("=", "");
    if (!productId) productId = "";

    container.innerHTML = pdpTemplate;

    initBadgePlacements(PLACEMENT_CONFIGS.PDP);
    mountInfoBanner({ visitorPath: "/pdp" });

    const productContainer = document.getElementById("product-container");

    const lang = {
      en: {
        addToCart: "Add to Cart",
        inStock: "In Stock",
        outOfStock: "Out of Stock",
        productId: "Product ID",
      },
      fr: {
        addToCart: "Ajouter au panier",
        inStock: "En stock",
        outOfStock: "Rupture de stock",
        productId: "ID du produit",
      },
      nl: {
        addToCart: "In winkelwagen",
        inStock: "Op voorraad",
        outOfStock: "Niet op voorraad",
        productId: "Product-ID",
      },
    };

    if (!productId) {
      productContainer.innerHTML = `
        <div class="alert alert-warning">No product ID provided</div>
      `;
      return;
    }

    try {
      const result = await searchProduct(productId);
      const product = result.product;

      // Fetch badges for PDP placements
      const overImageId = window.BADGE_PLACEMENTS?.PDP_OVER_IMAGE;
      const underTitleId = window.BADGE_PLACEMENTS?.PDP_UNDER_TITLE;
      let badgeData = null;
      const pdpPlacementIds = [overImageId, underTitleId].filter(Boolean);
      if (pdpPlacementIds.length > 0) {
        try {
          badgeData = await fetchBadges(product.permanentid, pdpPlacementIds);
        } catch (e) {
          console.warn("Failed to fetch PDP badges:", e);
        }
      }

      function escapeHtml(str) {
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function renderBadgesHTML(placementId, badgeResponse) {
        if (!placementId || !badgeResponse?.products) return "";
        const prod = badgeResponse.products.find((p) => p.productId === productId);
        if (!prod) return "";
        const placement = prod.badgePlacements?.find((p) => p.placementId === placementId);
        if (!placement?.badges?.length) return "";
        return placement.badges
          .map((b) => {
            const bgColor = b.backgroundColor || "#000";
            const textColor = b.textColor || "#fff";
            const iconHtml = b.iconUrl
              ? `<img src="${b.iconUrl}" style="width:1rem;height:1rem;" />`
              : "";
            const safeText = escapeHtml(b.text || "");
            return `<span style="background:${bgColor};color:${textColor};padding:0.25rem 0.5rem;border-radius:0.25rem;font-size:0.875rem;font-weight:500;display:inline-flex;align-items:center;gap:0.25rem;margin-right:0.5rem;">${iconHtml}${safeText}</span>`;
          })
          .join("");
      }

      // Create currency formatter with proper locale
      const locale = `${result.language}-${result.country}`;
      const currencyFormatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: result.currency,
      });

      // Get translations for current language
      const translations = lang[result.language] || lang.en;

      productContainer.innerHTML = `
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div style="position:relative;">
              <div id="pdp-badge-over-image" style="position:absolute;top:8px;left:8px;z-index:1;">${renderBadgesHTML(overImageId, badgeData)}</div>
              <img
                src="${product.ec_images?.[0] || ""}"
                alt="${product.ec_name}"
                class="img-fluid rounded"
                style="max-width: 500px;"
              />
            </div>
          </div>
          <div class="col-lg-6">
            <h1 class="mb-1">${product.ec_name}</h1>
            <div id="pdp-badge-under-title" class="mb-2">${renderBadgesHTML(underTitleId, badgeData)}</div>
            <p class="text-muted mb-2">${product.ec_brand}</p>
            <div class="mb-3">
              ${product.ec_rating ? `<span class="text-warning">★ ${product.ec_rating.toFixed(1)}</span>` : ""}
            </div>
            <div class="mb-4">
              ${
                product.ec_promo_price < product.ec_price
                  ? `<span class="h3 text-danger me-2">${currencyFormatter.format(product.ec_promo_price)}</span>
                     <span class="text-decoration-line-through text-muted">${currencyFormatter.format(product.ec_price)}</span>`
                  : `<span class="h3">${currencyFormatter.format(product.ec_price)}</span>`
              }
            </div>
            <p class="mb-4">${product.ec_description}</p>
            <button class="btn btn-primary btn-lg" id="add-to-cart-btn" ${!product.ec_in_stock ? "disabled" : ""}>
              ${translations.addToCart}
            </button>
            <div class="mt-4 text-muted small">
              <p>${translations.productId}: ${product.permanentid}</p>
            </div>
          </div>
        </div>
      `;

      const addToCartBtn = document.getElementById("add-to-cart-btn");
      if (addToCartBtn && product.ec_in_stock) {
        addToCartBtn.addEventListener("click", () => {
          alert("Cart coming soon");
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      productContainer.innerHTML = `
        <div class="alert alert-danger">
          <h4>Error loading product</h4>
          <p>${error.message}</p>
        </div>
      `;
    }
  },
};
