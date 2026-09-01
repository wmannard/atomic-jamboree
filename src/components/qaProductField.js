import { fetchProductContext } from "@coveo/atomic";

const QA_FIELDS = new Set(["ec_date_added"]);

function getFieldValue(product, field) {
  if (product?.[field] !== undefined && product?.[field] !== null) {
    return product[field];
  }

  return product?.additionalFields?.[field];
}

function formatDateValue(value) {
  const timestamp = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function formatRawValue(value, field) {
  if (field === "ec_date_added" && (typeof value === "number" || typeof value === "string")) {
    return formatDateValue(value) || String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatRawValue(item, field)).join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

class QAProductField extends HTMLElement {
  updateVisibility = () => {
    this.style.setProperty(
      "display",
      document.documentElement.hasAttribute("data-show-qa-info")
        ? "block"
        : "none",
      "important"
    );
  };

  rootAttributeObserver = new MutationObserver(this.updateVisibility);

  async connectedCallback() {
    const field = this.getAttribute("field");

    if (!field || !QA_FIELDS.has(field)) {
      this.remove();
      return;
    }

    this.updateVisibility();
    this.rootAttributeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-show-qa-info"],
    });

    try {
      const product = await fetchProductContext(this);
      const value = getFieldValue(product, field);

      if (value === undefined || value === null || value === "") {
        this.remove();
        return;
      }

      this.textContent = `${field}: ${formatRawValue(value, field)}`;
    } catch (error) {
      console.error("QAProductField: Failed to get product context", error);
      this.remove();
    }
  }

  disconnectedCallback() {
    this.rootAttributeObserver.disconnect();
  }
}

customElements.define("qa-product-field", QAProductField);