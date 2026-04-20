"use client";
import { useState } from "react";
import {
  Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Check } from "lucide-react";
import { THEMES, THEME_ORDER, type ThemeId, type Themed } from "./ThemeContext";
import { axisProps } from "./chart-styles";
import {
  SectionHead, LineLegend, DotLegend, Pill, ChartTooltip, Divider,
} from "./primitives";
import {
  f1HistoryData, betaSensitivity, cosineTimeSeries,
} from "@/data/dashboard";
import { KpiStrip } from "./overview/KpiStrip";
import { TrendSparklines } from "./overview/TrendSparklines";
import { SystemStatus } from "./overview/SystemStatus";
import { StorylineTimeline, type CountryFilter } from "./events/StorylineTimeline";
import { ScoreDistribution } from "./events/ScoreDistribution";
import { EventsTable } from "./events/EventsTable";

// Theme comes from ThemeContext (5 palettes defined there).

// ═══════════════════════════════════════════════════════════════
//  PAGE: DASHBOARD  — composes KPI strip, sparklines, system status
// ═══════════════════════════════════════════════════════════════

export const PageDashboard = ({ theme }: Themed) => (
  <div>
    <KpiStrip theme={theme} />
    <Divider theme={theme} />
    <TrendSparklines theme={theme} />
    <Divider theme={theme} />
    <SystemStatus theme={theme} />
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  PAGE: MODELS  — F1 history, cosine confidence, β sensitivity
// ═══════════════════════════════════════════════════════════════

export const PageModels = ({ theme }: Themed) => {
  const [activeRange, setActiveRange] = useState<"5D" | "10D">("10D");

  return (
    <div>
      {/* F1 History */}
      <SectionHead title="F1 Score × History Day" subtitle="Model comparison across lead times" theme={theme}
        right={<LineLegend items={[
          { name: "nMIL^Δ", color: theme.red }, { name: "MI-SVM", color: theme.green },
          { name: "rMIL^avg", color: theme.amber }, { name: "SVM", color: theme.blue },
        ]} theme={theme} />}
      />
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={f1HistoryData}>
          <CartesianGrid stroke={theme.chartGrid} vertical={false} />
          <XAxis dataKey="day" {...axisProps(theme)} tickFormatter={v => `d${v}`} />
          <YAxis domain={[0.2, 0.85]} {...axisProps(theme)} />
          <Tooltip content={<ChartTooltip theme={theme} />} />
          <Line type="monotone" dataKey="nMIL" stroke={theme.red} strokeWidth={2} dot={{ r: 2.5, fill: theme.red }} name="nMIL^Δ" />
          <Line type="monotone" dataKey="MISVM" stroke={theme.green} strokeWidth={1.5} dot={{ r: 2, fill: theme.green }} name="MI-SVM" />
          <Line type="monotone" dataKey="rMIL" stroke={theme.amber} strokeWidth={1.5} dot={{ r: 2, fill: theme.amber }} name="rMIL^avg" />
          <Line type="monotone" dataKey="SVM" stroke={theme.blue} strokeWidth={1.5} dot={{ r: 2, fill: theme.blue }} name="SVM" />
        </LineChart>
      </ResponsiveContainer>

      <Divider theme={theme} />

      {/* Cosine + Beta side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Cosine confidence */}
        <div>
          <SectionHead title="Relative Cosine Similarity" subtitle="Mean ± confidence band" theme={theme}
            right={
              <div style={{ display: "flex", gap: 3 }}>
                {(["5D", "10D"] as const).map(r => <Pill key={r} label={r} active={activeRange === r} onClick={() => setActiveRange(r)} theme={theme} />)}
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={cosineTimeSeries}>
              <CartesianGrid stroke={theme.chartGrid} vertical={false} />
              <XAxis dataKey="day" {...axisProps(theme)} tickFormatter={v => `d${v}`} />
              <YAxis domain={[0, 1]} {...axisProps(theme)} />
              <Tooltip content={<ChartTooltip theme={theme} />} />
              <Area type="monotone" dataKey="upper" stroke="none" fill={theme.accentDim} name="Upper" />
              <Area type="monotone" dataKey="lower" stroke="none" fill={theme.bg} name="Lower" />
              <Line type="monotone" dataKey="mean" stroke={theme.accent} strokeWidth={2} dot={{ r: 2.5, fill: theme.accent }} name="Mean cosine" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Beta sensitivity */}
        <div>
          <SectionHead title="β Sensitivity — Test Accuracy" subtitle="Parameter sweep by country" theme={theme}
            right={<DotLegend items={[
              { name: "Mexico", color: theme.purple }, { name: "Brazil", color: theme.green }, { name: "Argentina", color: theme.amber },
            ]} theme={theme} />}
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={betaSensitivity} barGap={1} barCategoryGap="20%">
              <CartesianGrid stroke={theme.chartGrid} vertical={false} />
              <XAxis dataKey="beta" {...axisProps(theme)} />
              <YAxis domain={[0.5, 1]} {...axisProps(theme)} />
              <Tooltip content={<ChartTooltip theme={theme} fmt={(v) => (v as number).toFixed(2)} />} />
              <Bar dataKey="MX" fill={theme.purple} radius={[2, 2, 0, 0]} name="Mexico" />
              <Bar dataKey="BR" fill={theme.green} radius={[2, 2, 0, 0]} name="Brazil" />
              <Bar dataKey="AR" fill={theme.amber} radius={[2, 2, 0, 0]} name="Argentina" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  PAGE: EVENTS  — composes storyline, distribution, and table
// ═══════════════════════════════════════════════════════════════

export const PageEvents = ({ theme }: Themed) => {
  // Country filter is shared: the pills render inside StorylineTimeline but
  // filter the data in EventsTable.
  const [country, setCountry] = useState<CountryFilter>("all");

  return (
    <div>
      <StorylineTimeline theme={theme} country={country} setCountry={setCountry} />
      <Divider theme={theme} />
      <ScoreDistribution theme={theme} />
      <Divider theme={theme} />
      <EventsTable theme={theme} country={country} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  PLACEHOLDER PAGES
// ═══════════════════════════════════════════════════════════════

export const PagePlaceholder = ({ title, theme }: Themed<{ title: string }>) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: theme.textSec }}>{title}</div>
      <div style={{ fontSize: 11, color: theme.textMut, marginTop: 4 }}>Coming soon</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  PAGE: SETTINGS — Theme picker
// ═══════════════════════════════════════════════════════════════

type SettingsProps = Themed<{
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}>;

export const PageSettings = ({ theme, themeId, setThemeId }: SettingsProps) => {
  return (
    <div>
      <SectionHead title="Theme" subtitle="Choose the color palette for the app" theme={theme} />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 14,
      }}>
        {THEME_ORDER.map(id => {
          const meta = THEMES[id];
          const t = meta.theme;
          const active = themeId === id;
          return (
            <div
              key={id}
              onClick={() => setThemeId(id)}
              style={{
                padding: 0,
                borderRadius: 12,
                cursor: "pointer",
                border: `1.5px solid ${active ? theme.accent : theme.divider}`,
                background: theme.panel,
                overflow: "hidden",
                transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: active ? `0 0 0 3px ${theme.accentDim}` : "none",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = theme.dividerStrong; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = theme.divider; }}
            >
              {/* Swatch strip */}
              <div style={{ display: "flex", height: 56 }}>
                <div style={{ flex: 1, background: t.bg }} />
                <div style={{ flex: 1, background: t.panel }} />
                <div style={{ flex: 1, background: t.accent }} />
                <div style={{ flex: 0.6, background: t.purple }} />
              </div>
              {/* Label */}
              <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{meta.label}</div>
                  <div style={{ fontSize: 10, color: theme.textMut, marginTop: 2 }}>{meta.description}</div>
                </div>
                {active && (
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: theme.accent, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={12} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Dashboard shell removed — AppShell now wraps all pages (including Home)
// for consistent navigation. Page components are exported above.
