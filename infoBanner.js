export function renderInfoBanner({ visitorPath }) {
  const referrerUrl = window.location.origin + window.location.pathname;
  return `
    <div
      class="alert alert-info alert-dismissible fade show"
      role="alert"
      style="font-family: Arial, sans-serif; font-size: 14px; width: 75%; margin: 0 auto;"
    >
      <strong>Visitor URL:</strong> https://sports-dev.barca.group${visitorPath} | 
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

export function mountInfoBanner(
  { visitorPath },
  mountSelector = "#info-banner"
) {
  const mountEl = document.querySelector(mountSelector);
  if (!mountEl) return;
  mountEl.innerHTML = renderInfoBanner({ visitorPath });
}

// Auto-mount banner when module is loaded (customize visitorPath as needed)
const defaultVisitorPath = "/plp/accessories/surf-accessories";
mountInfoBanner({ visitorPath: defaultVisitorPath });
