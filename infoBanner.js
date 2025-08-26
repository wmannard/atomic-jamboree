export function renderInfoBanner({ visitorPath }) {
  // Get current page URL without params/fragments
  const referrerUrl = window.location.origin + window.location.pathname;

  // Create banner HTML
  return `
    <div
      class="alert alert-info alert-dismissible fade show"
      role="alert"
      style="font-family: Arial, sans-serif; font-size: 14px; width: 75%; margin: 0 auto;"
    >
      <strong>Visitor URL:</strong> https://sports-dev.barca.group${visitorPath}<br />
      <strong>Referrer URL:</strong> <span id="referrer-url">${referrerUrl}</span>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      ></button>
    </div>
  `;
}

export function mountInfoBanner({ visitorPath }, mountSelector = "body") {
  const mountEl = document.querySelector(mountSelector);
  if (!mountEl) return;
  // Insert banner at the top of the mount element
  mountEl.insertAdjacentHTML("afterbegin", renderInfoBanner({ visitorPath }));
}
