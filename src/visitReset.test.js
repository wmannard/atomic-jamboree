import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { fc } from "./test-helpers/fc-setup.js";
import { resetVisitIfTrackingIdChanged } from "./visitReset.js";

/**
 * Bug Condition Exploration Test — Property 1
 *
 * Validates: Requirements 1.1, 1.2, 2.1, 2.2
 *
 * Bug Condition: When previousTrackingId IS NOT NULL
 *   AND previousTrackingId != currentTrackingId
 *   AND storedVisitIdExists()
 *
 * Expected Behavior: After the visit reset logic executes,
 *   the stored visitId MUST be cleared (or differ from the previous visitId),
 *   AND the clientId MUST remain unchanged.
 *
 * This test is written BEFORE the fix. It MUST FAIL on unfixed code
 * because no detection/clearing logic exists yet.
 */

// Storage keys used by Coveo headless and our visit reset logic
const LAST_TRACKING_ID_KEY = "_coveo_last_tracking_id";
const VISIT_ID_KEY = "coveo_visitId"; // visitId storage key
const CLIENT_ID_KEY = "visitorId"; // clientId (persistent visitor identifier, per @coveo/relay)

describe("Bug Condition: Visit ID persists across tracking ID switch", () => {
  beforeEach(() => {
    // Clear all storage before each test
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  /**
   * **Validates: Requirements 1.1, 1.2, 2.1, 2.2**
   *
   * Property: For all inputs satisfying the bug condition (tracking ID changed
   * and a visitId exists), after the visit reset logic runs, the visitId MUST
   * be cleared from storage AND the clientId MUST remain unchanged.
   */
  it("should clear visitId when tracking ID changes (property-based)", () => {
    // Generator: pairs of distinct tracking IDs (jamboree_N where N ∈ 1..9)
    const trackingIdArb = fc.integer({ min: 1, max: 9 }).map((n) => `jamboree_${n}`);

    // Generator: arbitrary visitId UUIDs
    const visitIdArb = fc.uuid();

    // Generator: arbitrary clientId UUIDs (must be preserved)
    const clientIdArb = fc.uuid();

    fc.assert(
      fc.property(
        trackingIdArb,
        trackingIdArb,
        visitIdArb,
        clientIdArb,
        (previousTrackingId, currentTrackingId, storedVisitId, storedClientId) => {
          // Pre-condition: tracking IDs must be different (bug condition)
          fc.pre(previousTrackingId !== currentTrackingId);

          // --- Setup: simulate stored state from previous page load ---
          // Store the previous tracking ID (as if goToJamboreePage stored it)
          sessionStorage.setItem(LAST_TRACKING_ID_KEY, previousTrackingId);

          // Store a visitId (as if Coveo headless had created a visit session)
          localStorage.setItem(VISIT_ID_KEY, storedVisitId);

          // Store a clientId (persistent visitor identifier — must be preserved)
          localStorage.setItem(CLIENT_ID_KEY, storedClientId);

          // --- Act: run the visit reset detection logic ---
          // Import and call resetVisitIfTrackingIdChanged with the new tracking ID
          // Since this function doesn't exist yet, we simulate what it SHOULD do:
          // Read stored tracking ID, compare with current, clear visitId if different.
          //
          // On UNFIXED code, no such logic exists, so we just check the state directly.
          // The test asserts the EXPECTED behavior — it will fail on unfixed code.
          runVisitResetLogic(currentTrackingId);

          // --- Assert: visitId MUST be cleared (or differ) ---
          const visitIdAfter = localStorage.getItem(VISIT_ID_KEY);
          const visitIdCleared = visitIdAfter === null || visitIdAfter !== storedVisitId;

          // --- Assert: clientId MUST remain unchanged ---
          const clientIdAfter = localStorage.getItem(CLIENT_ID_KEY);
          const clientIdPreserved = clientIdAfter === storedClientId;

          expect(visitIdCleared).toBe(true);
          expect(clientIdPreserved).toBe(true);

          // Cleanup for next iteration
          sessionStorage.clear();
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Calls the visit reset logic with the given tracking ID set as the URL param.
 * Mocks window.location.search to simulate the current URL having the tracking_id param.
 */
function runVisitResetLogic(currentTrackingId) {
  // Mock the URL search params to simulate the current tracking ID in the URL
  const url = new URL(`http://localhost?tracking_id=${currentTrackingId}`);
  vi.stubGlobal("location", {
    ...window.location,
    search: url.search,
    href: url.href,
  });

  resetVisitIfTrackingIdChanged();

  vi.unstubAllGlobals();
}
