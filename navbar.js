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
  <div id="navbar-container">
    <a href="${base}">Search</a>
    <a href="${base}listing1/">Surf Accessories</a> 
    <a href="${base}listing2/">Pants</a> 
    <a href="${base}listing3/">Towels</a>
    <a href="${base}recs1/">Recs</a>
    <a href="${base}recs2/">Cart Recs</a>
    <span style="display:inline-block;width:1px;height:32px;background:#ccc;margin:0 20px;vertical-align:middle;"></span>
    <span style="display:inline-flex;align-items:center;margin-left:24px;">
      <label for="property-dropdown" style="font-size:16px;">Property:</label>
      <select id="property-dropdown" style="margin-left:6px;font-size:16px;padding:6px 12px;">
        ${Array.from(
          { length: 9 },
          (_, i) =>
            `<option value=\"jamboree_${i + 1}\">jamboree_${i + 1}</option>`
        ).join("")}
      </select>
    </span>
    <span style="display:inline-flex;align-items:center;margin-left:18px;">
      <label for="locale-dropdown" style="font-size:16px;">Locale:</label>
      <select id="locale-dropdown" style="margin-left:6px;font-size:16px;padding:6px 12px;">
        <option value="en">EN-US-USD</option>
        <option value="fr">FR-FR-EUR</option>
      </select>
    </span>
  </div>
`;

const navbarContainer = document.querySelector("#navbar-container");
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

const navLinks = navbarContainer.querySelectorAll("a");
navLinks.forEach((link) => {
  link.style.textDecoration = "none";
  link.style.color = "#333";
  link.style.fontSize = "24px";
  link.style.padding = "8px 16px";
  link.style.display = "inline-block";
  link.style.transition = "background-color 0.3s, color 0.3s";

  link.addEventListener("mouseover", () => {
    link.style.color = "#f05245";
  });

  link.addEventListener("mouseout", () => {
    if (link !== document.querySelector(".active")) {
      link.style.color = "#333";
    }
  });

  if (window.location.pathname === link.getAttribute("href")) {
    link.classList.add("active");
    link.style.color = "#f05245";
  }
});
