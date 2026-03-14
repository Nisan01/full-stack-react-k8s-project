import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const GRADE_COLORS = {
  "A+": "#16a34a", A: "#2563eb", "B+": "#7c3aed",
  B: "#d97706", "C+": "#ea580c", C: "#dc2626", D: "#be123c", F: "#991b1b",
};
const GRADE_POINTS = {
  "A+": 4.0, A: 3.6, "B+": 3.2, B: 2.8, "C+": 2.4, C: 2.0, D: 1.6, F: 0,
};
const GRADE_SCALE = [
  ["A+","4.0","Outstanding"],["A","3.6","Excellent"],["B+","3.2","Very Good"],
  ["B","2.8","Good"],["C+","2.4","Satisfactory"],["C","2.0","Acceptable"],
];
const SUBJECTS = [
  { key: "mathematics", name: "Mathematics",          code: "MAT-401" },
  { key: "science",     name: "Science & Technology", code: "SCI-402" },
  { key: "english",     name: "English",              code: "ENG-403" },
  { key: "nepali",      name: "Nepali",               code: "NEP-404" },
  { key: "social",      name: "Social Studies",       code: "SOC-405" },
];
const SAMPLE_SYMBOLS = ["10001","10002","10003","10004","10005","10006","10007","10008"];
const LANDING_CARDS = [
  { icon: "📋", title: "Instant Results",   desc: "Get your marksheet in seconds" },
  { icon: "🔒", title: "Secure & Official", desc: "Verified by NEB database" },
  { icon: "📊", title: "Full Grade Sheet",  desc: "All subjects with GPA" },
  { icon: "🏫", title: "SEE Examination",   desc: "Grade X results portal" },
];

export default function App() {
  const [symbolNo,  setSymbolNo]  = useState("");
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [resultKey, setResultKey] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = symbolNo.trim();
    if (!query) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${BACKEND_URL}/result/${query}`);
      setResult(res.data);
      setResultKey((k) => k + 1);
      setSplitView(true);
    } catch (err) {
      let msg = "";
      if (!err.response) {
        msg = "Cannot connect to server. Make sure the backend is running.";
      } else if (err.response.status === 404) {
        msg = `No student found with symbol number "${query}". Please check and try again.`;
      } else {
        msg = err.response?.data?.error || "Something went wrong. Please try again.";
      }
      setError(msg);
      setResult(null);
      // keep splitView as-is so sidebar stays if user was already in split mode
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    setSplitView(false);
    setSymbolNo("");
  };

  const subjects = SUBJECTS.map((s) => ({ ...s, grade: result?.[s.key] ?? "" }));
  const passedAll = subjects.every((s) => s.grade !== "F" && s.grade !== "D");

  return (
    <div className="app-root">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <div onClick={handleReset} className="header-logo-btn" title="Go to home">
            <Emblem size={44} />
          </div>
          <div>
            <h1 className="header-title" onClick={handleReset} style={{cursor:"pointer"}} title="Go to home">NATIONAL EXAMINATION BOARD</h1>
            <p className="header-sub">Online Result Verification Portal — Grade X / SEE</p>
          </div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="app-layout">

        {/* ════ LEFT / CENTER PANEL ════ */}
        <div className={`left-panel ${splitView ? "sidebar" : "centered"}`}>
          <div className={`left-inner ${splitView ? "sidebar" : "centered"}`}>

            {/* Sidebar emblem */}
            {splitView && (
              <div className="side-emblem" onClick={handleReset} title="Go to home">
                <Emblem size={46} />
                <div className="side-emblem-text">NEB PORTAL</div>
              </div>
            )}

            {/* Center headings */}
            {!splitView && (
              <>
                <div className="search-eyebrow">SYMBOL NUMBER LOOKUP</div>
                <h2 className="search-title">Check Your Result</h2>
                <p className="search-hint">Enter your symbol number to view your official marksheet</p>
                <p className="search-sample">Sample: <strong>10001</strong> — <strong>10008</strong></p>
              </>
            )}

            {splitView && <div className="side-label">SEARCH RESULT</div>}

            {/* ── Search form ── */}
            <form className={`search-form ${splitView ? "col" : "row"}`} onSubmit={handleSearch}>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  className={`search-input ${splitView ? "sidebar-mode" : "center-mode"}`}
                  placeholder={splitView ? "New symbol no..." : "Enter Symbol No. e.g. 10001"}
                  value={symbolNo}
                  onChange={(e) => setSymbolNo(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading}
                className={`search-btn ${splitView ? "sidebar-mode" : "center-mode"}`}>
                {loading ? <span className="spinner" /> : splitView ? "Search" : "Check Result →"}
              </button>
            </form>

            {/* ── CARDS — shown in center mode always, disappear when result found ── */}
            {!splitView && (
              <div className={`landing-grid ${error ? "cards-hidden" : ""}`}>
                {/* Error banner above cards when error occurs */}
                {error && (
                  <div className="inline-error">
                    <div className="inline-error-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="#dc2626" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <div className="inline-error-title">No Result Found</div>
                      <div className="inline-error-msg">{error}</div>
                    </div>
                  </div>
                )}

                {/* Cards — always visible when not in splitView */}
                {!error && LANDING_CARDS.map((c, i) => (
                  <div key={i} className="landing-card">
                    <div className="landing-icon">{c.icon}</div>
                    <div className="landing-card-title">{c.title}</div>
                    <div className="landing-card-desc">{c.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Sidebar: error, reset, quick-select */}
            {splitView && error && (
              <div className="side-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#fca5a5" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {splitView && (
              <button className="reset-btn" onClick={handleReset}>← Start Over</button>
            )}

            {splitView && (
              <div className="side-hint">
                <div className="side-hint-title">QUICK SELECT</div>
                {SAMPLE_SYMBOLS.map((n) => (
                  <div key={n}
                    className={`side-hint-item ${symbolNo === n ? "active" : ""}`}
                    onClick={() => setSymbolNo(n)}>
                    {n}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ════ RIGHT PANEL — marksheet ════ */}
        <div className={`right-panel ${splitView ? "has-result" : "empty"}`}>
          {result && splitView && (
            <div key={resultKey} className="marksheet">

              <div className="ms-header">
                <div className="ms-header-left">
                  <Emblem size={52} />
                  <div>
                    <div className="ms-org">NATIONAL EXAMINATION BOARD</div>
                    <div className="ms-title">GRADE SHEET / MARKSHEET</div>
                    <div className="ms-sub">Secondary Education Examination (SEE)</div>
                  </div>
                </div>
                <div className={`ms-status ${passedAll ? "passed" : "failed"}`}>
                  {passedAll ? "✓ PASSED" : "✗ FAILED"}
                </div>
              </div>

              <div className="ms-divider" />

              <div className="ms-info-grid">
                <InfoRow label="Student Name"  value={result.name}      highlight />
                <InfoRow label="Symbol Number" value={result.symbol_no} />
                <InfoRow label="Faculty"       value={result.faculty}   />
                <InfoRow label="Address"       value={result.address}   />
                <InfoRow label="Exam Year"     value={result.exam_year} />
              </div>

              <div className="ms-divider" />

              <div className="table-section">
                <div className="table-section-title">ACADEMIC PERFORMANCE</div>
                <table className="subject-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>S.N.</th>
                      <th className="left">Subject</th>
                      <th>Code</th>
                      <th>Grade</th>
                      <th>Grade Point</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s, i) => {
                      const color = GRADE_COLORS[s.grade] || "#374151";
                      const gp    = GRADE_POINTS[s.grade] ?? 0;
                      const pass  = s.grade !== "F" && s.grade !== "D";
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td className="sn">{i + 1}</td>
                          <td className="subject-name">{s.name}</td>
                          <td className="code">{s.code}</td>
                          <td className="grade-cell">
                            <span className="grade-badge"
                              style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
                              {s.grade}
                            </span>
                          </td>
                          <td className="gp-cell">{gp.toFixed(1)}</td>
                          <td className="remark-cell">
                            <span className={`remark ${pass ? "pass" : "fail"}`}>
                              {pass ? "Pass" : "Fail"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="gpa-section">
                <div className="gpa-box">
                  <div className="gpa-label">FINAL GPA</div>
                  <div className="gpa-value">{parseFloat(result.gpa).toFixed(2)}</div>
                  <div className="gpa-max">out of 4.00</div>
                </div>
                <div className="grade-scale">
                  <div className="grade-scale-title">GRADE SCALE</div>
                  {GRADE_SCALE.map(([g, p, r]) => {
                    const color = GRADE_COLORS[g] || "#374151";
                    return (
                      <div key={g} className="scale-row">
                        <span className="scale-grade" style={{ background: `${color}18`, color }}>{g}</span>
                        <span className="scale-point">{p}</span>
                        <span className="scale-remark">{r}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ms-divider" />

              <div className="ms-footer">
                <div className="ms-footer-note">⚠️ Computer-generated result. Contact exam board for official use.</div>
                <div className="ms-footer-date">
                  Issued: {new Date().toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        © 2081 National Examination Board, Nepal &nbsp;|&nbsp; Result Management System v2.0
      </footer>
    </div>
  );
}

function Emblem({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="23" stroke="#c8a951" strokeWidth="2" />
      <circle cx="24" cy="24" r="18" stroke="#c8a951" strokeWidth="1" strokeDasharray="3 2" />
      <polygon points="24,8 27,18 38,18 29,25 32,35 24,28 16,35 19,25 10,18 21,18"
        fill="#c8a951" opacity="0.9" />
    </svg>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={highlight ? "info-value-hl" : "info-value"}>{value}</span>
    </div>
  );
}
