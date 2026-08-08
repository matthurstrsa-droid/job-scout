import { MATT_PROFILE, verifyAuth, jsonResponse, unauthorised, callAnthropic, extractText, CORS_HEADERS } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const { title, company, summary } = await context.request.json();

  const data = await callAnthropic(context.env, {
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: `You score jobs for Matt Hurst based on his priorities.
${MATT_PROFILE}
Return ONLY a valid JSON object with exactly these fields, no markdown:
{"scores":{"flexibility_score":0-100,"autonomy_score":0-100,"culture_score":0-100,"salary_score":0-100}}
Score honestly. Flexibility is most important to Matt.`,
    messages: [{
      role: "user",
      content: `Score this job for Matt:\nTitle: ${title}\nCompany: ${company}\nDescription: ${summary || "Not provided"}`,
    }],
  });

  const raw = extractText(data);
  try {
    const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const s = clean.indexOf("{"), e = clean.lastIndexOf("}") + 1;
    const parsed = JSON.parse(clean.slice(s, e));
    return jsonResponse(parsed);
  } catch {
    return jsonResponse({ scores: { flexibility_score: 50, autonomy_score: 50, culture_score: 50, salary_score: 50 } });
  }
}
