import { useState, useEffect } from "react";

const C = {
  bg: "#F6F4F0", card: "#FFFFFF", sage: "#4E7A68", sageLt: "#7AA896",
  sageXlt: "#E8F0ED", slate: "#1C2B3A", slate2: "#2E4459", sand: "#E2D8CC",
  muted: "#8A9BAD", warm: "#C07B52", warmLt: "#F0E6DC", red: "#C94F4F",
  redLt: "#FAEAEA", text: "#1C2B3A", textSub: "#556070", gold: "#C9A84C",
  goldLt: "#FDF6E3",
};

const STATUS_CONFIG = {
  new:        { label: "New",        color: C.slate,  bg: "#EEF1F7" },
  interested: { label: "Interested", color: C.sage,   bg: C.sageXlt },
  applied:    { label: "Applied",    color: C.warm,   bg: C.warmLt },
  rejected:   { label: "Rejected",  color: C.red,    bg: C.redLt },
  pass:       { label: "Pass",       color: C.muted,  bg: C.sand },
};

function overallScore(job) {
  const flex   = parseFloat(job.flexibility_score) || 0;
  const auto   = parseFloat(job.autonomy_score)    || 0;
  const culture= parseFloat(job.culture_score)     || 0;
  const salary = parseFloat(job.salary_score)      || 0;
  return Math.round(flex * 0.35 + auto * 0.30 + culture * 0.20 + salary * 0.15);
}

function scoreColor(s) {
  if (s >= 75) return C.sage;
  if (s >= 50) return C.warm;
  return C.red;
}

function scoreBg(s) {
  if (s >= 75) return C.sageXlt;
  if (s >= 50) return C.warmLt;
  return C.redLt;
}

async function apiFetch(path, method = "GET", body = null, password) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", "X-Auth": password },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (res.status === 401) throw new Error("WRONG_PASSWORD");
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res;
}

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const submit = e => { e.preventDefault(); if (pw.trim()) onLogin(pw.trim()); };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: C.card, borderRadius: "16px", padding: "40px 32px", maxWidth: "380px", width: "100%", boxShadow: "0 4px 24px #00000012", border: `1px solid ${C.sand}` }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🧭</div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: C.slate, marginBottom: "6px" }}>Job Scout Dashboard</h1>
          <p style={{ fontSize: "13px", color: C.textSub }}>Matt's weekly job tracker</p>
        </div>
        <form onSubmit={submit}>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" autoFocus
            style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: `1px solid ${C.sand}`, fontSize: "15px", fontFamily: "inherit", outline: "none", color: C.text, background: C.bg, marginBottom: "12px" }} />
          <button type="submit" style={{ width: "100%", padding: "12px", background: C.sage, color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
            Enter →
          </button>
        </form>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }) {
  const s = parseFloat(score) || 0;
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
        <span style={{ fontSize: "11px", color: C.textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: scoreColor(s) }}>{s}</span>
      </div>
      <div style={{ background: "#00000010", borderRadius: "4px", height: "5px" }}>
        <div style={{ width: `${s}%`, height: "5px", borderRadius: "4px", background: scoreColor(s), transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function JobCard({ job, onUpdate, expanded, onToggle }) {
  const score = overallScore(job);
  const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.new;
  const [note, setNote] = useState(job.notes || "");
  const [saving, setSaving] = useState(false);

  async function saveNote() {
    setSaving(true);
    await onUpdate(job.id, { notes: note });
    setSaving(false);
  }

  return (
    <div style={{
      background: C.card, borderRadius: "12px", border: `1px solid ${expanded ? C.sage : C.sand}`,
      overflow: "hidden", transition: "border 0.2s",
      boxShadow: expanded ? `0 0 0 3px ${C.sageXlt}` : "0 1px 4px #00000008",
    }}>
      {/* Card header — always visible */}
      <div onClick={onToggle} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {/* Score circle */}
        <div style={{ minWidth: "52px", height: "52px", borderRadius: "50%", background: scoreBg(score), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "17px", fontWeight: 800, color: scoreColor(score), lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: "9px", color: C.muted, fontWeight: 700 }}>FIT</span>
        </div>
        {/* Job info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "5px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, background: status.bg, color: status.color, padding: "2px 8px", borderRadius: "20px" }}>
              {status.label}
            </span>
            <span style={{ fontSize: "10px", color: C.muted, background: C.sageXlt, padding: "2px 8px", borderRadius: "20px" }}>
              {job.source}
            </span>
            {job.foundDate && (
              <span style={{ fontSize: "10px", color: C.muted, padding: "2px 0" }}>{job.foundDate}</span>
            )}
          </div>
          <h3 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: C.slate, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</h3>
          <p style={{ margin: 0, fontSize: "12px", color: C.textSub }}>{job.company} · {job.location}</p>
        </div>
        <span style={{ color: C.muted, fontSize: "16px", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.sand}`, paddingTop: "14px" }}>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: C.textSub, lineHeight: 1.6 }}>{job.summary}</p>

          {/* Scores */}
          <div style={{ marginBottom: "14px" }}>
            <ScoreBar label="Flexibility (35%)" score={job.flexibility_score || 0} />
            <ScoreBar label="Autonomy (30%)" score={job.autonomy_score || 0} />
            <ScoreBar label="Culture (20%)" score={job.culture_score || 0} />
            <ScoreBar label="Salary fit (15%)" score={job.salary_score || 0} />
          </div>

          {/* Why Matt */}
          {job.why_matt && (
            <div style={{ background: C.sageXlt, borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
              <p style={{ margin: 0, fontSize: "12px", color: C.sage, lineHeight: 1.5 }}>
                <strong>Why this could work:</strong> {job.why_matt}
              </p>
            </div>
          )}

          {/* Flags */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
            {job.green_flags && (
              <div style={{ background: C.sageXlt, borderRadius: "6px", padding: "6px 10px", fontSize: "11px", color: C.sage }}>
                ✅ {job.green_flags}
              </div>
            )}
            {job.red_flags && (
              <div style={{ background: C.redLt, borderRadius: "6px", padding: "6px 10px", fontSize: "11px", color: C.red }}>
                ⚠️ {job.red_flags}
              </div>
            )}
          </div>

          {/* Status update */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => onUpdate(job.id, { status: key })}
                style={{
                  padding: "5px 12px", borderRadius: "20px", border: `1px solid ${job.status === key ? cfg.color : C.sand}`,
                  background: job.status === key ? cfg.bg : C.card, color: job.status === key ? cfg.color : C.textSub,
                  cursor: "pointer", fontSize: "11px", fontWeight: job.status === key ? 700 : 400,
                }}>
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add your notes here..."
            style={{ width: "100%", minHeight: "70px", borderRadius: "8px", border: `1px solid ${C.sand}`, padding: "8px 10px", fontSize: "12px", fontFamily: "inherit", resize: "vertical", color: C.text, background: C.bg, outline: "none" }} />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={saveNote} disabled={saving}
              style={{ padding: "7px 16px", background: saving ? C.sand : C.slate, color: saving ? C.muted : "#fff", border: "none", borderRadius: "8px", cursor: saving ? "default" : "pointer", fontSize: "12px", fontWeight: 600 }}>
              {saving ? "Saving..." : "Save note"}
            </button>
            {job.url && job.url !== "#" && (
              <a href={job.url} target="_blank" rel="noreferrer"
                style={{ padding: "7px 16px", background: C.sage, color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>
                View job →
              </a>
            )}
            {(!job.url || job.url === "#") && (
              <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + " " + job.company)}&location=Copenhagen`}
                target="_blank" rel="noreferrer"
                style={{ padding: "7px 16px", background: C.sage, color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}>
                Search LinkedIn →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [password, setPassword] = useState(() => sessionStorage.getItem("scout_pw") || "");
  const [jobs, setJobs] = useState([]);
  const [lastRun, setLastRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!password) return;
    setLoading(true);
    apiFetch("/api/jobs", "GET", null, password)
      .then(r => r.json())
      .then(data => { setJobs(data.jobs || []); setLastRun(data.lastRun); })
      .catch(e => { if (e.message === "WRONG_PASSWORD") { sessionStorage.removeItem("scout_pw"); setPassword(""); } })
      .finally(() => setLoading(false));
  }, [password]);

  function handleLogin(pw) { sessionStorage.setItem("scout_pw", pw); setPassword(pw); }

  async function updateJob(id, updates) {
    const newJobs = jobs.map(j => j.id === id ? { ...j, ...updates } : j);
    setJobs(newJobs);
    try {
      await apiFetch("/api/jobs", "PUT", { jobs: newJobs, lastRun }, password);
    } catch {}
  }

  if (!password) return <LoginScreen onLogin={handleLogin} />;

  const filtered = jobs
    .filter(j => filterStatus === "all" || j.status === filterStatus)
    .filter(j => !searchTerm || `${j.title} ${j.company}`.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "score") return overallScore(b) - overallScore(a);
      if (sortBy === "flex") return (b.flexibility_score || 0) - (a.flexibility_score || 0);
      if (sortBy === "date") return new Date(b.foundDate || 0) - new Date(a.foundDate || 0);
      return 0;
    });

  const stats = {
    total: jobs.length,
    new: jobs.filter(j => j.status === "new").length,
    interested: jobs.filter(j => j.status === "interested").length,
    applied: jobs.filter(j => j.status === "applied").length,
    highFlex: jobs.filter(j => (j.flexibility_score || 0) >= 75).length,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.slate, padding: "14px 20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 style={{ margin: "0 0 2px", fontSize: "17px", fontWeight: 800, color: "#fff" }}>🧭 Job Scout Dashboard</h1>
            <p style={{ margin: 0, fontSize: "11px", color: C.muted }}>
              {lastRun ? `Last updated ${new Date(lastRun).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "Awaiting first scan"}
              {" · "} Next scan: Thursday 8am
            </p>
          </div>
          <button onClick={() => { sessionStorage.removeItem("scout_pw"); setPassword(""); }}
            style={{ padding: "7px 12px", background: "none", color: C.muted, border: `1px solid ${C.muted}40`, borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>
            Lock
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Total jobs", value: stats.total },
            { label: "New this week", value: stats.new },
            { label: "Interested", value: stats.interested },
            { label: "Applied", value: stats.applied },
            { label: "High flex (75+)", value: stats.highFlex },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${C.sand}` }}>
              <p style={{ margin: "0 0 2px", fontSize: "22px", fontWeight: 800, color: C.slate }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: "10px", color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search jobs..."
            style={{ padding: "7px 12px", borderRadius: "8px", border: `1px solid ${C.sand}`, fontSize: "13px", fontFamily: "inherit", background: C.card, color: C.text, outline: "none", width: "160px" }} />
          <span style={{ fontSize: "11px", color: C.muted, fontWeight: 700 }}>FILTER:</span>
          {[["all", "All"], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])].map(([key, label]) => (
            <button key={key} onClick={() => setFilterStatus(key)} style={{
              padding: "5px 12px", borderRadius: "20px",
              border: `1px solid ${filterStatus === key ? C.sage : C.sand}`,
              background: filterStatus === key ? C.sageXlt : C.card,
              color: filterStatus === key ? C.sage : C.textSub,
              cursor: "pointer", fontSize: "11px", fontWeight: filterStatus === key ? 700 : 400,
            }}>{label}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: C.muted, fontWeight: 700, alignSelf: "center" }}>SORT:</span>
            {[["date", "Newest"], ["score", "Best fit"], ["flex", "Most flexible"]].map(([val, label]) => (
              <button key={val} onClick={() => setSortBy(val)} style={{
                padding: "5px 12px", borderRadius: "20px",
                border: `1px solid ${sortBy === val ? C.sage : C.sand}`,
                background: sortBy === val ? C.sageXlt : C.card,
                color: sortBy === val ? C.sage : C.textSub,
                cursor: "pointer", fontSize: "11px", fontWeight: sortBy === val ? 700 : 400,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
            <p>Loading your job dashboard...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && jobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <h2 style={{ color: C.slate, margin: "0 0 8px" }}>No jobs yet</h2>
            <p style={{ color: C.textSub, fontSize: "14px" }}>The scanner runs every Thursday at 8am and will populate this dashboard automatically.</p>
          </div>
        )}

        {/* Job list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              expanded={expandedId === job.id}
              onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
              onUpdate={updateJob}
            />
          ))}
          {!loading && filtered.length === 0 && jobs.length > 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: C.muted }}>
              No jobs match your current filter.
            </div>
          )}
        </div>
      </div>

      <style>{`* { box-sizing: border-box; } button:hover:not(:disabled) { opacity: 0.85; } textarea:focus, input:focus { border-color: #4E7A68 !important; box-shadow: 0 0 0 3px #E8F0ED; }`}</style>
    </div>
  );
}
