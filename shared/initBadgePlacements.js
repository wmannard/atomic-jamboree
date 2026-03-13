import { getEnvValue } from '../configHelper.js';

/**
 * Initialize global badge placement IDs
 * @param {Object} placements - Key-value pairs of placement names and their env variable names
 */
export function initBadgePlacements(placements) {
  window.BADGE_PLACEMENTS = {};
  const overrides = JSON.parse(localStorage.getItem('badge-placements-config') || '{}');

  for (const [key, envVar] of Object.entries(placements)) {
    window.BADGE_PLACEMENTS[key] = overrides[key] || getEnvValue(envVar);
  }
}

// Predefined placement configurations for common use cases
export const PLACEMENT_CONFIGS = {
  PLP: {
    PLP_TOP_LEFT: 'BADGE_PLACEMENT__PLP__TOP_LEFT',
    PLP_BOTTOM_LEFT: 'BADGE_PLACEMENT__PLP__BOTTOM_LEFT',
  },
  SEARCH: {
    SEARCH_TOP_LEFT: 'BADGE_PLACEMENT__SEARCH__TOP_LEFT',
    SEARCH_BOTTOM_LEFT: 'BADGE_PLACEMENT__SEARCH__BOTTOM_LEFT',
  },
  PDP: {
    PDP_OVER_IMAGE: 'BADGE_PLACEMENT__PDP__OVER_IMAGE',
    PDP_UNDER_TITLE: 'BADGE_PLACEMENT__PDP__UNDER_TITLE',
  },
};
