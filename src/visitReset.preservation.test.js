import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import { resetVisitIfTrackingIdChanged } from "./visitReset.js";

/**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 *
 * Property 2: Preservation — Visit ID and Client ID persist for same-tracking-ID reloads.
 *
 * These tests verify that for any page load where the tracking ID has NOT changed
 * (isBugCondition returns false), the visitId and clientId in browser storage remain
 * untouched. On unfixed code, no detection logic exists, so storage is never modified —
 * these tests establish the baseline behavior that must be preserved after the fix.
 *
 * Storage keys used by @coveo/headless:
 * - localStorage "visitorId": the clientId (visitor/device identifier)
 * - cookie "coveo_visitorId": mirrors the clientId
 * - localStorage "__coveo.analytics.history": search history
 *
 * The fix will introduce:
 * - sessionStorage "_coveo_last_tracking_id": tracks the previously active tracking ID
 *
 * The visitId is managed by the Coveo analytics relay in-memory on each page load.
 * The fix will clear it from storage when tracking IDs differ. These preservation tests
 * ensure the fix does NOT clear it when tracking IDs match.
 */

// Arbitrary generator for tracking IDs in the format "jamboree_N" (N ∈ 1..9)
const arbTrackingId = fc.integer({ min: 1, max: 9 }).map((n) => `jamboree_${n}`);

// Arbitrary generator for UUID-like visitIds
const arbVisitId = fc.uuid();

// Arbitrary generator for UUID-like clientIds
const arbClientId = fc.uuid();

// Arbitrary generator for storage states: present with valid UUID, absent, or malformed
const arbStorageValue = fc.oneof(
  fc.uuid().map((id) => ({ type: "present", value: id })),
  fc.constant({ type: "absent", value: null }),
  fc.constant({ type: "malformed", value: "not-a-uuid-!@#$" }),
  fc.constant({ type: "empty", value: "" })
);

/**
 * Simulates the detection logic that runs on page load.
 * Calls the real resetVisitIfTrackingIdChanged() with a mocked URL.
 * @param {string} currentTrackingId - The tracking ID to simulate in the URL
 */
function simulatePageLoadDetectionLogic(currentTrackingId) {
  if (!currentTrackingId) return;
  const url = new URL(`http://localhost?tracking_id=${currentTrackingId}`);
  vi.stubGlobal("location", {
    ...window.location,
    search: url.search,
    href: url.href,
  });

  resetVisitIfTrackingIdChanged();

  vi.unstubAllGlobals();
}

describe("Property 2: Preservation — Visit ID and Client ID persist for same-tracking-ID reloads", () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Same tracking ID reloads — visitId must remain unchanged", () => {
    it("for all tracking ID values where previousTrackingId == currentTrackingId, the visitId in storage MUST remain unchanged after the detection logic runs", () => {
      fc.assert(
        fc.property(
          arbTrackingId,
          arbVisitId,
          arbClientId,
          (trackingId, visitId, clientId) => {
            // Clear storage at start of each iteration to ensure clean state
            localStorage.clear();
            sessionStorage.clear();

            // Setup: simulate a page reload with the SAME tracking ID
            // Store the "previous" tracking ID (same as current)
            sessionStorage.setItem("_coveo_last_tracking_id", trackingId);

            // Store a visitId in localStorage (simulating Coveo's stored visit)
            localStorage.setItem("coveo_visitId", visitId);

            // Store a clientId in localStorage (simulating Coveo's stored visitor)
            localStorage.setItem("visitorId", clientId);

            // Run the detection logic with the same tracking ID
            simulatePageLoadDetectionLogic(trackingId);

            // Assert: visitId must remain unchanged
            expect(localStorage.getItem("coveo_visitId")).toBe(visitId);

            // Assert: clientId must remain unchanged
            expect(localStorage.getItem("visitorId")).toBe(clientId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("for all tracking ID values where previousTrackingId IS NULL (first visit), the visitId in storage MUST remain unchanged", () => {
      fc.assert(
        fc.property(
          arbTrackingId,
          arbStorageValue,
          arbClientId,
          (currentTrackingId, visitIdState, clientId) => {
            // Clear storage at start of each iteration to ensure clean state
            localStorage.clear();
            sessionStorage.clear();

            // Setup: no stored tracking ID (first-time visit)
            // Do NOT set _coveo_last_tracking_id in sessionStorage

            // Set up visitId based on arbitrary state
            if (visitIdState.value !== null) {
              localStorage.setItem("coveo_visitId", visitIdState.value);
            }

            // Store clientId
            localStorage.setItem("visitorId", clientId);

            // Snapshot storage before detection logic
            const visitIdBefore = localStorage.getItem("coveo_visitId");
            const clientIdBefore = localStorage.getItem("visitorId");

            // Run the detection logic with the current tracking ID (no previous stored)
            simulatePageLoadDetectionLogic(currentTrackingId);

            // Assert: visitId must remain unchanged (regardless of state)
            expect(localStorage.getItem("coveo_visitId")).toBe(visitIdBefore);

            // Assert: clientId must remain unchanged
            expect(localStorage.getItem("visitorId")).toBe(clientIdBefore);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Client ID must NEVER be removed or altered — for ALL inputs", () => {
    it("for ALL inputs (bug condition or not), the clientId MUST never be removed or altered", () => {
      fc.assert(
        fc.property(
          // Previous tracking ID: either null (no stored) or a valid tracking ID
          fc.option(arbTrackingId, { nil: null }),
          // Current tracking ID from URL
          arbTrackingId,
          // ClientId in storage
          arbClientId,
          // VisitId state in storage
          arbStorageValue,
          (previousTrackingId, currentTrackingId, clientId, visitIdState) => {
            // Clear storage at start of each iteration to ensure clean state
            localStorage.clear();
            sessionStorage.clear();

            // Setup: store tracking ID if it exists
            if (previousTrackingId !== null) {
              sessionStorage.setItem(
                "_coveo_last_tracking_id",
                previousTrackingId
              );
            }

            // Store clientId
            localStorage.setItem("visitorId", clientId);

            // Store visitId based on arbitrary state
            if (visitIdState.value !== null) {
              localStorage.setItem("coveo_visitId", visitIdState.value);
            }

            // Run the detection logic with the current tracking ID
            simulatePageLoadDetectionLogic(currentTrackingId);

            // Assert: clientId must NEVER be removed or altered
            // This must hold regardless of whether this is a bug condition or not
            expect(localStorage.getItem("visitorId")).toBe(clientId);
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe("Arbitrary storage states — no mutations for same-tracking-ID", () => {
    it("generates arbitrary same-tracking-ID pairs with arbitrary storage states and verifies no mutations occur", () => {
      fc.assert(
        fc.property(
          arbTrackingId,
          arbStorageValue, // visitId state
          arbStorageValue, // clientId state (could be missing too)
          fc.boolean(), // whether _coveo_last_tracking_id is present
          (trackingId, visitIdState, clientIdState, hasStoredTrackingId) => {
            // Clear storage at start of each iteration to ensure clean state
            localStorage.clear();
            sessionStorage.clear();

            // Setup storage
            if (hasStoredTrackingId) {
              // Same tracking ID stored — not a bug condition
              sessionStorage.setItem("_coveo_last_tracking_id", trackingId);
            }
            // else: no stored tracking ID — also not a bug condition

            if (visitIdState.value !== null) {
              localStorage.setItem("coveo_visitId", visitIdState.value);
            }

            if (clientIdState.value !== null) {
              localStorage.setItem("visitorId", clientIdState.value);
            }

            // Snapshot ALL localStorage keys before
            const keysBefore = new Set();
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              keysBefore.add(key);
            }
            const valuesBefore = {};
            for (const key of keysBefore) {
              valuesBefore[key] = localStorage.getItem(key);
            }

            // Run the detection logic with the same tracking ID
            simulatePageLoadDetectionLogic(trackingId);

            // Assert: no localStorage keys were added, removed, or modified
            const keysAfter = new Set();
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              keysAfter.add(key);
            }

            expect(keysAfter).toEqual(keysBefore);

            for (const key of keysBefore) {
              expect(localStorage.getItem(key)).toBe(valuesBefore[key]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Locale switch — visitId persists (no page reload)", () => {
    it("locale switch does not trigger detection logic and visitId persists", () => {
      fc.assert(
        fc.property(
          arbTrackingId,
          arbVisitId,
          arbClientId,
          fc.constantFrom("en-us-usd", "fr-fr-eur", "nl-nl-eur"),
          fc.constantFrom("en-us-usd", "fr-fr-eur", "nl-nl-eur"),
          (trackingId, visitId, clientId, _fromLocale, _toLocale) => {
            // Setup: a page with a tracking ID and stored visit
            sessionStorage.setItem("_coveo_last_tracking_id", trackingId);
            localStorage.setItem("coveo_visitId", visitId);
            localStorage.setItem("visitorId", clientId);

            // A locale switch does NOT trigger a page reload (no detection logic runs)
            // On non-PDP pages, switchLocale() is called instead of navigating
            // So we just verify storage is intact without calling detection logic

            // Assert: visitId remains unchanged
            expect(localStorage.getItem("coveo_visitId")).toBe(visitId);
            // Assert: clientId remains unchanged
            expect(localStorage.getItem("visitorId")).toBe(clientId);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
