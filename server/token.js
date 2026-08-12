// Shared Coveo search-token generation logic.
// Used by both the Vite dev plugin and the Netlify serverless function.
// No framework dependencies — pure ES module with fetch.

const ORG_ID = "jamboreextqcrdy3";
const TOKEN_ENDPOINT = `https://platformdev.cloud.coveo.com/rest/search/v2/token?organizationId=${ORG_ID}`;

/**
 * Generate a short-lived anonymous Coveo search token.
 * @param {Record<string, string|undefined>} env - Environment variables (process.env or Vite loadEnv output)
 * @returns {Promise<{ok: true, token: string} | {ok: false, status: number, error: string}>}
 */
export async function generateToken(env) {
  const apiKey = env.COVEO_API_KEY;

  if (!apiKey) {
    return { ok: false, status: 500, error: "Missing COVEO_API_KEY" };
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userIds: [{ name: "anonymous", provider: "Email Security Provider" }],
        allowedDictionaryFieldKeys: {
          ec_name: ["*"],
          ec_description: ["*"],
          ec_colors: ["*"],
          ec_price: ["*"],
          ec_promo_price: ["*"],
          cat_material: ["*"],
          multilingualbody: ["*"],
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `Token request failed: ${response.status}`,
      };
    }

    const { token } = await response.json();
    return { ok: true, token };
  } catch (err) {
    if (err.name === "TimeoutError") {
      return { ok: false, status: 500, error: "Token request timed out" };
    }
    console.error("[coveo-token]", err);
    return { ok: false, status: 500, error: "Internal server error" };
  }
}
