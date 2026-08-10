import { buildCart } from "@coveo/headless/commerce";
import { commerceEngine } from "../engine.js";
import { getJamboree, getLocaleContext } from "../configHelper.js";

/**
 * Shared cart widget backed by localStorage, scoped by tracking ID.
 * Renders a Bootstrap card showing cart items with +/−/✕ controls and Checkout/Clear buttons.
 * Emits Coveo cart and purchase events via the Headless Cart controller.
 */

let cartController = null;
try {
  cartController = buildCart(commerceEngine);
} catch (e) {
  console.warn("Failed to initialize cart controller for widget:", e);
}

const cartKey = `pdp-cart-jamboree_${getJamboree()}`;

export function getCart() {
  try { return JSON.parse(localStorage.getItem(cartKey) || "[]"); } catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

export function getCartController() {
  return cartController;
}

/**
 * Render the cart widget into a given container element.
 * @param {HTMLElement} containerEl - The element to render the cart card into
 * @param {object} [options] - Optional config
 * @param {Intl.NumberFormat} [options.currencyFormatter] - Currency formatter for prices
 * @param {function} [options.onUpdate] - Callback after cart state changes
 */
export function renderCartWidget(containerEl, options = {}) {
  const { language, country, currency } = getLocaleContext();
  const locale = `${language}-${country}`;
  const currencyFormatter = options.currencyFormatter || new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
  const cart = getCart();

  if (cart.length === 0) {
    containerEl.style.display = "none";
    containerEl.innerHTML = "";
    return;
  }

  const search = window.location.search;
  const itemsHtml = cart.map((item, idx) =>
    `<li class="list-group-item d-flex justify-content-between align-items-center">
      <a href="/pdp/${encodeURIComponent(item.id)}${search}">${item.name}</a>
      <span class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary cart-qty-minus" data-idx="${idx}">−</button>
        <span>${item.quantity}</span>
        <button class="btn btn-sm btn-outline-secondary cart-qty-plus" data-idx="${idx}">+</button>
        <span class="badge bg-primary rounded-pill">${currencyFormatter.format(item.price * item.quantity)}</span>
        <button class="btn btn-sm btn-outline-danger cart-remove" data-idx="${idx}">✕</button>
      </span>
    </li>`
  ).join("");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  containerEl.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center">
      <strong>🛒 Cart (${cart.reduce((s, i) => s + i.quantity, 0)})</strong>
      <span>Total: ${currencyFormatter.format(total)}</span>
    </div>
    <ul class="list-group list-group-flush">${itemsHtml}</ul>
    <div class="card-body">
      <button class="btn btn-warning btn-sm" id="cart-widget-checkout-btn">Checkout</button>
      <button class="btn btn-outline-secondary btn-sm ms-2" id="cart-widget-clear-btn">Clear</button>
    </div>
  `;
  containerEl.style.display = "block";

  // +/- quantity handlers
  containerEl.querySelectorAll(".cart-qty-plus").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = getCart();
      const idx = parseInt(btn.dataset.idx);
      c[idx].quantity++;
      saveCart(c);
      if (cartController) {
        try {
          cartController.updateItemQuantity({ productId: c[idx].id, name: c[idx].name, price: c[idx].price, quantity: c[idx].quantity });
        } catch (e) { console.error("Failed to emit cart update event:", e); }
      }
      renderCartWidget(containerEl, options);
      options.onUpdate?.();
    });
  });
  containerEl.querySelectorAll(".cart-qty-minus").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = getCart();
      const idx = parseInt(btn.dataset.idx);
      if (c[idx].quantity > 1) {
        c[idx].quantity--;
        saveCart(c);
        if (cartController) {
          try {
            cartController.updateItemQuantity({ productId: c[idx].id, name: c[idx].name, price: c[idx].price, quantity: c[idx].quantity });
          } catch (e) { console.error("Failed to emit cart update event:", e); }
        }
      }
      renderCartWidget(containerEl, options);
      options.onUpdate?.();
    });
  });
  containerEl.querySelectorAll(".cart-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = getCart();
      const idx = parseInt(btn.dataset.idx);
      const removed = c.splice(idx, 1)[0];
      saveCart(c);
      if (cartController) {
        try {
          cartController.updateItemQuantity({ productId: removed.id, name: removed.name, price: removed.price, quantity: 0 });
        } catch (e) { console.error("Failed to emit cart remove event:", e); }
      }
      renderCartWidget(containerEl, options);
      options.onUpdate?.();
    });
  });

  containerEl.querySelector("#cart-widget-checkout-btn")?.addEventListener("click", () => {
    if (cartController) {
      try {
        for (const item of cart) {
          cartController.updateItemQuantity({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity });
        }
        cartController.purchase({ id: crypto.randomUUID(), revenue: total });
      } catch (e) {
        console.error("Failed to emit checkout purchase event:", e);
      }
    }
    saveCart([]);
    renderCartWidget(containerEl, options);
    options.onUpdate?.();

    // Show purchase banner if event-banners container exists
    const bannerContainer = document.getElementById("event-banners");
    if (bannerContainer) {
      const banner = document.createElement("div");
      banner.className = "alert alert-success alert-dismissible fade show mt-2";
      banner.innerHTML = `🎉 Purchased ${cart.reduce((s, i) => s + i.quantity, 0)} item(s) for ${currencyFormatter.format(total)} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
      bannerContainer.appendChild(banner);
    }
  });

  containerEl.querySelector("#cart-widget-clear-btn")?.addEventListener("click", () => {
    if (cartController) {
      try {
        for (const item of cart) {
          cartController.updateItemQuantity({ productId: item.id, name: item.name, price: item.price, quantity: 0 });
        }
      } catch (e) {
        console.error("Failed to emit cart clear events:", e);
      }
    }
    saveCart([]);
    renderCartWidget(containerEl, options);
    options.onUpdate?.();
  });
}
