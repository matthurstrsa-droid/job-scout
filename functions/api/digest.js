import { MATT_PROFILE, verifyAuth, jsonResponse, unauthorised, callAnthropic, extractText, CORS_HEADERS } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const { jobs } = await context.request.json();

  const jobList = jobs.map(j => {
    const score = Math.round(
      j.flexibility_score * 0.35 + j.skills_score * 0.30 +
      j.culture_score * 0.20 + j.comp_score * 0.15
    );
    return `- ${j.title} at ${j.company} (Fit: ${score}%, Flex: ${j.flexibility_score}%): ${j.summary}`;
  }).join("\n");

  const system = `You are a trusted headhunter writing a weekly job search update for Matt Hurst.
${MATT_PROFILE}

Write like a trusted advisor — warm, honest, direct. Not corporate, not salesy.
Keep it under 300 words.`;

  const data = await callAnthropic(context.env, {
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system,
    messages: [{
      role: "user",
      content: `Write a short weekly digest for Matt summarising this week's job leads.

Jobs found this week:
${jobList}

Structure:
1. MARKET PULSE (1–2 sentences on what the Copenhagen job market looks like this week for someone with Matt's profile)
2. TOP 3 PICKS — the three best leads with a single honest sentence on why each one suits Matt
3. UNSOLICITED APPLICATION SUGGESTION — one company Matt should approach directly even if nothing is posted right now, with a one-line reason
4. THIS WEEK'S ADVICE — one honest, specific piece of advice for Matt's search

Tone: warm but direct. Like a message from someone who actually knows Matt and wants him to find the right thing.`,
    }],
  });

  return jsonResponse({ text: extractText(data) });
}
