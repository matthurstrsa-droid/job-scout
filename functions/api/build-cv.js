import { MATT_PROFILE, verifyAuth, jsonResponse, unauthorised, callAnthropic, extractText, CORS_HEADERS } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const { title, company, description } = await context.request.json();

  const system = `You are an expert CV writer generating a tailored CV for Matt Hurst.
${MATT_PROFILE}

Matt's full career history:
ROLE 1: Merchandise Director — Core & Budgeting | Flying Tiger Copenhagen | 2023–Present
Key facts: DKK 500m+ OTB, ~10pp forecast accuracy improvement, built commercial budgeting from scratch, advanced Excel/Power BI, monthly S&OP with SLT, OTB governance, forecast deviation management

ROLE 2: Head of Merchandise Planning | Flying Tiger Copenhagen | 2022–2023
Key facts: Led up to 15 planners, cross-functional partner to Product/Buying/Procurement/Operations, introduced KPIs and governance frameworks, embedded planning as strategic partner

ROLE 3: Merchandise Planner | Flying Tiger Copenhagen | 2021–2022
Key facts: Founding role, built planning function from scratch, category budgets and KPI frameworks, OTB management, cross-functional stakeholder collaboration

ROLE 4: Demand Planning Manager | Pep Stores (Pty) Ltd, South Africa | 2016–2021
Key facts: Directed 20+ planners, high-volume retail environment, strategic direction for Core products, Blue Yonder systems, coaching and mentoring, senior stakeholder partnerships

ROLE 5: Merchandise Planner | Pep Stores (Pty) Ltd, South Africa | 2008–2016
Key facts: Back to School campaign — 12% profit growth on 55% market share BU, stock and OTB management, buying team collaboration

Education: BCom cum laude, Stellenbosch University
Achievements: Senior Management Development Programme, Golden Key International Honours Society
Languages: English (native), Danish (B1)
Contact: Copenhagen, Denmark | +45 31 44 34 18 | matthurstrsa@gmail.com | linkedin.com/in/matthew-hurst-dk

INSTRUCTIONS:
- Tailor every section to the specific job
- Use the job description's exact language and keywords where genuinely applicable
- Be honest — do not claim skills or experience Matt doesn't have
- Keep bullets concise and achievement-focused
- Profile summary: 4-5 sentences maximum
- Each role: 3-4 bullets maximum (fewer for older roles)
- Subtitle should reflect what Matt is applying for, not his current title

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks):
{
  "subtitle": "one line positioning statement matching the role",
  "profile": "4-5 sentence profile paragraph tailored to the role",
  "skills": [
    ["skill1", "skill2", "skill3", "skill4"],
    ["skill5", "skill6", "skill7", "skill8"],
    ["skill9", "skill10", "skill11", "skill12"]
  ],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "dates": "date range",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "education": [
    "BCom (cum laude) — Stellenbosch University",
    "Selected for Senior Management Development Programme",
    "Golden Key International Honours Society"
  ],
  "languages": "English (native)   ·   Danish (B1 — actively developing, living and working in Copenhagen)"
}`;

  const data = await callAnthropic(context.env, {
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system,
    messages: [{
      role: "user",
      content: `Generate a tailored CV for Matt applying to: ${title} at ${company}\n\nJob description:\n${description}\n\nReturn only the JSON object.`,
    }],
  });

  const raw = extractText(data);

  try {
    const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const s = clean.indexOf("{"), e = clean.lastIndexOf("}") + 1;
    const parsed = JSON.parse(clean.slice(s, e));
    return jsonResponse({ ok: true, cv: parsed });
  } catch (e) {
    return jsonResponse({ ok: false, error: "Failed to parse CV content", raw }, 500);
  }
}
