import { switchLocale } from "./engine.js";

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
  "Product Detail Page": {
    url: import.meta.env.VITE_PDP_URL || "https://sports.barca.group",
  },
};

document.querySelector("#nav-bar").innerHTML = `
  <div id="navbar-container" class="d-flex justify-content-center align-items-center w-100 py-2 border-bottom mb-3" style="font-family: var(--atomic-font-family);">
    <div class="dropdown me-3">
      <button class="btn btn-primary dropdown-toggle" type="button" id="pagesDropdown" data-bs-toggle="dropdown" aria-expanded="false">
        Navigation
      </button>
      <ul class="dropdown-menu" aria-labelledby="pagesDropdown">
        <li><a class="dropdown-item" href="#/">Search</a></li>
        <li><a class="dropdown-item" href="#/listing1">Surf Accessories</a></li>
        <li><a class="dropdown-item" href="#/listing2">Pants</a></li>
        <li><a class="dropdown-item" href="#/listing3">Towels</a></li>
        <li><a class="dropdown-item" href="#/recs1">Recs</a></li>
        <li><a class="dropdown-item" href="#/recs2">Cart Recs</a></li>
      </ul>
    </div>
    <span class="vr mx-4"></span>
    <span class="d-inline-flex align-items-center ms-3">
      <label for="property-dropdown" class="me-2 fs-6">Tracking ID:</label>
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
        <option value="nl">NL-NL-EUR</option>
      </select>
    </span>
    <span class="d-inline-flex align-items-center ms-3">
      <label for="sponsored-products-input" class="fs-6 me-2">Sponsored products:</label>
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

// Fixed badge config button on the left side of the screen
const badgeFab = document.createElement('div');
badgeFab.id = 'badge-fab';
badgeFab.setAttribute('role', 'button');
badgeFab.setAttribute('title', 'Badge Placements Config');
badgeFab.setAttribute('tabindex', '0');
badgeFab.setAttribute('aria-label', 'Badge placements configuration');
badgeFab.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067s-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
    <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
  </svg>
`;
Object.assign(badgeFab.style, {
  position: 'fixed',
  left: '0',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: '1050',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  color: '#fff',
  borderRadius: '0 12px 12px 0',
  cursor: 'pointer',
  boxShadow: '2px 2px 12px rgba(0,0,0,0.25)',
  transition: 'all 0.2s ease',
});
badgeFab.addEventListener('mouseenter', () => {
  badgeFab.style.width = '56px';
  badgeFab.style.boxShadow = '4px 4px 16px rgba(0,0,0,0.35)';
});
badgeFab.addEventListener('mouseleave', () => {
  badgeFab.style.width = '48px';
  badgeFab.style.boxShadow = '2px 2px 12px rgba(0,0,0,0.25)';
});
badgeFab.addEventListener('click', () => {
  const modalEl = document.getElementById('badgeConfigModal');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
});
badgeFab.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    badgeFab.click();
  }
});
document.body.appendChild(badgeFab);
// Badge Configuration Modal
const badgeModalHTML = `
<div class="modal fade" id="badgeConfigModal" tabindex="-1" aria-labelledby="badgeConfigModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content border-0 shadow">
      <div class="modal-header bg-dark text-white">
        <h5 class="modal-title" id="badgeConfigModalLabel">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-shield-check me-2" viewBox="0 0 16 16" style="vertical-align: -3px;">
            <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067s-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
            <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
          </svg>
          Badge Placement IDs
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-4">
        <p class="text-muted small mb-4">Enter placement IDs to override the default badge positions. Leave empty to use environment defaults.</p>
        <div class="row g-4">
          <!-- Search Column -->
          <div class="col-md-4">
            <div class="card h-100 border-0" style="background: #f0f4ff;">
              <div class="card-body p-3">
                <div class="d-flex align-items-center mb-3">
                  <span class="badge bg-primary rounded-pill me-2" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                  </span>
                  <h6 class="mb-0 fw-semibold">Search</h6>
                </div>
                <div class="mb-3">
                  <label for="badge-search-top-left" class="form-label small text-muted mb-1">Top-left</label>
                  <input type="text" class="form-control form-control-sm" id="badge-search-top-left" placeholder="e.g. 5a64ce85-827c-..." />
                </div>
                <div>
                  <label for="badge-search-bottom-left" class="form-label small text-muted mb-1">Bottom-left</label>
                  <input type="text" class="form-control form-control-sm" id="badge-search-bottom-left" placeholder="e.g. 5a64ce85-827c-..." />
                </div>
              </div>
            </div>
          </div>
          <!-- PLP Column -->
          <div class="col-md-4">
            <div class="card h-100 border-0" style="background: #f0faf4;">
              <div class="card-body p-3">
                <div class="d-flex align-items-center mb-3">
                  <span class="badge bg-success rounded-pill me-2" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
                    </svg>
                  </span>
                  <h6 class="mb-0 fw-semibold">PLP (Listing)</h6>
                </div>
                <div class="mb-3">
                  <label for="badge-plp-top-left" class="form-label small text-muted mb-1">Top-left</label>
                  <input type="text" class="form-control form-control-sm" id="badge-plp-top-left" placeholder="e.g. 5a64ce85-827c-..." />
                </div>
                <div>
                  <label for="badge-plp-bottom-left" class="form-label small text-muted mb-1">Bottom-left</label>
                  <input type="text" class="form-control form-control-sm" id="badge-plp-bottom-left" placeholder="e.g. 5a64ce85-827c-..." />
                </div>
              </div>
            </div>
          </div>
          <!-- PDP Column -->
          <div class="col-md-4">
            <div class="card h-100 border-0" style="background: #fff8f0;">
              <div class="card-body p-3">
                <div class="d-flex align-items-center mb-3">
                  <span class="badge bg-warning text-dark rounded-pill me-2" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                    </svg>
                  </span>
                  <h6 class="mb-0 fw-semibold">PDP</h6>
                </div>
                <div class="mb-3">
                  <label for="badge-pdp-over-image" class="form-label small text-muted mb-1">Over image</label>
                  <input type="text" class="form-control form-control-sm" id="badge-pdp-over-image" placeholder="e.g. 5a64ce85-827c-..." />
                </div>
                <div>
                  <label for="badge-pdp-under-title" class="form-label small text-muted mb-1">Under title</label>
                  <input type="text" class="form-control form-control-sm" id="badge-pdp-under-title" placeholder="e.g. 5a64ce85-827c-..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer border-0 pt-0 px-4 pb-4">
        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-outline-danger btn-sm" id="badge-config-clear">Clear All</button>
        <button type="button" class="btn btn-primary btn-sm px-4" id="badge-config-save">Save &amp; Reload</button>
      </div>
    </div>
  </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', badgeModalHTML);

const BADGE_FIELDS = [
  { id: 'badge-search-top-left', key: 'SEARCH_TOP_LEFT' },
  { id: 'badge-search-bottom-left', key: 'SEARCH_BOTTOM_LEFT' },
  { id: 'badge-plp-top-left', key: 'PLP_TOP_LEFT' },
  { id: 'badge-plp-bottom-left', key: 'PLP_BOTTOM_LEFT' },
  { id: 'badge-pdp-over-image', key: 'PDP_OVER_IMAGE' },
  { id: 'badge-pdp-under-title', key: 'PDP_UNDER_TITLE' },
];

function loadBadgeConfig() {
  let saved = {};
  const raw = localStorage.getItem('badge-placements-config');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      saved = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      console.error('Invalid badge-placements-config in localStorage; clearing it.', e);
      localStorage.removeItem('badge-placements-config');
      saved = {};
    }
  }
  BADGE_FIELDS.forEach(({ id, key }) => {
    const input = document.getElementById(id);
    if (input) input.value = saved[key] || '';
  });
}

function saveBadgeConfig() {
  const config = {};
  BADGE_FIELDS.forEach(({ id, key }) => {
    const val = document.getElementById(id)?.value.trim();
    if (val) config[key] = val;
  });
  localStorage.setItem('badge-placements-config', JSON.stringify(config));
  window.location.reload();
}

function clearBadgeConfig() {
  localStorage.removeItem('badge-placements-config');
  BADGE_FIELDS.forEach(({ id }) => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  window.location.reload();
}

document.getElementById('badge-config-save')?.addEventListener('click', saveBadgeConfig);
document.getElementById('badge-config-clear')?.addEventListener('click', clearBadgeConfig);

// Load saved values when modal opens
document.getElementById('badgeConfigModal')?.addEventListener('show.bs.modal', loadBadgeConfig);

// Highlight the current page in the dropdown.
// Accepts the rendered route path (e.g. "/", "/listing1") so that it works
// even when Coveo has overwritten the hash with search state parameters.
export function updateNavHighlight(routePath) {
  const matchHash = routePath ? `#${routePath}` : (window.location.hash || "#/");
  let currentItemText = "Navigation";
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    const href = item.getAttribute("href");
    if (href === matchHash || (href === "#/" && matchHash === "#/")) {
      item.classList.add("active");
      item.setAttribute("aria-current", "page");
      currentItemText = item.textContent;
    } else {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    }
  });
  document.getElementById("pagesDropdown").innerText = currentItemText;
}

// Run on initial load
updateNavHighlight();

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
  const match = window.location.pathname.match(/jamboree_(\d+)_(en|fr|nl)\//);
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
  const regex = /\/jamboree_\d+_(en|fr|nl)\//;
  const newBase = `/${newJamboree}_${newLocale}/`;
  let newPath;
  if (regex.test(currentPath)) {
    newPath = currentPath.replace(regex, newBase);
  } else {
    newPath = newBase;
  }
  // Preserve query params and hash
  window.location.href = newPath + window.location.search + window.location.hash;
}

propertyDropdown?.addEventListener("change", (e) => {
  const selectedJamboree = e.target.value;
  if (!selectedJamboree) return;
  goToJamboreePage(selectedJamboree, localeDropdown.value || locale);
});

localeDropdown?.addEventListener("change", (e) => {
  const selectedLocale = e.target.value;
  if (!selectedLocale) return;

  // Update the URL to reflect the new locale
  const currentPath = window.location.pathname;
  const regex = /\/jamboree_(\d+)_(en|fr|nl)\//;
  const match = currentPath.match(regex);

  // PDP doesn't use atomic-commerce-interface, so a locale switch requires a reload
  const isOnPdp = window.location.hash.includes("/pdp");
  if (isOnPdp && match) {
    const newPath = currentPath.replace(regex, `/jamboree_${match[1]}_${selectedLocale}/`);
    window.location.href = newPath + window.location.hash;
    return;
  }

  // Switch locale in-place without page reload (works for search/listing/recs)
  switchLocale(selectedLocale);

  if (match) {
    const newPath = currentPath.replace(regex, `/jamboree_${match[1]}_${selectedLocale}/`);
    history.replaceState(null, "", newPath + window.location.search + window.location.hash);
  }
});

navbarContainer.style.display = "flex";
navbarContainer.style.justifyContent = "center";
navbarContainer.style.width = "100%";
navbarContainer.style.padding = "10px";
navbarContainer.style.borderBottom = "1px solid #e5e7eb";
navbarContainer.style.marginBottom = "20px";
navbarContainer.style.fontFamily = "var(--atomic-font-family)";

// Removed custom navLinks styling and event handlers
