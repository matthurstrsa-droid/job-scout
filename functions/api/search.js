import { MATT_PROFILE, verifyAuth, jsonResponse, unauthorised, callAnthropic, extractText, CORS_HEADERS } from "../_shared.js";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  if (!verifyAuth(context.request, context.env)) return unauthorised();

  const system = `You are a specialist Copenhagen headhunter finding jobs for a senior planning professional.
Search for real, currently open roles in Copenhagen that match this candidate profile:
${MATT_PROFILE}

IMPORTANT SEARCH INSTRUCTIONS:
- Search broadly across all industries, not just retail
- Include adjacent roles where transferable skills apply
- Prioritise companies and roles known for good work-life balance and flexibility
- Look for scale-ups, NGOs, foundations, consultancies, FMCG, logistics, health tech
- Check jobindex.dk, linkedin.com/jobs, and company career pages
- Focus on roles currently open in Copenhagen, Denmark

Return ONLY a valid JSON object with this exact structure (no markdown, no backticks):
{
  "jobs": [
    {
      "id": "unique_id_string",
      "title": "job title",
      "company": "company name",
      "industry": "industry type",
      "location": "Copenhagen or area",
      "url": "direct job posting url or linkedin url or company careers page",
      "summary": "2 sentence description of the role",
      "why_matt": "1-2 sentences on why this specifically suits Matt given his priorities",
      "flexibility_score": 0-100,
      "skills_score": 0-100,
      "culture_score": 0-100,
      "comp_score": 0-100,
      "flexibility_notes": "specific signals about flexibility in this role/company",
      "skills_notes": "how Matt's specific skills map to this role",
      "culture_notes": "company culture signals and work-life balance indicators",
      "comp_notes": "whether compensation is realistic for a step-back",
      "adjacent": true or false,
      "source": "where this job was found"
    }
  ]
}

Return 6-8 jobs. Score honestly — Matt values flexibility above all else.
Return ONLY the JSON object, nothing else.`;

  const data = await callAnthropic(context.env, {
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system,
    messages: [{
      role: "user",
      content: "Search for open jobs in Copenhagen right now that match Matt's profile. Search broadly across industries. Include roles in adjacent sectors. Find real, currently posted positions.",
    }],
    tools: [{ type: "web_search_20250305", name: "web_search" }],
  });

  const raw = extractText(data);

  let jobs = [];
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("{");
    const end   = clean.lastIndexOf("}") + 1;
    const parsed = JSON.parse(clean.slice(start, end));
    jobs = parsed.jobs || [];
  } catch {
    // Try array fallback
    try {
      const start = raw.indexOf("[");
      const end   = raw.lastIndexOf("]") + 1;
      jobs = JSON.parse(raw.slice(start, end));
    } catch {
      jobs = [];
    }
  }

  return jsonResponse({ jobs });
}
