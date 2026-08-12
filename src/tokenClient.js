/**
 * Client-side token fetch module.
 * Fetches search tokens from the server-side /api/token endpoint.
 * Retries once after 1 second on failure.
 */

/**
 * Fetch a search token from the token service.
 * @returns {Promise<string>} The search token JWT (ey... format)
 */
export async function fetchToken() {
  try {
    return await doFetch();
  } catch {
    // Retry once after 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return doFetch();
  }
}

async function doFetch() {
  const res = await fetch("/api/token", {
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Token fetch failed: ${res.status}`);
  }

  const { token } = await res.json();
  return token;
}
