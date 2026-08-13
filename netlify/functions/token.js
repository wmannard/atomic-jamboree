// Netlify Functions v2 — serverless token endpoint.
// Mirrors the Vite dev plugin behavior in production.

import { generateToken } from "../../server/token.js";

export default async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await generateToken(process.env);

  return new Response(
    JSON.stringify(result.ok ? { token: result.token } : { error: result.error }),
    {
      status: result.ok ? 200 : result.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
};

export const config = { path: "/api/token" };
