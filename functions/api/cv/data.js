import { verifyAuth, unauthorised, CORS_HEADERS } from "../../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const url = new URL(context.request.url);
  const jobId = url.searchParams.get("jobId");
  if (!jobId) return new Response(JSON.stringify({ error: "jobId required" }), { status: 400, headers: CORS_HEADERS });

  try {
    const data = await context.env.JOB_STORE.get(`cv_data:${jobId}`);
    if (!data) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    return new Response(JSON.stringify({ data }), { headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }
}
