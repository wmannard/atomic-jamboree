/**
 * Visit Reset Utility
 *
 * Detects when the tracking ID has changed between page loads and clears
 * the stored visitId to force a new analytics session. The clientId
 * (visitor/device identifier) is preserved.
 *
 * Storage keys:
 * - sessionStorage "_coveo_last_tracking_id": tracks the previously active tracking ID
 * - localStorage "visitorId": the clientId (NEVER cleared by this module)
 * - cookie "coveo_visitorId": mirrors the clientId (NEVER cleared by this module)
 */

const LAST_TRACKING_ID_KEY = "_coveo_last_tracking_id";
const VISIT_ID_KEY = "coveo_visitId";

/**
 * Checks if the tracking ID has changed since the last page load.
 * If so, clears the stored visitId from localStorage to force the
 * commerce engine to generate a fresh visit session.
 *
 * Always updates the stored tracking ID to the current value afterward.
 */
export function resetVisitIfTrackingIdChanged() {
  const storedTrackingId = sessionStorage.getItem(LAST_TRACKING_ID_KEY);
  const currentTrackingId =
    new URLSearchParams(window.location.search).get("tracking_id") ||
    "jamboree_1";

  // If a previous tracking ID exists and differs from the current one,
  // clear the visitId to force a new visit session
  if (storedTrackingId !== null && storedTrackingId !== currentTrackingId) {
    localStorage.removeItem(VISIT_ID_KEY);
  }

  // Always update the stored tracking ID to the current value
  sessionStorage.setItem(LAST_TRACKING_ID_KEY, currentTrackingId);
}
