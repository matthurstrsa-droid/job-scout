import { verifyAuth, jsonResponse, unauthorised, CORS_HEADERS } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// GET — load saved jobs from KV (syncs across devices)
export async function onRequestGet(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  try {
    const saved = await context.env.JOB_STORE.get("matt_jobs");
    if (!saved) return jsonResponse({ jobs: [], lastRun: null });
    return jsonResponse(JSON.parse(saved));
  } catch {
    return jsonResponse({ jobs: [], lastRun: null });
  }
}

// PUT — save jobs to KV
export async function onRequestPut(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  try {
    const body = await context.request.text();
    await context.env.JOB_STORE.put("matt_jobs", body, {
      expirationTtl: 60 * 60 * 24 * 30, // 30 days
    });
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
