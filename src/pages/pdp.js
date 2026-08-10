import { searchProduct, fetchBadges } from "../commerceApi.js";
import { initBadgePlacements, PLACEMENT_CONFIGS } from "../shared/initBadgePlacements.js";
import { mountInfoBanner } from "../components/infoBanner.js";
import { getEnvValue } from "../configHelper.js";
import { getPdpProductId } from "../router.js";
import { enableNavDropdowns } from "../components/navbar.js";
import pdpTemplate from "./templates/pdp.html?raw";
import { buildProductView, buildCart } from "@coveo/headless/commerce";
import { commerceEngine } from "../engine.js";

let lastViewedProductId = null;

/**
 * Maps Commerce API product data to the Headless Product interface.
 * @param {object} product - The product object from searchProduct()
 * @param {string} searchId - The searchId from the API response (top-level)
 * @returns {object} Product-shaped object for view()
 */
export function buildProductData(product, searchId) {
  const data = {
    permanentid: product.permanentid,
    ec_name: product.ec_name,
    responseId: searchId,
  };

  if (product.ec_promo_price != null && product.ec_promo_price < product.ec_price) {
    data.ec_promo_price = product.ec_promo_price;
  } else if (product.ec_price != null) {
    data.ec_price = product.ec_price;
  }

  return data;
}

/**
 * Builds a CartItem for updateItemQuantity.
 * @param {object} product - The product object from searchProduct()
 * @returns {object} CartItem-shaped object { productId, name, price, quantity }
 */
export function buildCartItem(product) {
  let price = 0;
  if (product.ec_promo_price != null && product.ec_promo_price < product.ec_price) {
    price = product.ec_promo_price;
  } else if (product.ec_price != null) {
    price = product.ec_price;
  }

  return {
    productId: product.permanentid,
    name: product.ec_name,
    price,
    quantity: 1,
  };
}

export const pdpPage = {
  title: "Product Detail Page",
  viewUrl: import.meta.env.VITE_PDP_URL || "https://sports.barca.group",
  async render(container) {
    // Extract product ID from URL path: /pdp/<productId>
    const productId = getPdpProductId();

    container.innerHTML = pdpTemplate;

    // PDP doesn't use atomic-commerce-interface, so unlock dropdowns immediately
    enableNavDropdowns();

    initBadgePlacements(PLACEMENT_CONFIGS.PDP);
    mountInfoBanner({ visitorPath: "/pdp" });

    // Reset dedup guard on each fresh render call
    lastViewedProductId = null;

    // Instantiate analytics controllers (non-critical — failures are swallowed)
    let productViewController = null;
    let cartController = null;
    try {
      productViewController = buildProductView(commerceEngine);
      cartController = buildCart(commerceEngine);
    } catch (e) {
      console.warn("Failed to initialize analytics controllers:", e);
    }

    const productContainer = document.getElementById("product-container");

    const lang = {
      en: {
        addToCart: "Add to Cart",
        removeFromCart: "Remove from Cart",
        buyNow: "Buy Now",
        inCart: "In Cart",
        inStock: "In Stock",
        outOfStock: "Out of Stock",
        productId: "Product ID",
      },
      fr: {
        addToCart: "Ajouter au panier",
        removeFromCart: "Retirer du panier",
        buyNow: "Acheter maintenant",
        inCart: "Dans le panier",
        inStock: "En stock",
        outOfStock: "Rupture de stock",
        productId: "ID du produit",
      },
      nl: {
        addToCart: "In winkelwagen",
        removeFromCart: "Uit winkelwagen",
        buyNow: "Nu kopen",
        inCart: "In winkelwagen",
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
            <button class="btn btn-warning btn-lg ms-2" id="buy-now-btn" ${!product.ec_in_stock ? "disabled" : ""}>
              ${translations.buyNow}
            </button>
            <div class="mt-4 text-muted small">
              <p>${translations.productId}: ${product.permanentid}</p>
            </div>
            <div id="in-cart-banner" class="alert alert-info mt-3" style="display:none;">
              🛒 ${translations.inCart}
            </div>
            <div id="event-banners" class="mt-3"></div>
          </div>
        </div>
      `;

      // Emit product view event after successful render
      if (productViewController && lastViewedProductId !== product.permanentid) {
        try {
          productViewController.view(buildProductData(product, result.searchId));
          lastViewedProductId = product.permanentid;
        } catch (e) {
          console.error("Failed to emit product view event:", e);
        }
      }

      const addToCartBtn = document.getElementById("add-to-cart-btn");
      const buyNowBtn = document.getElementById("buy-now-btn");
      const inCartBanner = document.getElementById("in-cart-banner");

      // localStorage cart helpers
      function getCart() {
        try { return JSON.parse(localStorage.getItem("pdp-cart") || "[]"); } catch { return []; }
      }
      function saveCart(cart) {
        localStorage.setItem("pdp-cart", JSON.stringify(cart));
      }
      function isInCart() {
        return getCart().includes(product.permanentid);
      }
      function updateCartUI() {
        if (isInCart()) {
          addToCartBtn.textContent = translations.removeFromCart;
          addToCartBtn.classList.remove("btn-primary");
          addToCartBtn.classList.add("btn-danger");
          inCartBanner.style.display = "block";
        } else {
          addToCartBtn.textContent = translations.addToCart;
          addToCartBtn.classList.remove("btn-danger");
          addToCartBtn.classList.add("btn-primary");
          inCartBanner.style.display = "none";
        }
      }

      // Initialize UI state from localStorage
      updateCartUI();

      if (addToCartBtn && product.ec_in_stock) {
        addToCartBtn.addEventListener("click", () => {
          if (isInCart()) {
            // Remove from cart
            const cart = getCart().filter(id => id !== product.permanentid);
            saveCart(cart);
            if (cartController) {
              try {
                cartController.updateItemQuantity({ ...buildCartItem(product), quantity: 0 });
              } catch (e) {
                console.error("Failed to emit cart remove event:", e);
              }
            }
          } else {
            // Add to cart
            const cart = getCart();
            cart.push(product.permanentid);
            saveCart(cart);
            if (cartController) {
              try {
                cartController.updateItemQuantity(buildCartItem(product));
              } catch (e) {
                console.error("Failed to emit add-to-cart event:", e);
              }
            }
          }
          updateCartUI();
        });
      }

      if (buyNowBtn && product.ec_in_stock) {
        buyNowBtn.addEventListener("click", () => {
          // Remove from cart list
          const cart = getCart().filter(id => id !== product.permanentid);
          saveCart(cart);
          if (cartController) {
            try {
              // Ensure item is in cart state before purchasing
              cartController.updateItemQuantity(buildCartItem(product));
              cartController.purchase({
                id: crypto.randomUUID(),
                revenue: buildCartItem(product).price,
              });
            } catch (e) {
              console.error("Failed to emit purchase event:", e);
            }
          }
          updateCartUI();
          // Show dismissible purchase banner
          const bannerContainer = document.getElementById("event-banners");
          const banner = document.createElement("div");
          banner.className = "alert alert-success alert-dismissible fade show mt-2";
          banner.innerHTML = `🎉 Purchased <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
          bannerContainer.appendChild(banner);
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
