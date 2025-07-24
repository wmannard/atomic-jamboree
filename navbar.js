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

const base = import.meta.env.BASE_URL || '/';

document.querySelector("#nav-bar").innerHTML = `
  <div id="navbar-container">
    <a href="${base}">Search</a>
    <a href="${base}listing1/">Surf Accessories</a> 
    <a href="${base}listing2/">Pants</a> 
    <a href="${base}listing3/">Towels</a>
    <a href="${base}recs1/">Recs 1</a>
    <a href="${base}recs2/">Recs 2</a>
  </div>
`;

const navbarContainer = document.querySelector("#navbar-container");
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
