import { commerceEngine } from "../engine.js";
import { initAtomicCommerce } from "../shared/initAtomicCommerce.js";
import { initBadgePlacements, PLACEMENT_CONFIGS } from "../shared/initBadgePlacements.js";
import { mountInfoBanner } from "../infoBanner.js";

/**
 * Factory to create listing page configs.
 * Each listing differs in: title, heading, display mode, density, image size,
 * pagination style, visitor path, and view URL.
 */
function createListingPage({ title, heading, viewUrl, visitorPath, display, density, imageSize, paginationHTML }) {
  return {
    title,
    viewUrl,
    async render(container) {
      container.innerHTML = `
        <div id="info-banner"></div>
        <h2 class="text-center my-4">${heading}</h2>
        <atomic-commerce-interface
          type="product-listing"
          fields-to-include='["badgePlacements"]'
        >
          <atomic-commerce-layout>
            <atomic-layout-section section="search">
              <atomic-commerce-search-box redirection-url="#/">
                <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
                <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
                <atomic-commerce-search-box-instant-products image-size="small">
                  <atomic-product-template>
                    <template>
                      <atomic-product-section-name>
                        <atomic-product-link
                          class="font-bold"
                          href-template="#/pdp?$\{permanentid}"
                        ></atomic-product-link>
                      </atomic-product-section-name>
                      <atomic-product-section-visual>
                        <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                      </atomic-product-section-visual>
                      <atomic-product-section-metadata>
                        <atomic-product-field-condition must-match-query-pinned="true">
                          <span class="text-2xl">💵</span>
                          <span class="font-bold">Sponsored Product</span>
                        </atomic-product-field-condition>
                        <atomic-product-text field="ec_brand" class="block text-neutral-dark"></atomic-product-text>
                        <atomic-product-rating field="ec_rating"></atomic-product-rating>
                      </atomic-product-section-metadata>
                      <atomic-product-section-emphasized>
                        <atomic-product-price currency="USD"></atomic-product-price>
                      </atomic-product-section-emphasized>
                      <atomic-product-section-children>
                        <atomic-product-children></atomic-product-children>
                      </atomic-product-section-children>
                    </template>
                  </atomic-product-template>
                </atomic-commerce-search-box-instant-products>
              </atomic-commerce-search-box>
            </atomic-layout-section>
            <atomic-layout-section section="facets">
              <atomic-commerce-facets></atomic-commerce-facets>
            </atomic-layout-section>
            <atomic-layout-section section="main">
              <atomic-layout-section section="status">
                <atomic-commerce-breadbox></atomic-commerce-breadbox>
                <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
                <atomic-commerce-query-summary></atomic-commerce-query-summary>
                <atomic-commerce-refine-toggle></atomic-commerce-refine-toggle>
              </atomic-layout-section>
              <atomic-layout-section section="products">
                ${getProductListHTML(display, density, imageSize)}
                <atomic-commerce-query-error></atomic-commerce-query-error>
                <atomic-commerce-no-products></atomic-commerce-no-products>
              </atomic-layout-section>
              <atomic-layout-section section="pagination">
                ${paginationHTML}
              </atomic-layout-section>
            </atomic-layout-section>
          </atomic-commerce-layout>
        </atomic-commerce-interface>
      `;

      await initAtomicCommerce(commerceEngine);
      initBadgePlacements(PLACEMENT_CONFIGS.PLP);
      mountInfoBanner({ visitorPath });
    },
  };
}

function getProductListHTML(display, density, imageSize) {
  if (display === "table") {
    return `
      <atomic-commerce-product-list display="table" density="${density}" image-size="${imageSize}">
        <atomic-product-template>
          <template>
            <atomic-table-element label="Image">
              <atomic-product-image field="ec_thumbnails"></atomic-product-image>
            </atomic-table-element>
            <atomic-table-element label="Name">
              <badge-placement data-placement-key="PLP_TOP_LEFT"></badge-placement>
              <atomic-product-field-condition must-match-query-pinned="true">
                <span>💵</span>
                <span class="font-bold text-sm">Sponsored Product</span>
              </atomic-product-field-condition>
              <br />
              <atomic-product-link
                class="font-bold"
                href-template="#/pdp?$\{permanentid}"
              ></atomic-product-link>
            </atomic-table-element>
            <atomic-table-element label="Brand">
              <atomic-product-text field="ec_brand"></atomic-product-text>
            </atomic-table-element>
            <atomic-table-element label="Rating">
              <atomic-product-rating field="ec_rating"></atomic-product-rating>
            </atomic-table-element>
            <atomic-table-element label="Price">
              <atomic-product-price currency="USD"></atomic-product-price>
            </atomic-table-element>
            <atomic-table-element label="Description">
              <badge-placement data-placement-key="PLP_BOTTOM_LEFT"></badge-placement>
              <atomic-product-description></atomic-product-description>
            </atomic-table-element>
          </template>
        </atomic-product-template>
      </atomic-commerce-product-list>
    `;
  }

  return `
    <atomic-commerce-product-list
      display="${display}"
      density="${density}"
      image-size="${imageSize}"
    >
      <atomic-product-template>
        <template>
          <atomic-product-section-name>
            <badge-placement data-placement-key="PLP_TOP_LEFT"></badge-placement>
            <atomic-product-link
              class="font-bold"
              href-template="#/pdp?$\{permanentid}"
            ></atomic-product-link>
          </atomic-product-section-name>
          <atomic-product-section-visual>
            <atomic-product-image field="ec_thumbnails"></atomic-product-image>
          </atomic-product-section-visual>
          <atomic-product-section-children>
            <badge-placement data-placement-key="PLP_BOTTOM_LEFT"></badge-placement>
            <atomic-product-children></atomic-product-children>
          </atomic-product-section-children>
          <atomic-product-section-metadata>
            <atomic-product-field-condition must-match-query-pinned="true">
              <span class="text-2xl">💵</span>
              <span class="font-bold">Sponsored Product</span>
            </atomic-product-field-condition>
            <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
            <atomic-product-rating field="ec_rating"></atomic-product-rating>
          </atomic-product-section-metadata>
          <atomic-product-section-emphasized>
            <atomic-product-price class="text-2xl" currency="USD"></atomic-product-price>
          </atomic-product-section-emphasized>
          <atomic-product-section-description>
            <atomic-product-description></atomic-product-description>
          </atomic-product-section-description>
        </template>
      </atomic-product-template>
    </atomic-commerce-product-list>
  `;
}

export const listing1Page = createListingPage({
  title: "Listing 1",
  heading: "Surf Accessories",
  viewUrl: import.meta.env.VITE_LISTING_1_URL,
  visitorPath: "/plp/accessories/surf-accessories",
  display: "list",
  density: "comfortable",
  imageSize: "small",
  paginationHTML: `
    <atomic-commerce-pager></atomic-commerce-pager>
    <atomic-commerce-products-per-page
      initialChoice="10"
      choices-displayed="5,10,20"
    ></atomic-commerce-products-per-page>
  `,
});

export const listing2Page = createListingPage({
  title: "Listing 2",
  heading: "Pants",
  viewUrl: import.meta.env.VITE_LISTING_2_URL,
  visitorPath: "/plp/clothing/pants",
  display: "grid",
  density: "normal",
  imageSize: "small",
  paginationHTML: `<atomic-commerce-load-more-products></atomic-commerce-load-more-products>`,
});

export const listing3Page = createListingPage({
  title: "Listing 3",
  heading: "Towels",
  viewUrl: import.meta.env.VITE_LISTING_3_URL,
  visitorPath: "/plp/accessories/towels",
  display: "table",
  density: "compact",
  imageSize: "icon",
  paginationHTML: `<atomic-commerce-load-more-products></atomic-commerce-load-more-products>`,
});
