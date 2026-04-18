"use client";
import { useState, useEffect, type ReactNode } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useTheme, type Theme } from "./ThemeContext";
import { axisProps, tooltipStyle } from "./chart-styles";
import {
  lineData, barData, areaData, radarData, scatterData, composedData,
} from "@/data/homepage";

// ─────────────────────────────── SLIDES ──────────────────────────────────
type Slide = { title: string; caption: string; render: () => ReactNode };

const buildSlides = (theme: Theme): Slide[] => [
  {
    title: "Time-Series Signal Detection",
    caption: "Track precursor signals against baseline across multi-day windows.",
    render: () => (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid stroke={theme.chartGrid} vertical={false} />
          <XAxis dataKey="x" {...axisProps(theme)} tickFormatter={v => `d${v}`} />
          <YAxis {...axisProps(theme)} domain={[0, 1]} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Line type="monotone" dataKey="signal" stroke={theme.accent} strokeWidth={2.5} dot={{ r: 2.5, fill: theme.accent }} />
          <Line type="monotone" dataKey="baseline" stroke={theme.textMut} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
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
          <CartesianGrid stroke={theme.chartGrid} vertical={false} />
          <XAxis dataKey="cat" {...axisProps(theme)} />
          <YAxis {...axisProps(theme)} domain={[0, 1]} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Bar dataKey="value" fill={theme.accent} radius={[3, 3, 0, 0]} />
          <Bar dataKey="compare" fill={theme.textMut} radius={[3, 3, 0, 0]} />
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
              <stop offset="0%" stopColor={theme.accent} stopOpacity={0.6} />
              <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.green} stopOpacity={0.6} />
              <stop offset="100%" stopColor={theme.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.chartGrid} vertical={false} />
          <XAxis dataKey="t" {...axisProps(theme)} />
          <YAxis {...axisProps(theme)} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Area type="monotone" dataKey="negative" stroke={theme.accent} strokeWidth={2} fill="url(#gNeg)" />
          <Area type="monotone" dataKey="positive" stroke={theme.green} strokeWidth={2} fill="url(#gPos)" />
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
          <PolarGrid stroke={theme.chartGrid} />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: theme.textSec }} />
          <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fontSize: 9, fill: theme.textMut }} stroke={theme.chartGrid} />
          <Radar dataKey="benchmark" stroke={theme.textMut} fill={theme.textMut} fillOpacity={0.15} strokeWidth={1.5} />
          <Radar dataKey="model" stroke={theme.accent} fill={theme.accent} fillOpacity={0.35} strokeWidth={2} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
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
          <CartesianGrid stroke={theme.chartGrid} />
          <XAxis type="number" dataKey="x" {...axisProps(theme)} domain={[0, 1]} />
          <YAxis type="number" dataKey="y" {...axisProps(theme)} domain={[0, 1]} />
          <ZAxis type="number" dataKey="z" range={[30, 240]} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Scatter data={scatterData} fill={theme.accent} fillOpacity={0.55} />
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
          <CartesianGrid stroke={theme.chartGrid} vertical={false} />
          <XAxis dataKey="day" {...axisProps(theme)} />
          <YAxis yAxisId="l" {...axisProps(theme)} />
          <YAxis yAxisId="r" orientation="right" domain={[0, 1]} {...axisProps(theme)} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Bar yAxisId="l" dataKey="events" fill={theme.accentDim} radius={[3, 3, 0, 0]} />
          <Line yAxisId="r" type="monotone" dataKey="pScore" stroke={theme.amber} strokeWidth={2.5} dot={{ r: 2.5, fill: theme.amber }} />
        </ComposedChart>
      </ResponsiveContainer>
    ),
  },
];

// ───────────────────────────── COMPONENT ─────────────────────────────────
const CYCLE_MS = 3500;

export default function HomeContent() {
  const { theme } = useTheme();
  const slides = buildSlides(theme);
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
          color: theme.accent,
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
          color: theme.textSec,
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
          background: theme.panel,
          border: `1px solid ${theme.divider}`,
          borderRadius: 14,
          padding: "18px 20px 14px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px ${theme.divider}`,
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
              background: i === idx ? theme.accent : theme.divider,
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
