export const navUrls = {
  Search: {
    url: import.meta.env.VITE_SEARCH_URL,
  },
  "Listing 1": {
    url: import.meta.env.VITE_LISTING_1_URL,
  },
  "Listing 2": {
    url: import.meta.env.VITE_LISTING_2_URL,
  },
  "Listing 3": {
    url: import.meta.env.VITE_LISTING_3_URL,
  },
  "Recs 1": {
    url: import.meta.env.VITE_RECS_1_URL,
  },
  "Recs 2": {
    url: import.meta.env.VITE_RECS_2_URL,
  },
};

const base = import.meta.env.BASE_URL || "/";

document.querySelector("#nav-bar").innerHTML = `
  <div id="navbar-container" class="d-flex justify-content-center align-items-center w-100 py-2 border-bottom mb-3" style="font-family: var(--atomic-font-family);">
    <div class="dropdown me-3">
      <button class="btn btn-primary dropdown-toggle" type="button" id="pagesDropdown" data-bs-toggle="dropdown" aria-expanded="false">
        Navigation
      </button>
      <ul class="dropdown-menu" aria-labelledby="pagesDropdown">
        <li><a class="dropdown-item" href="${base}">Search</a></li>
        <li><a class="dropdown-item" href="${base}listing1/">Surf Accessories</a></li>
        <li><a class="dropdown-item" href="${base}listing2/">Pants</a></li>
        <li><a class="dropdown-item" href="${base}listing3/">Towels</a></li>
        <li><a class="dropdown-item" href="${base}recs1/">Recs</a></li>
        <li><a class="dropdown-item" href="${base}recs2/">Cart Recs</a></li>
      </ul>
    </div>
    <span class="vr mx-4"></span>
    <span class="d-inline-flex align-items-center ms-3">
      <label for="property-dropdown" class="me-2 fs-6">Property:</label>
      <select id="property-dropdown" class="form-select form-select-sm w-auto">
        ${Array.from(
          { length: 9 },
          (_, i) =>
            `<option value="jamboree_${i + 1}">jamboree_${i + 1}</option>`
        ).join("")}
      </select>
    </span>
    <span class="d-inline-flex align-items-center ms-3">
      <label for="locale-dropdown" class="me-2 fs-6">Locale:</label>
      <select id="locale-dropdown" class="form-select form-select-sm w-auto">
        <option value="en">EN-US-USD</option>
        <option value="fr">FR-FR-EUR</option>
      </select>
    </span>
    <span class="d-inline-flex align-items-center ms-3">
      <label for="sponsored-products-input" class="fs-6 me-2">Pin products:</label>
      <input type="text" id="sponsored-products-input" class="form-control form-control-sm w-auto" placeholder="Enter IDs, comma separated" />
      <button id="save-sponsored-products" class="btn btn-sm btn-primary ms-2">Save</button>
    </span>
    <span id="sponsored-products-tags" class="ms-3"></span>
    <span class="d-inline-flex align-items-center ms-auto me-4">
      <label for="qa-info-toggle" class="fs-6 me-2">Show QA Info</label>
      <input type="checkbox" id="qa-info-toggle" />
      <label for="logged-in-toggle" class="fs-6 ms-3 me-2">Logged In</label>
      <input type="checkbox" id="logged-in-toggle" />
    </span>
  </div>
`;
// Highlight the current page in the dropdown (run after navbar is rendered)
const currentPath = window.location.pathname;
let currentItemText = "Navigation";
document.querySelectorAll(".dropdown-item").forEach((item) => {
  if (item.getAttribute("href") === currentPath) {
    item.classList.add("active");
    item.setAttribute("aria-current", "page");
    currentItemText = item.textContent;
  }
});
document.getElementById("pagesDropdown").innerText = currentItemText;

const navbarContainer = document.querySelector("#navbar-container");
// Sponsored Products input logic
function injectSponsoredProducts(newValue) {
  const sponsoredArray = newValue
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  localStorage.setItem(
    "sponsored-products",
    JSON.stringify({ sponsored: sponsoredArray })
  );
  renderSponsoredTags(sponsoredArray);
  window.location.reload();
}

function renderSponsoredTags(sponsoredArray) {
  const tagsContainer = document.getElementById("sponsored-products-tags");
  if (!tagsContainer) return;
  tagsContainer.innerHTML = sponsoredArray
    .map(
      (id) =>
        `<span class="badge bg-info text-dark" style="margin-right:6px;">${id}</span>`
    )
    .join("");
}

// Load initial sponsored products from localStorage
const sponsoredProductsRaw = localStorage.getItem("sponsored-products");
const sponsoredArray =
  sponsoredProductsRaw && JSON.parse(sponsoredProductsRaw).sponsored
    ? JSON.parse(sponsoredProductsRaw).sponsored
    : [];
document.getElementById("sponsored-products-input").value =
  sponsoredArray.join(", ");
renderSponsoredTags(sponsoredArray);

// Save button logic
document
  .getElementById("save-sponsored-products")
  .addEventListener("click", () => {
    const inputValue = document.getElementById(
      "sponsored-products-input"
    ).value;
    injectSponsoredProducts(inputValue);
  });

// Optional: update on input blur
document
  .getElementById("sponsored-products-input")
  .addEventListener("blur", (e) => {
    injectSponsoredProducts(e.target.value);
  });
// --- QA Info toggle logic ---
const qaInfoToggle = document.getElementById("qa-info-toggle");
const loggedInToggle = document.getElementById("logged-in-toggle");

function setQAInfoVisibility(visible) {
  document.querySelectorAll(".qa-info").forEach((el) => {
    el.style.visibility = visible ? "visible" : "hidden";
  });
  const infoBanner = document.getElementById("info-banner");
  if (infoBanner) {
    infoBanner.style.display = visible ? "block" : "none";
  }
}

qaInfoToggle?.addEventListener("change", (e) => {
  setQAInfoVisibility(e.target.checked);
});

// --- Logged In toggle logic ---
loggedInToggle?.addEventListener("change", (e) => {
  localStorage.setItem("logged-in", e.target.checked ? "true" : "false");
  window.location.reload();
});

// Ensure initial state: box unchecked, tags hidden
if (qaInfoToggle) qaInfoToggle.checked = false;
setQAInfoVisibility(false);
if (loggedInToggle) {
  const loggedInValue = localStorage.getItem("logged-in");
  loggedInToggle.checked = loggedInValue === "true";
}

// --- Dropdown logic ---
const propertyDropdown = document.getElementById("property-dropdown");
const localeDropdown = document.getElementById("locale-dropdown");

// Helper to parse current jamboree and locale from path
function getCurrentJamboreeAndLocale() {
  const match = window.location.pathname.match(/jamboree_(\d+)_(en|fr)\//);
  if (match) {
    return { jamboree: `jamboree_${match[1]}`, locale: match[2] };
  }
  return { jamboree: "jamboree_1", locale: "en" };
}

// Set dropdowns to current page
const { jamboree, locale } = getCurrentJamboreeAndLocale();
if (propertyDropdown && jamboree) propertyDropdown.value = jamboree;
if (localeDropdown && locale) localeDropdown.value = locale;

function goToJamboreePage(newJamboree, newLocale) {
  if (!newJamboree || !newLocale) return;
  const currentPath = window.location.pathname;
  const regex = /\/jamboree_\d+_(en|fr)\//;
  const newBase = `/${newJamboree}_${newLocale}/`;
  let newPath;
  if (regex.test(currentPath)) {
    newPath = currentPath.replace(regex, newBase);
  } else {
    newPath = newBase;
  }
  window.location.href = newPath;
}

propertyDropdown?.addEventListener("change", (e) => {
  const selectedJamboree = e.target.value;
  if (!selectedJamboree) return;
  goToJamboreePage(selectedJamboree, localeDropdown.value || locale);
});

localeDropdown?.addEventListener("change", (e) => {
  const selectedLocale = e.target.value;
  if (!selectedLocale) return;
  goToJamboreePage(propertyDropdown.value || jamboree, selectedLocale);
});

navbarContainer.style.display = "flex";
navbarContainer.style.justifyContent = "center";
navbarContainer.style.width = "100%";
navbarContainer.style.padding = "10px";
navbarContainer.style.borderBottom = "1px solid #e5e7eb";
navbarContainer.style.marginBottom = "20px";
navbarContainer.style.fontFamily = "var(--atomic-font-family)";

// Removed custom navLinks styling and event handlers
