import { MATT_PROFILE, verifyAuth, jsonResponse, unauthorised, callAnthropic, extractText, CORS_HEADERS } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const { title, company, description } = await context.request.json();

  const system = `You are an expert cover letter writer helping Matt Hurst apply for jobs.

${MATT_PROFILE}

Matt's current CV highlights:
- Merchandise Director at Flying Tiger Copenhagen (2023–present): DKK 500m+ OTB, ~10pp forecast accuracy improvement, built commercial budgeting from scratch, advanced Excel and Power BI
- Head of Merchandise Planning at Flying Tiger (2022–2023): led team of up to 15 planners, cross-functional partner to Product, Buying, Operations
- Merchandise Planner at Flying Tiger (2021–2022): founding role, built planning function from scratch
- Demand Planning Manager at Pep Stores South Africa (2016–2021): 20+ person team, highly mature Blue Yonder planning environment
- Merchandise Planner at Pep Stores (2008–2016): 12% profit growth on 55% market share Back to School campaign
- BCom cum laude, Stellenbosch University
- Danish B1, based in Copenhagen

Write in Matt's voice: confident, direct, plain language, no waffle. No "Dear Sir/Madam" — use "Dear Hiring Manager". 4-5 short paragraphs maximum. Focus on what makes Matt genuinely suited to THIS role.`;

  const data = await callAnthropic(context.env, {
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system,
    messages: [{
      role: "user",
      content: `Write a cover letter for Matt applying to: ${title} at ${company}

Job description:
${description}

Write a confident, direct cover letter in plain language. Lead with the strongest match between Matt's background and this specific role. Keep it to 4 short paragraphs. End with a simple closing — no grand statements.`,
    }],
  });

  return jsonResponse({ text: extractText(data) });
}
