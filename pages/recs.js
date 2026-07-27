import { commerceEngine } from "../engine.js";
import { initAtomicRecommendations } from "../shared/initAtomicRecommendations.js";
import { getEnvValue } from "../configHelper.js";
import { mountInfoBanner } from "../infoBanner.js";
import { getPdpHrefTemplate } from "../router.js";

export const recs1Page = {
  title: "Recs 1",
  viewUrl: import.meta.env.VITE_RECS_1_URL,
  async render(container) {
    const pdpHref = getPdpHrefTemplate();
    container.innerHTML = `
      <h2 class="text-center my-4">Recommendations</h2>
      <atomic-commerce-recommendation-interface language-assets-path="/lang">
        <atomic-commerce-layout>
          <atomic-layout-section section="main">
            <atomic-commerce-recommendation-list
              id="popular_bought"
              slot-id=""
              products-per-page="3"
            >
              <atomic-product-template>
                <template>
                  <atomic-product-section-name>
                    <atomic-product-link
                      class="font-bold"
                      href-template="${pdpHref}"
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
                    <atomic-product-field-condition if-defined="ec_brand">
                      <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
                    </atomic-product-field-condition>
                    <atomic-product-field-condition if-defined="ec_brand">
                      <atomic-product-rating field="ec_rating"></atomic-product-rating>
                    </atomic-product-field-condition>
                  </atomic-product-section-metadata>
                  <atomic-product-section-emphasized>
                    <atomic-product-price></atomic-product-price>
                  </atomic-product-section-emphasized>
                  <atomic-product-section-children>
                    <atomic-product-children></atomic-product-children>
                  </atomic-product-section-children>
                </template>
              </atomic-product-template>
            </atomic-commerce-recommendation-list>
          </atomic-layout-section>
        </atomic-commerce-layout>
      </atomic-commerce-recommendation-interface>
      <atomic-commerce-recommendation-interface language-assets-path="/lang">
        <atomic-commerce-layout>
          <atomic-layout-section section="main">
            <atomic-commerce-recommendation-list
              id="popular_viewed"
              slot-id=""
              products-per-page="3"
            >
              <atomic-product-template>
                <template>
                  <atomic-product-section-name>
                    <atomic-product-link
                      class="font-bold"
                      href-template="${pdpHref}"
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
                    <atomic-product-field-condition if-defined="ec_brand">
                      <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
                    </atomic-product-field-condition>
                    <atomic-product-field-condition if-defined="ec_brand">
                      <atomic-product-rating field="ec_rating"></atomic-product-rating>
                    </atomic-product-field-condition>
                  </atomic-product-section-metadata>
                  <atomic-product-section-emphasized>
                    <atomic-product-price></atomic-product-price>
                  </atomic-product-section-emphasized>
                  <atomic-product-section-children>
                    <atomic-product-children></atomic-product-children>
                  </atomic-product-section-children>
                </template>
              </atomic-product-template>
            </atomic-commerce-recommendation-list>
          </atomic-layout-section>
        </atomic-commerce-layout>
      </atomic-commerce-recommendation-interface>
    `;

    const boughtSlot = getEnvValue("SLOT_ID_POPULAR_BOUGHT");
    const viewedSlot = getEnvValue("SLOT_ID_POPULAR_VIEWED");

    document.getElementById("popular_bought").setAttribute("slot-id", boughtSlot);
    document.getElementById("popular_viewed").setAttribute("slot-id", viewedSlot);

    await initAtomicRecommendations(commerceEngine);
  },
};

export const recs2Page = {
  title: "Recs 2",
  viewUrl: import.meta.env.VITE_RECS_2_URL,
  async render(container) {
    const pdpHref = getPdpHrefTemplate();
    container.innerHTML = `
      <div id="info-banner"></div>
      <h2 class="text-center my-4">Cart Recommendations</h2>
      <atomic-commerce-recommendation-interface language-assets-path="/lang">
        <atomic-commerce-layout>
          <atomic-layout-section section="main">
            <atomic-commerce-recommendation-list
              id="cart_recommendations"
              slot-id=""
            >
              <atomic-product-template>
                <template>
                  <atomic-product-section-name>
                    <atomic-product-link
                      class="font-bold"
                      href-template="${pdpHref}"
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
                    <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
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
            </atomic-commerce-recommendation-list>
          </atomic-layout-section>
        </atomic-commerce-layout>
      </atomic-commerce-recommendation-interface>
    `;

    const cartSlot = getEnvValue("SLOT_ID_CART_RECOMMENDATIONS");
    document.getElementById("cart_recommendations").setAttribute("slot-id", cartSlot);

    await initAtomicRecommendations(commerceEngine);
    mountInfoBanner({ visitorPath: "/plp/accessories/towels" });
  },
};
