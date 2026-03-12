import { productContext } from '@coveo/atomic';

/**
 * Custom web component to render badges for a specific badge placement ID.
 * 
 * Usage:
 * <badge-placement-condition placement-id="5a64ce85-827c-419b-be41-73bb349dd9aa">
 *   <span>Fallback content if no placement matches</span>
 * </badge-placement-condition>
 * 
 * If the placement-id matches, it will render the badges from that placement.
 * If no match, the component removes itself from the DOM.
 */
class BadgePlacementCondition extends HTMLElement {
  constructor() {
    super();
    this.product = null;
  }

  async connectedCallback() {
    try {
      // Get the product context from the parent atomic-product-template
      this.product = await productContext(this);
      this.render();
    } catch (error) {
      console.error('BadgePlacementCondition: Failed to get product context', error);
      // Remove the component if we can't get the product context
      this.remove();
    }
  }

  /**
   * Get the matching placement object
   */
  getMatchingPlacement() {
    const placementId = this.getAttribute('placement-id');
    
    if (!this.product || !placementId) {
      return null;
    }

    const badgePlacements = this.product.badgePlacements;
    
    if (!badgePlacements || !Array.isArray(badgePlacements)) {
      return null;
    }

    return badgePlacements.find(placement => placement.placementId === placementId);
  }

  /**
   * Render badges for the matching placement
   */
  renderBadges(placement) {
    const badges = placement.badges;
    
    if (!badges || !Array.isArray(badges) || badges.length === 0) {
      return;
    }

    // Clear existing content
    this.innerHTML = '';

    // Create a container for badges
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '0.5rem';

    badges.forEach(badge => {
      const badgeEl = document.createElement('span');
      badgeEl.style.backgroundColor = badge.backgroundColor || '#000';
      badgeEl.style.color = badge.textColor || '#FFF';
      badgeEl.style.padding = '0.25rem 0.5rem';
      badgeEl.style.borderRadius = '0.25rem';
      badgeEl.style.fontSize = '0.875rem';
      badgeEl.style.fontWeight = '500';
      badgeEl.style.display = 'inline-flex';
      badgeEl.style.alignItems = 'center';
      badgeEl.style.gap = '0.25rem';

      // Add icon if present
      if (badge.iconUrl) {
        const icon = document.createElement('img');
        icon.src = badge.iconUrl;
        icon.style.width = '1rem';
        icon.style.height = '1rem';
        badgeEl.appendChild(icon);
      }

      // Add text
      const text = document.createTextNode(badge.text);
      badgeEl.appendChild(text);

      container.appendChild(badgeEl);
    });

    this.appendChild(container);
  }

  render() {
    const placement = this.getMatchingPlacement();
    
    // If no matching placement, remove the component from the DOM
    if (!placement) {
      this.remove();
      return;
    }

    // Render the badges from the matching placement
    this.renderBadges(placement);
  }
}

// Register the custom element
customElements.define('badge-placement-condition', BadgePlacementCondition);
