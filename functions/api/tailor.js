import { MATT_PROFILE, verifyAuth, jsonResponse, unauthorised, callAnthropic, extractText, CORS_HEADERS } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const { title, company, description } = await context.request.json();

  const system = `You are an expert CV coach helping Matt Hurst tailor his application.

${MATT_PROFILE}

Matt's current CV highlights:
- Merchandise Director at Flying Tiger Copenhagen (2023–present): DKK 500m+ OTB, ~10pp forecast accuracy improvement, built commercial budgeting process from scratch, advanced Excel and Power BI tools
- Head of Merchandise Planning at Flying Tiger (2022–2023): led team of up to 15 planners, cross-functional partner to Product, Buying, Operations
- Merchandise Planner at Flying Tiger (2021–2022): founding role, built planning function from scratch in low-structure environment
- Demand Planning Manager at Pep Stores South Africa (2016–2021): directed 20+ person team, highly mature Blue Yonder planning environment
- Merchandise Planner at Pep Stores (2008–2016): 12% profit growth on 55% market share Back to School campaign

Be direct, practical, and honest. Plain language throughout.`;

  const data = await callAnthropic(context.env, {
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system,
    messages: [{
      role: "user",
      content: `Job: ${title} at ${company}
Job description:
${description}

Give me:
1. FIT SCORE (0–100) with one honest line of explanation
2. PROFILE HEADLINE — rewrite Matt's CV headline specifically for this role (1 line)
3. PROFILE SUMMARY — rewrite the CV profile paragraph for this role (3–4 sentences, plain language, no waffle)
4. TOP 3 BULLETS TO LEAD WITH — which of Matt's existing bullet points to emphasise, and any suggested rewrites to match this role's language
5. KEYWORDS TO ADD — specific words or phrases from this job description that should appear in the CV
6. ONE HONEST CONCERN — what might give the hiring manager pause, and how Matt could address it

Keep it direct and useful. No filler.`,
    }],
  });

  return jsonResponse({ text: extractText(data) });
}
