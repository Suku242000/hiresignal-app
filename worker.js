const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: CORS });
    if (request.method !== "POST")
      return new Response(JSON.stringify({ status: "HireSignal Worker live" }), {
        status: 200, headers: { ...CORS, "Content-Type": "application/json" }
      });
    try {
      const { provider, apiKey, payload } = await request.json();
      const key = apiKey || env.GEMINI_API_KEY;
      if (!key) return new Response(JSON.stringify({ error: "No API key" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" }
      });
      let url, headers;
      if (provider === "anthropic") {
        url = "https://api.anthropic.com/v1/messages";
        headers = { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };
      } else {
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        headers = { "Content-Type": "application/json" };
      }
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status, headers: { ...CORS, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }
  }
};
