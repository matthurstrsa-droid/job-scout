export const MATT_PROFILE = `
Name: Matt Hurst
Current role: Merchandise Director at Flying Tiger Copenhagen (2023–present)
Experience: 15+ years merchandise financial planning

Key skills:
- OTB management across DKK 500m+ budget
- Forecast accuracy improvement (~10 percentage points over 2 years)
- Blue Yonder / JDA planning systems
- Advanced Excel modelling and Power BI
- Cross-functional stakeholder alignment (Finance, Product, Buying, Operations, Demand Planning)
- Team leadership (up to 15 planners)
- S&OP, demand and inventory planning
- Commercial budgeting, KPI design, category strategy

Previous roles:
- Head of Merchandise Planning, Flying Tiger Copenhagen (2022–2023)
- Merchandise Planner, Flying Tiger Copenhagen (2021–2022) — founding role, built function from scratch
- Demand Planning Manager, Pep Stores South Africa (2016–2021) — 20+ person team, highly mature planning environment with Blue Yonder
- Merchandise Planner, Pep Stores (2008–2016) — Back to School campaign: 12% profit growth on 55% market share BU

Education: BCom cum laude, Stellenbosch University
Languages: English (native), Danish (B1, actively developing)
Location: Copenhagen, Denmark (must stay in Copenhagen — son James is here)

What Matt is looking for (PRIORITY ORDER):
1. Genuine flexibility and autonomy — able to leave at 2pm, take a day off spontaneously
2. 30–37 hours per week, absolutely no overtime culture
3. Good work-life balance, calm working environment
4. Open to stepping back on title and compensation
5. Company culture matters more than brand prestige or job title
6. Open to adjacent industries — not just retail/merchandise planning
7. Willing to work in Danish if needed

Adjacent industries and roles that suit Matt's transferable skills:
- Business controller / commercial finance / FP&A analyst
- Operations or process consultant (mid-size consultancy)
- Supply chain planning lead (any industry: FMCG, food, logistics, health)
- Commercial analyst / insights manager at a scale-up
- Interim or project-based planning consultant
- Planning or analytics lead at an NGO or foundation
- Demand/inventory planning at purpose-driven companies
- S&OP manager in any consumer goods or manufacturing company

Companies known for good work-life balance culture in Copenhagen:
- Novo Nordisk (known for flexible working)
- Ørsted (sustainability focus, good culture)
- Danish foundations and NGOs
- B Corp certified companies
- Scale-ups in fintech, health tech, food tech
- Danish co-operatives
`;

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Auth",
};

export function verifyAuth(request, env) {
  const auth = request.headers.get("X-Auth");
  return auth === env.APP_PASSWORD;
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export function unauthorised() {
  return new Response("Unauthorised", { status: 401, headers: CORS_HEADERS });
}

export async function callAnthropic(env, body) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function extractText(data) {
  return (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n")
    .trim();
}
