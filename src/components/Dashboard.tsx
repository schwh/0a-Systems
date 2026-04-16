// @ts-nocheck
"use client";
import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  LayoutDashboard, BarChart3, Table2, Layers, Globe,
  Activity, Search, Sun, Moon, Menu, Settings,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════

const f1HistoryData = [
  { day: 1, SVM: 0.41, MISVM: 0.66, rMIL: 0.65, nMIL: 0.67 },
  { day: 2, SVM: 0.33, MISVM: 0.64, rMIL: 0.56, nMIL: 0.68 },
  { day: 3, SVM: 0.30, MISVM: 0.69, rMIL: 0.55, nMIL: 0.74 },
  { day: 4, SVM: 0.39, MISVM: 0.64, rMIL: 0.66, nMIL: 0.71 },
  { day: 5, SVM: 0.39, MISVM: 0.62, rMIL: 0.51, nMIL: 0.75 },
  { day: 6, SVM: 0.47, MISVM: 0.63, rMIL: 0.55, nMIL: 0.75 },
  { day: 7, SVM: 0.42, MISVM: 0.62, rMIL: 0.60, nMIL: 0.71 },
  { day: 8, SVM: 0.51, MISVM: 0.70, rMIL: 0.58, nMIL: 0.74 },
  { day: 9, SVM: 0.39, MISVM: 0.71, rMIL: 0.59, nMIL: 0.67 },
  { day: 10, SVM: 0.48, MISVM: 0.63, rMIL: 0.59, nMIL: 0.74 },
];

const betaSensitivity = [
  { beta: "0.1", MX: 0.89, BR: 0.71, AR: 0.72 },
  { beta: "0.2", MX: 0.88, BR: 0.77, AR: 0.70 },
  { beta: "0.3", MX: 0.85, BR: 0.76, AR: 0.70 },
  { beta: "0.4", MX: 0.87, BR: 0.70, AR: 0.66 },
  { beta: "0.5", MX: 0.85, BR: 0.78, AR: 0.73 },
  { beta: "0.6", MX: 0.85, BR: 0.69, AR: 0.72 },
  { beta: "0.7", MX: 0.86, BR: 0.76, AR: 0.72 },
  { beta: "0.8", MX: 0.89, BR: 0.71, AR: 0.74 },
  { beta: "0.9", MX: 0.88, BR: 0.71, AR: 0.73 },
  { beta: "1.0", MX: 0.87, BR: 0.71, AR: 0.75 },
];

const cosineTimeSeries = [
  { day: 1, mean: 0.59, upper: 0.88, lower: 0.30 },
  { day: 2, mean: 0.55, upper: 0.92, lower: 0.25 },
  { day: 3, mean: 0.53, upper: 0.82, lower: 0.28 },
  { day: 4, mean: 0.58, upper: 0.85, lower: 0.32 },
  { day: 5, mean: 0.70, upper: 0.90, lower: 0.38 },
  { day: 6, mean: 0.57, upper: 0.80, lower: 0.22 },
  { day: 7, mean: 0.55, upper: 0.78, lower: 0.30 },
  { day: 8, mean: 0.63, upper: 0.85, lower: 0.35 },
  { day: 9, mean: 0.60, upper: 0.82, lower: 0.33 },
  { day: 10, mean: 0.57, upper: 0.83, lower: 0.28 },
];

const precursorStoryline = [
  { date: "07-28", score: 0.568, label: "Migrant agenda", topic: null },
  { date: "07-29", score: 0.448, label: "Technical default", topic: null },
  { date: "07-30", score: 0.606, label: "Poverty standard", topic: "Poverty" },
  { date: "07-31", score: 0.621, label: "Unresolved debts", topic: "Debt Crisis" },
  { date: "08-01", score: 0.638, label: "Debt crisis ICJ", topic: null },
  { date: "08-03", score: 0.646, label: "Gov. imagination", topic: "Government" },
  { date: "08-05", score: 0.772, label: "Layoffs, blocked hwy", topic: null },
];

const probDistData = (() => {
  const d = [];
  for (let i = 10; i <= 90; i += 2) {
    const x = i / 100;
    d.push({
      x: x.toFixed(2),
      Negative: Math.round(360 * Math.exp(-Math.pow((x - 0.35) / 0.12, 2))),
      Positive: Math.round(200 * Math.exp(-Math.pow((x - 0.55) / 0.15, 2))),
    });
  }
  return d;
})();

const tableData = [
  { id: 1, country: "Argentina", event: "Labor Protest", date: "2014-08-07", pScore: 0.772, model: "nMIL^Δ", f1: 0.74, precursors: 7, status: "detected" },
  { id: 2, country: "Mexico", event: "Congressional Fire", date: "2014-11-11", pScore: 0.834, model: "nMIL^Δ", f1: 0.75, precursors: 10, status: "detected" },
  { id: 3, country: "Brazil", event: "Transit Strike", date: "2014-06-12", pScore: 0.681, model: "MI-SVM", f1: 0.69, precursors: 5, status: "detected" },
  { id: 4, country: "Argentina", event: "Debt Default", date: "2014-07-30", pScore: 0.606, model: "rMIL^avg", f1: 0.62, precursors: 4, status: "partial" },
  { id: 5, country: "Mexico", event: "Student March", date: "2014-11-01", pScore: 0.641, model: "nMIL^Δ", f1: 0.71, precursors: 6, status: "detected" },
  { id: 6, country: "Brazil", event: "Police Clash", date: "2014-09-15", pScore: 0.553, model: "SVM", f1: 0.47, precursors: 3, status: "missed" },
  { id: 7, country: "Argentina", event: "Highway Blockade", date: "2014-08-05", pScore: 0.820, model: "nMIL^Δ", f1: 0.74, precursors: 8, status: "detected" },
  { id: 8, country: "Mexico", event: "Teacher Protest", date: "2014-11-10", pScore: 0.931, model: "nMIL^Δ", f1: 0.75, precursors: 9, status: "detected" },
];

// ═══════════════════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════════════════

const themes = {
  dark: {
    bg: "#0b0b10", panel: "#0f0f16",
    divider: "rgba(255,255,255,0.04)", dividerStrong: "rgba(255,255,255,0.07)",
    text: "#e8e8f0", textSec: "#7a7a95", textMut: "#4a4a62",
    accent: "#818cf8", accentDim: "rgba(129,140,248,0.10)",
    green: "#34d399", greenDim: "rgba(52,211,153,0.10)",
    red: "#f87171", redDim: "rgba(248,113,113,0.10)",
    amber: "#fbbf24", amberDim: "rgba(251,191,36,0.10)",
    purple: "#a78bfa", blue: "#60a5fa", cyan: "#22d3ee",
    sidebar: "#0a0a0f", sidebarHi: "rgba(129,140,248,0.06)",
    chartGrid: "rgba(255,255,255,0.03)",
  },
  light: {
    bg: "#f7f7f9", panel: "#ffffff",
    divider: "rgba(0,0,0,0.05)", dividerStrong: "rgba(0,0,0,0.09)",
    text: "#111118", textSec: "#6b6b82", textMut: "#9a9ab0",
    accent: "#6366f1", accentDim: "rgba(99,102,241,0.07)",
    green: "#059669", greenDim: "rgba(5,150,105,0.07)",
    red: "#dc2626", redDim: "rgba(220,38,38,0.07)",
    amber: "#d97706", amberDim: "rgba(217,119,6,0.07)",
    purple: "#7c3aed", blue: "#2563eb", cyan: "#0891b2",
    sidebar: "#ffffff", sidebarHi: "rgba(99,102,241,0.04)",
    chartGrid: "rgba(0,0,0,0.04)",
  },
};

// ═══════════════════════════════════════════════════════════════
//  MICRO COMPONENTS
// ═══════════════════════════════════════════════════════════════

const Metric = ({ label, value, change, up, c, sub }) => (
  <div>
    <div style={{ fontSize: 10, color: c.textMut, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: c.text, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {change && (
        <span style={{ fontSize: 11, fontWeight: 600, color: up ? c.green : c.red, display: "flex", alignItems: "center", gap: 2 }}>
          {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{change}
        </span>
      )}
    </div>
    {sub && <div style={{ fontSize: 10, color: c.textMut, marginTop: 3 }}>{sub}</div>}
  </div>
);

const SectionHead = ({ title, subtitle, c, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: c.textMut, marginTop: 1 }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

const LineLegend = ({ items, c }) => (
  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
    {items.map(({ name, color }) => (
      <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: c.textSec }}>
        <span style={{ width: 8, height: 2, borderRadius: 1, background: color }} />{name}
      </div>
    ))}
  </div>
);

const DotLegend = ({ items, c }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    {items.map(({ name, color }) => (
      <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: c.textSec }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: color }} />{name}
      </div>
    ))}
  </div>
);

const Pill = ({ label, active, onClick, c }) => (
  <div onClick={onClick} style={{
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 5, cursor: "pointer",
    color: active ? "#fff" : c.textMut, background: active ? c.accent : "transparent",
    transition: "all 0.15s ease",
  }}>{label}</div>
);

const StatusDot = ({ status, c }) => {
  const col = { detected: c.green, partial: c.amber, missed: c.red }[status] || c.textMut;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: col }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: col }} />{status}
    </div>
  );
};

const TT = ({ active, payload, label, c, fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.panel, border: `1px solid ${c.dividerStrong}`, borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", fontSize: 11 }}>
      <div style={{ color: c.textMut, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: c.text, marginBottom: 1 }}>
          <span style={{ width: 6, height: 2, borderRadius: 1, background: p.color || p.stroke }} />
          <span style={{ color: c.textSec }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const Divider = ({ c }) => <div style={{ borderTop: `1px solid ${c.divider}`, margin: "24px 0" }} />;

// ═══════════════════════════════════════════════════════════════
//  PAGE: OVERVIEW  — KPI strip only
// ═══════════════════════════════════════════════════════════════

const PageOverview = ({ c }) => {
  const kpis = [
    { label: "Best F1 (nMIL^Δ)", value: "0.75", change: "+4.2%", up: true, sub: "History day 5" },
    { label: "Avg P-Score", value: "0.691", change: "+2.8%", up: true, sub: "Across 8 events" },
    { label: "Detection Rate", value: "75.0%", change: "-6.3%", up: false, sub: "6 / 8 detected" },
    { label: "Precursors / Event", value: "6.5", change: "+1.2", up: true, sub: "Avg lead time" },
    { label: "Countries Active", value: "3", change: null, up: true, sub: "AR · MX · BR" },
  ];

  // Sparkline data for each KPI
  const sparks = [
    [0.67, 0.68, 0.74, 0.71, 0.75, 0.75, 0.71, 0.74, 0.67, 0.74],
    [0.55, 0.61, 0.63, 0.68, 0.70, 0.69, 0.72, 0.69, 0.71, 0.69],
    [0.80, 0.78, 0.75, 0.72, 0.75, 0.73, 0.76, 0.75, 0.74, 0.75],
    [4.2, 5.0, 5.5, 6.0, 5.8, 6.2, 6.5, 6.3, 6.6, 6.5],
    [2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
  ];

  return (
    <div>
      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, marginBottom: 32 }}>
        {kpis.map((m, i) => (
          <div key={i} style={{
            paddingLeft: i > 0 ? 24 : 0, paddingRight: 24,
            borderLeft: i > 0 ? `1px solid ${c.divider}` : "none",
          }}>
            <Metric {...m} c={c} />
          </div>
        ))}
      </div>

      <Divider c={c} />

      {/* Sparkline row — compact trend preview for each KPI */}
      <SectionHead title="Trend Overview" subtitle="10-day sparklines for each key metric" c={c} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {kpis.map((m, i) => {
          const data = sparks[i].map((v, j) => ({ d: j, v }));
          const min = Math.min(...sparks[i]);
          const max = Math.max(...sparks[i]);
          return (
            <div key={i}>
              <div style={{ fontSize: 10, color: c.textMut, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
              <ResponsiveContainer width="100%" height={48}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`sp${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c.accent} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[min * 0.9, max * 1.05]} hide />
                  <Area type="monotone" dataKey="v" stroke={c.accent} strokeWidth={1.5} fill={`url(#sp${i})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      <Divider c={c} />

      {/* Quick status summary */}
      <SectionHead title="System Status" subtitle="Pipeline health at a glance" c={c} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {[
          { label: "Document Ingestion", status: "Active", color: c.green },
          { label: "Feature Extraction", status: "Active", color: c.green },
          { label: "Model Inference", status: "Active", color: c.green },
          { label: "Alert Dispatch", status: "Idle", color: c.amber },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}44` }} />
            <span style={{ fontSize: 12, color: c.textSec, fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 10, color: s.color, fontWeight: 600, marginLeft: "auto" }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  PAGE: MODELS  — F1 history, cosine confidence, β sensitivity
// ═══════════════════════════════════════════════════════════════

const PageModels = ({ c }) => {
  const [activeRange, setActiveRange] = useState("10D");

  return (
    <div>
      {/* F1 History */}
      <SectionHead title="F1 Score × History Day" subtitle="Model comparison across lead times" c={c}
        right={<LineLegend items={[
          { name: "nMIL^Δ", color: c.red }, { name: "MI-SVM", color: c.green },
          { name: "rMIL^avg", color: c.amber }, { name: "SVM", color: c.blue },
        ]} c={c} />}
      />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={f1HistoryData}>
          <CartesianGrid stroke={c.chartGrid} vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} tickFormatter={v => `d${v}`} />
          <YAxis domain={[0.2, 0.85]} tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <Tooltip content={<TT c={c} />} />
          <Line type="monotone" dataKey="nMIL" stroke={c.red} strokeWidth={2} dot={{ r: 2.5, fill: c.red }} name="nMIL^Δ" />
          <Line type="monotone" dataKey="MISVM" stroke={c.green} strokeWidth={1.5} dot={{ r: 2, fill: c.green }} name="MI-SVM" />
          <Line type="monotone" dataKey="rMIL" stroke={c.amber} strokeWidth={1.5} dot={{ r: 2, fill: c.amber }} name="rMIL^avg" />
          <Line type="monotone" dataKey="SVM" stroke={c.blue} strokeWidth={1.5} dot={{ r: 2, fill: c.blue }} name="SVM" />
        </LineChart>
      </ResponsiveContainer>

      <Divider c={c} />

      {/* Cosine + Beta side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Cosine confidence */}
        <div>
          <SectionHead title="Relative Cosine Similarity" subtitle="Mean ± confidence band" c={c}
            right={
              <div style={{ display: "flex", gap: 3 }}>
                {["5D", "10D"].map(r => <Pill key={r} label={r} active={activeRange === r} onClick={() => setActiveRange(r)} c={c} />)}
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={cosineTimeSeries}>
              <CartesianGrid stroke={c.chartGrid} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} tickFormatter={v => `d${v}`} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT c={c} />} />
              <Area type="monotone" dataKey="upper" stroke="none" fill={c.accentDim} name="Upper" />
              <Area type="monotone" dataKey="lower" stroke="none" fill={c.bg} name="Lower" />
              <Line type="monotone" dataKey="mean" stroke={c.accent} strokeWidth={2} dot={{ r: 2.5, fill: c.accent }} name="Mean cosine" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Beta sensitivity */}
        <div>
          <SectionHead title="β Sensitivity — Test Accuracy" subtitle="Parameter sweep by country" c={c}
            right={<DotLegend items={[
              { name: "Mexico", color: c.purple }, { name: "Brazil", color: c.green }, { name: "Argentina", color: c.amber },
            ]} c={c} />}
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={betaSensitivity} barGap={1} barCategoryGap="20%">
              <CartesianGrid stroke={c.chartGrid} vertical={false} />
              <XAxis dataKey="beta" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.5, 1]} tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT c={c} fmt={v => v.toFixed(2)} />} />
              <Bar dataKey="MX" fill={c.purple} radius={[2, 2, 0, 0]} name="Mexico" />
              <Bar dataKey="BR" fill={c.green} radius={[2, 2, 0, 0]} name="Brazil" />
              <Bar dataKey="AR" fill={c.amber} radius={[2, 2, 0, 0]} name="Argentina" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  PAGE: EVENTS  — Table, storyline, distribution
// ═══════════════════════════════════════════════════════════════

const PageEvents = ({ c }) => {
  const [country, setCountry] = useState("all");
  const [sortBy, setSortBy] = useState("pScore");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    let d = [...tableData];
    if (country !== "all") d = d.filter(r => r.country.toLowerCase().startsWith(country));
    d.sort((a, b) => sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
    return d;
  }, [country, sortBy, sortDir]);

  const cols = [
    { key: "country", label: "Country" },
    { key: "event", label: "Event" },
    { key: "date", label: "Date" },
    { key: "pScore", label: "P-Score", sortable: true },
    { key: "model", label: "Model" },
    { key: "f1", label: "F1", sortable: true },
    { key: "precursors", label: "Precursors", sortable: true },
    { key: "status", label: "Status" },
  ];

  return (
    <div>
      {/* Precursor Storyline */}
      <SectionHead title="Precursor Storyline — Argentina" subtitle="Escalation toward 2014-08-07 labor protest" c={c}
        right={
          <div style={{ display: "flex", gap: 3 }}>
            {["all", "ar", "mx", "br"].map(cc => (
              <Pill key={cc} label={cc === "all" ? "All" : cc.toUpperCase()} active={country === cc} onClick={() => setCountry(cc)} c={c} />
            ))}
          </div>
        }
      />
      <div style={{ position: "relative", height: 110, marginTop: 8, marginBottom: 8 }}>
        <div style={{ position: "absolute", top: 35, left: 0, right: 0, height: 1, background: c.dividerStrong }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {precursorStoryline.map((node, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              {node.topic
                ? <div style={{ fontSize: 10, fontWeight: 600, color: c.accent, marginBottom: 6, whiteSpace: "nowrap" }}>{node.topic}</div>
                : <div style={{ height: 16 }} />
              }
              <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>{node.score.toFixed(3)}</div>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: node.score > 0.7 ? c.red : node.score > 0.6 ? c.amber : c.accent,
                border: `2px solid ${c.bg}`,
                boxShadow: `0 0 0 2px ${node.score > 0.7 ? c.redDim : node.score > 0.6 ? c.amberDim : c.accentDim}`,
                position: "relative", zIndex: 2,
              }} />
              <div style={{ fontSize: 10, color: c.textMut, marginTop: 6, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{node.date}</div>
              <div style={{ fontSize: 9, color: c.textSec, marginTop: 2, textAlign: "center", maxWidth: 80, lineHeight: 1.3 }}>{node.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider c={c} />

      {/* Score Distribution */}
      <SectionHead title="Score Distribution" subtitle="Positive vs. negative class separation" c={c}
        right={<DotLegend items={[{ name: "Negative", color: c.accent }, { name: "Positive", color: c.green }]} c={c} />}
      />
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={probDistData} barGap={0} barCategoryGap={0}>
          <CartesianGrid stroke={c.chartGrid} vertical={false} />
          <XAxis dataKey="x" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <Tooltip content={<TT c={c} />} />
          <Bar dataKey="Negative" fill={c.accent} opacity={0.45} radius={0} name="Negative" />
          <Bar dataKey="Positive" fill={c.green} opacity={0.6} radius={0} name="Positive" />
        </BarChart>
      </ResponsiveContainer>

      <Divider c={c} />

      {/* Event Detection Table */}
      <SectionHead title="Event Detection Log" subtitle={`${sorted.length} events`} c={c} />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {cols.map(col => (
                <th key={col.key}
                  onClick={() => {
                    if (!col.sortable) return;
                    setSortDir(sortBy === col.key && sortDir === "desc" ? "asc" : "desc");
                    setSortBy(col.key);
                  }}
                  style={{
                    textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 600,
                    color: c.textMut, textTransform: "uppercase", letterSpacing: "0.06em",
                    borderBottom: `1px solid ${c.divider}`,
                    cursor: col.sortable ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none",
                  }}
                >
                  {col.label}{sortBy === col.key && (sortDir === "desc" ? " ↓" : " ↑")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.id}
                style={{ cursor: "pointer", transition: "background 0.08s" }}
                onMouseEnter={e => e.currentTarget.style.background = c.sidebarHi}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "9px 12px", fontSize: 12, color: c.textSec, fontWeight: 500 }}>{row.country}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, color: c.text, fontWeight: 500 }}>{row.event}</td>
                <td style={{ padding: "9px 12px", fontSize: 11, color: c.textMut, fontVariantNumeric: "tabular-nums" }}>{row.date}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 700, color: row.pScore > 0.7 ? c.green : row.pScore > 0.55 ? c.text : c.red, fontVariantNumeric: "tabular-nums" }}>
                  {row.pScore.toFixed(3)}
                </td>
                <td style={{ padding: "9px 12px", fontSize: 11, color: c.textSec, fontFamily: "monospace" }}>{row.model}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: c.text, fontVariantNumeric: "tabular-nums" }}>{row.f1.toFixed(2)}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: c.accent, fontVariantNumeric: "tabular-nums" }}>{row.precursors}</td>
                <td style={{ padding: "9px 12px" }}><StatusDot status={row.status} c={c} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  PLACEHOLDER PAGES
// ═══════════════════════════════════════════════════════════════

const PagePlaceholder = ({ title, c }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: c.textSec }}>{title}</div>
      <div style={{ fontSize: 11, color: c.textMut, marginTop: 4 }}>Coming soon</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  SHELL — Sidebar + Header + Page Router
// ═══════════════════════════════════════════════════════════════

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const c = isDark ? themes.dark : themes.light;

  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "models", icon: BarChart3, label: "Models" },
    { id: "events", icon: Table2, label: "Events" },
    { id: "pipeline", icon: Layers, label: "Pipeline" },
    { id: "countries", icon: Globe, label: "Countries" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const pages = {
    overview: <PageOverview c={c} />,
    models: <PageModels c={c} />,
    events: <PageEvents c={c} />,
    pipeline: <PagePlaceholder title="Pipeline Monitor" c={c} />,
    countries: <PagePlaceholder title="Country Analytics" c={c} />,
    settings: <PagePlaceholder title="Settings" c={c} />,
  };

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100%", background: c.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
      color: c.text, overflow: "hidden",
    }}>
      {/* ── Sidebar ─────────────────────────────── */}
      <div style={{
        width: collapsed ? 52 : 192, background: c.sidebar,
        borderRight: `1px solid ${c.divider}`, display: "flex", flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{
          height: 48, display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "0" : "0 16px", justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: `1px solid ${c.divider}`,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Activity size={11} color="#fff" />
          </div>
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 700, color: c.text, whiteSpace: "nowrap" }}>0a Systems</span>}
        </div>

        <div style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {navItems.map(item => {
            const active = activeNav === item.id;
            return (
              <div key={item.id} onClick={() => setActiveNav(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: collapsed ? "8px 0" : "7px 12px", borderRadius: 7, cursor: "pointer",
                background: active ? c.sidebarHi : "transparent",
                color: active ? c.accent : c.textMut, fontSize: 12, fontWeight: active ? 600 : 500,
                transition: "all 0.12s ease", justifyContent: collapsed ? "center" : "flex-start",
                whiteSpace: "nowrap",
              }}>
                <item.icon size={15} />
                {!collapsed && item.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main ────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", borderBottom: `1px solid ${c.divider}`, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Menu size={15} color={c.textMut} style={{ cursor: "pointer" }} onClick={() => setCollapsed(!collapsed)} />
            <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>
              {navItems.find(n => n.id === activeNav)?.label}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: c.green, letterSpacing: "0.06em", background: c.greenDim, padding: "2px 7px", borderRadius: 4 }}>LIVE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
              borderRadius: 7, border: `1px solid ${c.divider}`, fontSize: 11, color: c.textMut, width: 160,
            }}>
              <Search size={12} /> Search... <span style={{ marginLeft: "auto", fontSize: 9, fontFamily: "monospace", opacity: 0.5 }}>⌘K</span>
            </div>
            <div onClick={() => setIsDark(!isDark)} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: c.textMut, borderRadius: 7 }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </div>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff", cursor: "pointer",
            }}>S</div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 20px 40px" }}>
          {pages[activeNav]}
        </div>
      </div>
    </div>
  );
}
