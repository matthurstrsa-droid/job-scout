import { verifyAuth, unauthorised, CORS_HEADERS } from "../_shared.js";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// GET /api/cv?jobId=xxx — retrieve CV metadata for a job
export async function onRequestGet(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const url = new URL(context.request.url);
  const jobId = url.searchParams.get("jobId");
  if (!jobId) return jsonResponse({ error: "jobId required" }, 400);

  try {
    const meta = await context.env.JOB_STORE.get(`cv_meta:${jobId}`);
    if (!meta) return jsonResponse({ exists: false });
    return jsonResponse({ exists: true, ...JSON.parse(meta) });
  } catch {
    return jsonResponse({ exists: false });
  }
}

// POST /api/cv — upload a CV file for a job
// Body: { jobId, filename, data (base64), mimeType }
export async function onRequestPost(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  try {
    const { jobId, filename, data, mimeType } = await context.request.json();
    if (!jobId || !data) return jsonResponse({ error: "jobId and data required" }, 400);

    // Store file data
    await context.env.JOB_STORE.put(`cv_data:${jobId}`, data, {
      expirationTtl: 60 * 60 * 24 * 180, // 6 months
    });

    // Store metadata separately
    const meta = { filename, mimeType, uploadedAt: new Date().toISOString(), size: data.length };
    await context.env.JOB_STORE.put(`cv_meta:${jobId}`, JSON.stringify(meta), {
      expirationTtl: 60 * 60 * 24 * 180,
    });

    return jsonResponse({ ok: true, ...meta });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// DELETE /api/cv?jobId=xxx — remove a CV
export async function onRequestDelete(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const url = new URL(context.request.url);
  const jobId = url.searchParams.get("jobId");
  if (!jobId) return jsonResponse({ error: "jobId required" }, 400);

  try {
    await context.env.JOB_STORE.delete(`cv_data:${jobId}`);
    await context.env.JOB_STORE.delete(`cv_meta:${jobId}`);
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}
