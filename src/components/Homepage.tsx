// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useTheme } from "./ThemeContext";

// ───────────────────────────────── DATA ──────────────────────────────────
const lineData = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  signal: 0.35 + 0.4 * Math.sin(i / 2) + (i / 24),
  baseline: 0.3 + (i / 30) + 0.05 * Math.cos(i / 3),
}));

const barData = [
  { cat: "Argentina", value: 0.82, compare: 0.71 },
  { cat: "Mexico", value: 0.89, compare: 0.74 },
  { cat: "Brazil", value: 0.76, compare: 0.68 },
  { cat: "Chile", value: 0.64, compare: 0.59 },
  { cat: "Colombia", value: 0.71, compare: 0.63 },
];

const areaData = Array.from({ length: 20 }, (_, i) => {
  const t = i / 19;
  return {
    t: i,
    positive: Math.round(240 * Math.exp(-Math.pow((t - 0.6) / 0.18, 2))),
    negative: Math.round(320 * Math.exp(-Math.pow((t - 0.35) / 0.15, 2))),
  };
});

const radarData = [
  { metric: "Precision", model: 0.82, benchmark: 0.6 },
  { metric: "Recall", model: 0.75, benchmark: 0.55 },
  { metric: "F1", model: 0.78, benchmark: 0.58 },
  { metric: "AUC", model: 0.88, benchmark: 0.62 },
  { metric: "Lead-time", model: 0.70, benchmark: 0.45 },
  { metric: "Coverage", model: 0.84, benchmark: 0.66 },
];

const scatterData = Array.from({ length: 50 }, () => ({
  x: Math.random(),
  y: 0.3 + 0.6 * Math.random() + 0.2 * Math.random(),
  z: 40 + Math.random() * 200,
}));

const composedData = Array.from({ length: 10 }, (_, i) => ({
  day: `d${i + 1}`,
  events: Math.round(4 + Math.random() * 10),
  pScore: 0.5 + 0.3 * Math.sin(i / 1.7) + 0.1 * Math.random(),
}));

// ─────────────────────────────── SLIDES ──────────────────────────────────
const buildSlides = (c) => [
  {
    title: "Time-Series Signal Detection",
    caption: "Track precursor signals against baseline across multi-day windows.",
    render: () => (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid stroke={c.chartGrid} vertical={false} />
          <XAxis dataKey="x" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} tickFormatter={v => `d${v}`} />
          <YAxis tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} domain={[0, 1]} />
          <Tooltip contentStyle={{ background: c.panel, border: `1px solid ${c.dividerStrong}`, borderRadius: 8, fontSize: 11 }} />
          <Line type="monotone" dataKey="signal" stroke={c.accent} strokeWidth={2.5} dot={{ r: 2.5, fill: c.accent }} />
          <Line type="monotone" dataKey="baseline" stroke={c.textMut} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Country-Level Accuracy",
    caption: "Model performance vs. benchmark across regional event corpora.",
    render: () => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} barGap={4}>
          <CartesianGrid stroke={c.chartGrid} vertical={false} />
          <XAxis dataKey="cat" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} domain={[0, 1]} />
          <Tooltip contentStyle={{ background: c.panel, border: `1px solid ${c.dividerStrong}`, borderRadius: 8, fontSize: 11 }} />
          <Bar dataKey="value" fill={c.accent} radius={[3, 3, 0, 0]} />
          <Bar dataKey="compare" fill={c.textMut} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Class-Score Distribution",
    caption: "Positive vs. negative separation across the decision boundary.",
    render: () => (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.accent} stopOpacity={0.6} />
              <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.green} stopOpacity={0.6} />
              <stop offset="100%" stopColor={c.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.chartGrid} vertical={false} />
          <XAxis dataKey="t" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: c.panel, border: `1px solid ${c.dividerStrong}`, borderRadius: 8, fontSize: 11 }} />
          <Area type="monotone" dataKey="negative" stroke={c.accent} strokeWidth={2} fill="url(#gNeg)" />
          <Area type="monotone" dataKey="positive" stroke={c.green} strokeWidth={2} fill="url(#gPos)" />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Multi-Metric Evaluation",
    caption: "Full evaluation surface — model vs. benchmark across six axes.",
    render: () => (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid stroke={c.chartGrid} />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: c.textSec }} />
          <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fontSize: 9, fill: c.textMut }} stroke={c.chartGrid} />
          <Radar dataKey="benchmark" stroke={c.textMut} fill={c.textMut} fillOpacity={0.15} strokeWidth={1.5} />
          <Radar dataKey="model" stroke={c.accent} fill={c.accent} fillOpacity={0.35} strokeWidth={2} />
          <Tooltip contentStyle={{ background: c.panel, border: `1px solid ${c.dividerStrong}`, borderRadius: 8, fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Feature Correlation",
    caption: "Document-feature density against downstream p-score.",
    render: () => (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid stroke={c.chartGrid} />
          <XAxis type="number" dataKey="x" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} domain={[0, 1]} />
          <YAxis type="number" dataKey="y" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} domain={[0, 1]} />
          <ZAxis type="number" dataKey="z" range={[30, 240]} />
          <Tooltip contentStyle={{ background: c.panel, border: `1px solid ${c.dividerStrong}`, borderRadius: 8, fontSize: 11 }} />
          <Scatter data={scatterData} fill={c.accent} fillOpacity={0.55} />
        </ScatterChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Event Volume × Confidence",
    caption: "Daily event counts overlaid with mean p-score trajectory.",
    render: () => (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={composedData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid stroke={c.chartGrid} vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="l" tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="r" orientation="right" domain={[0, 1]} tick={{ fontSize: 10, fill: c.textMut }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: c.panel, border: `1px solid ${c.dividerStrong}`, borderRadius: 8, fontSize: 11 }} />
          <Bar yAxisId="l" dataKey="events" fill={c.accentDim} radius={[3, 3, 0, 0]} />
          <Line yAxisId="r" type="monotone" dataKey="pScore" stroke={c.amber} strokeWidth={2.5} dot={{ r: 2.5, fill: c.amber }} />
        </ComposedChart>
      </ResponsiveContainer>
    ),
  },
];

// ───────────────────────────── COMPONENT ─────────────────────────────────
const CYCLE_MS = 3500;

export default function HomeContent() {
  const { theme: c } = useTheme();
  const slides = buildSlides(c);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const slide = slides[idx];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px 40px",
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: c.accent,
          marginBottom: 18,
          transition: "color 0.6s ease",
        }}
      >
        Visualized Data Analytics
      </div>

      <h1
        key={`title-${idx}`}
        style={{
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          textAlign: "center",
          margin: 0,
          marginBottom: 10,
          animation: "liquidIn 1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {slide.title}
      </h1>
      <p
        key={`cap-${idx}`}
        style={{
          fontSize: 14,
          color: c.textSec,
          textAlign: "center",
          margin: 0,
          marginBottom: 36,
          maxWidth: 560,
          lineHeight: 1.55,
          animation: "liquidIn 1.05s cubic-bezier(0.16, 1, 0.3, 1) 0.08s backwards",
          transition: "color 0.6s ease",
        }}
      >
        {slide.caption}
      </p>

      <div
        key={`chart-${idx}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          width: "100%",
          height: 380,
          background: c.panel,
          border: `1px solid ${c.divider}`,
          borderRadius: 14,
          padding: "18px 20px 14px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px ${c.divider}`,
          animation: "liquidFade 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
          transition: "background 0.6s ease, border-color 0.6s ease",
        }}
      >
        {slide.render()}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === idx ? c.accent : c.divider,
              cursor: "pointer",
              transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes liquidIn {
          0% { opacity: 0; filter: blur(8px); transform: translateY(10px) scale(0.995); }
          60% { filter: blur(0); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        }
        @keyframes liquidFade {
          0% { opacity: 0; filter: blur(10px); transform: scale(0.992); }
          100% { opacity: 1; filter: blur(0); transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
